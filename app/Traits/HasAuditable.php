<?php

namespace App\Traits;

use App\Models\CmsAuditLog;
use App\Support\SecurityHelper;
use Illuminate\Support\Facades\Auth;

trait HasAuditable
{
    protected static function bootHasAuditable(): void
    {
        // UPDATED: capture field-level old vs. new (only dirty fields)
        static::updated(function ($model) {
            $dirty = $model->getDirty();
            if (empty($dirty)) {
                return;
            }

            $oldValues = [];
            $newValues = [];
            foreach (array_keys($dirty) as $field) {
                $oldValues[$field] = $model->getOriginal($field);
                $newValues[$field] = $model->getAttribute($field);
            }

            // Apply recursive sensitive-key strip BEFORE persisting
            $oldValues = SecurityHelper::stripSensitiveRecursive($oldValues);
            $newValues = SecurityHelper::stripSensitiveRecursive($newValues);
            if (empty($oldValues) && empty($newValues)) {
                return; // nothing meaningful after stripping
            }

            CmsAuditLog::create([
                'user_id' => Auth::id(),
                'action' => 'update',
                'entity_type' => $model->getMorphClass(),
                'entity_id' => $model->getKey(),
                'old_values' => $oldValues,
                'new_values' => $newValues,
                'ip_address' => request()?->ip(),
                'user_agent' => request()?->userAgent(),
            ]);
        });

        // DELETED: full row snapshot (soft-delete writes snapshot with
        // deleted_at included; force-delete writes the same — both are
        // recoverable via the values JSON if DB is restored).
        static::deleted(function ($model) {
            $snapshot = SecurityHelper::stripSensitiveRecursive($model->getAttributes());
            CmsAuditLog::create([
                'user_id' => Auth::id(),
                'action' => 'delete',
                'entity_type' => $model->getMorphClass(),
                'entity_id' => $model->getKey(),
                'old_values' => $snapshot,
                'new_values' => [],
                'ip_address' => request()?->ip(),
                'user_agent' => request()?->userAgent(),
            ]);
        });

        // CREATED: optional — log row creation
        static::created(function ($model) {
            $values = SecurityHelper::stripSensitiveRecursive($model->getAttributes());
            CmsAuditLog::create([
                'user_id' => Auth::id(),
                'action' => 'create',
                'entity_type' => $model->getMorphClass(),
                'entity_id' => $model->getKey(),
                'old_values' => [],
                'new_values' => $values,
                'ip_address' => request()?->ip(),
                'user_agent' => request()?->userAgent(),
            ]);
        });
    }

    /**
     * Recursively strip any key whose name matches a sensitive pattern.
     *
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    protected static function stripSensitiveRecursive(array $data): array
    {
        return SecurityHelper::stripSensitiveRecursive($data);
    }
}
