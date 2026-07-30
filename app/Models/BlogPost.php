<?php

namespace App\Models;

use App\Traits\HasImage;
use Database\Factories\BlogPostFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BlogPost extends Model
{
    /** @use HasFactory<BlogPostFactory> */
    use HasFactory, HasImage;

    protected string $imageField = 'cover_image';

    protected $fillable = [
        'author_id', 'title', 'slug', 'excerpt', 'content', 'cover_image',
        'status', 'published_at', 'seo_title', 'seo_description',
    ];

    protected $casts = [
        'published_at' => 'datetime',
    ];

    public function author()
    {
        return $this->belongsTo(User::class, 'author_id');
    }
}
