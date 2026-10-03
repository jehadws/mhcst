<?php

namespace App\Models;

use App\Traits\HasAuditable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * A student's pick of one subject for one term.
 *
 * Status transitions (all audited via HasAuditable):
 * - pending   created by self-registration or admin create; occupies no seat.
 * - active    admin approves a pending pick (seat-checked, inside the dated window).
 * - dropped   the student self-drops a pending/active pick within the term's
 *             add/drop deadline.
 * - withdrawn admin reject (pending) or admin withdraw with a reason (after
 *             the deadline); frees the subject up for re-registration.
 * - completed end of term (admin edit).
 * A dropped/withdrawn row is re-opened as pending by a later registration for
 * the same term instead of inserting a duplicate (unique per student, subject,
 * year, semester).
 *
 * @property string|null $withdrawn_reason
 */
class CmsEnrollment extends Model
{
    use HasAuditable, SoftDeletes;

    protected $fillable = [
        'student_id',
        'subject_id',
        'academic_year',
        'semester',
        'term_id',
        'enrollment_date',
        'status',
        'source',
        'withdrawn_reason',
    ];

    protected function casts(): array
    {
        return [
            'enrollment_date' => 'date',
            'deleted_at' => 'datetime',
        ];
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(CmsStudent::class, 'student_id');
    }

    public function subject(): BelongsTo
    {
        return $this->belongsTo(CmsSubject::class, 'subject_id');
    }

    public function term(): BelongsTo
    {
        return $this->belongsTo(CmsTerm::class, 'term_id');
    }

    public function grade(): HasOne
    {
        return $this->hasOne(CmsGrade::class, 'enrollment_id');
    }

    public function attendance(): HasMany
    {
        return $this->hasMany(CmsAttendance::class, 'enrollment_id');
    }
}
