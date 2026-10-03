<?php

namespace App\Policies;

use App\Models\CmsStudent;
use App\Models\User;
use App\Services\CmsAuthorizationService;

/**
 * Authorization for CmsStudent. Delegates to CmsAuthorizationService so
 * policies and the legacy service agree by construction — the IDORMatrix /
 * S5 regression suites pin the behaviour (Admin/Manager manage everything,
 * teachers only see students in their own classes).
 */
class CmsStudentPolicy
{
    public function __construct(private CmsAuthorizationService $auth) {}

    public function viewAny(?User $user): bool
    {
        return $this->auth->canManage($user) || $this->auth->isTeacher($user);
    }

    public function view(?User $user, CmsStudent $student): bool
    {
        return $this->auth->canViewStudent($user, $student);
    }

    /**
     * Create/update/delete/import/export are manage-only — the same verdict
     * the ad-hoc ensureCanManage() guards used to give.
     */
    public function manage(?User $user): bool
    {
        return $this->auth->canManage($user);
    }
}
