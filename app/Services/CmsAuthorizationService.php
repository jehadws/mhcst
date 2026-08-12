<?php

namespace App\Services;

use App\Enums\UserRole;
use App\Models\CmsEnrollment;
use App\Models\CmsSchedule;
use App\Models\CmsStudent;
use App\Models\CmsSubject;
use App\Models\CmsTeacher;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;

class CmsAuthorizationService
{
    public function canManage(?User $user): bool
    {
        if (! $user) {
            return false;
        }

        return $user->hasAnyRole(UserRole::cmsManageRoles());
    }

    public function isTeacher(?User $user): bool
    {
        if (! $user) {
            return false;
        }

        return $user->hasRole(UserRole::Teacher->value) && ! $this->canManage($user);
    }

    public function ensureCanManage(?User $user): void
    {
        if (! $this->canManage($user)) {
            abort(403, 'You do not have permission to manage academic records.');
        }
    }

    public function teacherProfile(?User $user): ?CmsTeacher
    {
        if (! $user) {
            return null;
        }

        return CmsTeacher::query()->where('user_id', $user->id)->first();
    }

    /**
     * @return list<int>
     */
    public function teacherSubjectIds(?User $user): array
    {
        $teacher = $this->teacherProfile($user);

        if (! $teacher) {
            return [];
        }

        return CmsSchedule::query()
            ->where('teacher_id', $teacher->id)
            ->distinct()
            ->pluck('subject_id')
            ->map(fn ($id) => (int) $id)
            ->values()
            ->all();
    }

    /**
     * @return Collection<int, CmsSubject>
     */
    public function teacherSubjects(?User $user)
    {
        $subjectIds = $this->teacherSubjectIds($user);

        if ($subjectIds === []) {
            return collect();
        }

        return CmsSubject::query()
            ->whereIn('id', $subjectIds)
            ->orderBy('code')
            ->get(['id', 'code', 'name']);
    }

    /**
     * @return list<int>
     */
    public function teacherStudentIds(?User $user): array
    {
        $subjectIds = $this->teacherSubjectIds($user);

        if ($subjectIds === []) {
            return [];
        }

        return CmsEnrollment::query()
            ->whereIn('subject_id', $subjectIds)
            ->where('status', 'active')
            ->distinct()
            ->pluck('student_id')
            ->map(fn ($id) => (int) $id)
            ->values()
            ->all();
    }

    public function scopeSchedulesForUser(Builder $query, ?User $user): Builder
    {
        if (! $this->isTeacher($user)) {
            return $query;
        }

        $teacher = $this->teacherProfile($user);

        if (! $teacher) {
            return $query->whereRaw('1 = 0');
        }

        return $query->where('teacher_id', $teacher->id);
    }

    public function scopeStudentsForUser(Builder $query, ?User $user): Builder
    {
        if (! $this->isTeacher($user)) {
            return $query;
        }

        $studentIds = $this->teacherStudentIds($user);

        if ($studentIds === []) {
            return $query->whereRaw('1 = 0');
        }

        return $query->whereIn('id', $studentIds);
    }

    public function scopeEnrollmentsForUser(Builder $query, ?User $user): Builder
    {
        if (! $this->isTeacher($user)) {
            return $query;
        }

        $subjectIds = $this->teacherSubjectIds($user);

        if ($subjectIds === []) {
            return $query->whereRaw('1 = 0');
        }

        return $query->whereIn('subject_id', $subjectIds);
    }

    public function ensureTeacherCanAccessSubject(?User $user, int $subjectId): void
    {
        if (! $this->isTeacher($user)) {
            return;
        }

        if (! in_array($subjectId, $this->teacherSubjectIds($user), true)) {
            abort(403, 'You are not assigned to this subject.');
        }
    }

    public function ensureTeacherCanAccessEnrollment(?User $user, int $enrollmentId): void
    {
        if (! $this->teacherCanAccessEnrollment($user, $enrollmentId)) {
            abort(403, 'You are not assigned to this class.');
        }
    }

    public function teacherCanAccessEnrollment(?User $user, int $enrollmentId): bool
    {
        if (! $this->isTeacher($user)) {
            return true;
        }

        $enrollment = CmsEnrollment::query()->find($enrollmentId);

        if (! $enrollment) {
            return false;
        }

        return in_array((int) $enrollment->subject_id, $this->teacherSubjectIds($user), true);
    }

    public function ensureTeacherCanViewStudent(?User $user, CmsStudent $student): void
    {
        if (! $this->isTeacher($user)) {
            return;
        }

        if (! in_array($student->id, $this->teacherStudentIds($user), true)) {
            abort(403, 'You can only view students in your classes.');
        }
    }

    public function ensureTeacherCanViewSchedule(?User $user, CmsSchedule $schedule): void
    {
        if (! $this->isTeacher($user)) {
            return;
        }

        $teacher = $this->teacherProfile($user);

        if (! $teacher || (int) $schedule->teacher_id !== (int) $teacher->id) {
            abort(403, 'You can only view your own schedule entries.');
        }
    }

    public function ensureTeacherCanViewEnrollment(?User $user, CmsEnrollment $enrollment): void
    {
        if (! $this->isTeacher($user)) {
            return;
        }

        $this->ensureTeacherCanAccessSubject($user, (int) $enrollment->subject_id);
    }

    /**
     * @return array{canManage: bool, isTeacher: bool}
     */
    public function capabilities(?User $user): array
    {
        return [
            'canManage' => $this->canManage($user),
            'isTeacher' => $this->isTeacher($user),
        ];
    }
}
