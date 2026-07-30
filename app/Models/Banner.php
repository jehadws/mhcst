<?php

namespace App\Models;

use App\Traits\HasImage;
use Database\Factories\BannerFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Banner extends Model
{
    /** @use HasFactory<BannerFactory> */
    use HasFactory;

    use HasImage;

    protected string $imageField = 'image';

    protected $fillable = [
        'image', 'title', 'subtitle', 'cta_text', 'cta_link', 'sort_order', 'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];
}
