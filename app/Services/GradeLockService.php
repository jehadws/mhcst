<?php

namespace App\Services;

use App\Enums\UserRole;
use App\Models\SiteSetting;
use App\Models\User;
use Carbon\CarbonImmutable;

class GradeLockService
{
    public function isLocked(): bool
    {
        if (SiteSetting::get('cms.grades_locked') === '1') {
            return true;
        }

        $deadline = SiteSetting::get('cms.grade_entry_deadline');

        if (! $deadline) {
            return false;
        }

        return CarbonImmutable::now()->startOfDay()->gt(
            CarbonImmutable::parse($deadline)->endOfDay()
        );
    }

    public function canEditGrades(?User $user): bool
    {
        if (! $this->isLocked()) {
            return true;
        }

        if (! $user) {
            return false;
        }

        return $user->hasRole(UserRole::Admin->value);
    }

    /**
     * @return array{grade_entry_deadline: ?string, grades_locked: bool, is_locked: bool}
     */
    public function settings(): array
    {
        return [
            'grade_entry_deadline' => SiteSetting::get('cms.grade_entry_deadline'),
            'grades_locked' => SiteSetting::get('cms.grades_locked') === '1',
            'is_locked' => $this->isLocked(),
        ];
    }

    public function updateSettings(array $data): void
    {
        SiteSetting::updateOrCreate(
            ['key' => 'cms.grade_entry_deadline'],
            ['value' => $data['grade_entry_deadline'] ?? '', 'type' => 'text']
        );

        SiteSetting::updateOrCreate(
            ['key' => 'cms.grades_locked'],
            ['value' => ($data['grades_locked'] ?? false) ? '1' : '0', 'type' => 'text']
        );
    }
}
