<?php

namespace App\Models;

use App\Traits\HasImage;
use Database\Factories\BannerFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Banner extends Model
{
    /** @use HasFactory<BannerFactory> */
    use HasFactory;

    use HasImage, SoftDeletes;

    protected string $imageField = 'image';

    protected $fillable = [
        'image', 'title', 'title_ar', 'subtitle', 'subtitle_ar', 'cta_text', 'cta_text_ar', 'cta_link', 'sort_order', 'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'deleted_at' => 'datetime',
        ];
    }
}
