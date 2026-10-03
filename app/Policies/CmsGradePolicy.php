<?php

namespace App\Policies;

use App\Models\CmsEnrollment;
use App\Models\CmsGrade;
use App\Models\User;
use App\Services\CmsAuthorizationService;

/**
 * Authorization for CmsGrade. Delegates to CmsAuthorizationService so
 * policies and the legacy service agree by construction — the IDORMatrix /
 * S5 regression suites pin the behaviour (Admin/Manager everywhere, teachers
 * only write grades for enrollments in their own subjects).
 */
class CmsGradePolicy
{
    public function __construct(private CmsAuthorizationService $auth) {}

    /**
     * Recording/updating a grade for one enrollment. A missing enrollment
     * denies (the legacy guard answered 403 for unknown ids, not 404).
     */
    public function write(?User $user, ?CmsEnrollment $enrollment): bool
    {
        return $enrollment !== null && $this->auth->canWriteGrade($user, $enrollment);
    }

    /**
     * Import/export/manage-only endpoints — the same verdict the ad-hoc
     * ensureCanManage() guards used to give.
     */
    public function manage(?User $user): bool
    {
        return $this->auth->canManage($user);
    }
}
