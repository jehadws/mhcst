<?php

namespace App\Models;

use Database\Factories\CmsPageFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CmsPage extends Model
{
    /** @use HasFactory<CmsPageFactory> */
    use HasFactory;

    public $timestamps = false;

    protected $fillable = ['key', 'title', 'content', 'updated_by'];

    protected $casts = [
        'updated_at' => 'datetime',
    ];

    public function updater()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }
}
