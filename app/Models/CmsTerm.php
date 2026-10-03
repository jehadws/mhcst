<?php

namespace App\Models;

use App\Traits\HasAuditable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * An academic term (year + semester) with its dated registration window.
 *
 * Exactly one term is `is_active` at a time — CmsAcademicSettingsService
 * enforces that inside a transaction when the academic settings are saved.
 * The (academic_year, semester) pair is unique; cms_enrollments and
 * cms_schedules point here via the nullable term_id FK while keeping their
 * legacy string columns.
 *
 * @property int $id
 * @property string $academic_year
 * @property string $semester
 * @property Carbon|null $registration_starts_at
 * @property Carbon|null $registration_ends_at
 * @property Carbon|null $add_drop_deadline
 * @property bool $is_active
 */
class CmsTerm extends Model
{
    use HasAuditable;

    protected $fillable = [
        'academic_year',
        'semester',
        'registration_starts_at',
        'registration_ends_at',
        'add_drop_deadline',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'registration_starts_at' => 'date',
            'registration_ends_at' => 'date',
            'add_drop_deadline' => 'date',
            'is_active' => 'boolean',
        ];
    }

    public function enrollments(): HasMany
    {
        return $this->hasMany(CmsEnrollment::class, 'term_id');
    }

    public function schedules(): HasMany
    {
        return $this->hasMany(CmsSchedule::class, 'term_id');
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }
}
