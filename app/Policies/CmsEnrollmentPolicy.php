<?php

namespace App\Policies;

use App\Models\CmsEnrollment;
use App\Models\User;
use App\Services\CmsAuthorizationService;

/**
 * Authorization for CmsEnrollment. Delegates to CmsAuthorizationService so
 * policies and the legacy service agree by construction — the IDORMatrix /
 * S5 regression suites pin the behaviour (Admin/Manager manage everything,
 * teachers only view enrollments in their own subjects).
 */
class CmsEnrollmentPolicy
{
    public function __construct(private CmsAuthorizationService $auth) {}

    public function viewAny(?User $user): bool
    {
        return $this->auth->canManage($user) || $this->auth->isTeacher($user);
    }

    public function view(?User $user, CmsEnrollment $enrollment): bool
    {
        return $this->auth->canWriteGrade($user, $enrollment);
    }

    /**
     * Create/update/delete/approve/reject/withdraw/bulk are manage-only —
     * the same verdict the ad-hoc ensureCanManage() guards used to give.
     */
    public function manage(?User $user): bool
    {
        return $this->auth->canManage($user);
    }
}
