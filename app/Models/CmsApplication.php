<?php

namespace App\Models;

use App\Traits\HasAuditable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Prunable;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CmsApplication extends Model
{
    use HasAuditable, Prunable;

    public const STATUS_DRAFT = 'draft';

    public const STATUS_SUBMITTED = 'submitted';

    public const STATUS_UNDER_REVIEW = 'under_review';

    public const STATUS_ACCEPTED = 'accepted';

    public const STATUS_REJECTED = 'rejected';

    protected $fillable = [
        'user_id',
        'draft_token',
        'department_id',
        'level_id',
        'form_data',
        'status',
        'rejected_reason',
        'submitted_at',
    ];

    protected function casts(): array
    {
        return [
            'form_data' => 'array',
            'submitted_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function department(): BelongsTo
    {
        return $this->belongsTo(CmsDepartment::class, 'department_id');
    }

    public function level(): BelongsTo
    {
        return $this->belongsTo(CmsLevel::class, 'level_id');
    }

    /**
     * The live application for a registered applicant: any row that left the
     * draft stage. Drafts are resolved by cookie token instead.
     */
    public function scopeNotDraft(Builder $query): Builder
    {
        return $query->where('status', '!=', self::STATUS_DRAFT);
    }

    /**
     * Prune cookie-keyed drafts abandoned for more than 60 days. Submitted
     * applications are never pruned.
     */
    public function prunable(): Builder
    {
        return static::query()
            ->where('status', self::STATUS_DRAFT)
            ->where('updated_at', '<', now()->subDays(60));
    }
}
