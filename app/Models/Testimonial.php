<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Testimonial extends Model
{
    /** @use HasFactory<\Database\Factories\TestimonialFactory> */
    use HasFactory;

    protected $fillable = [
        'name', 'role_title', 'company', 'photo', 'quote', 'is_published', 'sort_order'
    ];

    protected $casts = [
        'is_published' => 'boolean',
    ];
}
