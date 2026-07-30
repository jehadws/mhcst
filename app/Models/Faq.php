<?php

namespace App\Models;

use Database\Factories\FaqFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Faq extends Model
{
    /** @use HasFactory<FaqFactory> */
    use HasFactory;

    protected $fillable = ['question', 'answer', 'sort_order', 'is_published'];

    protected $casts = [
        'is_published' => 'boolean',
    ];
}
