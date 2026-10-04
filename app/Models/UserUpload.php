<?php

namespace App\Models;

use Database\Factories\UserUploadFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserUpload extends Model
{
    /** @use HasFactory<UserUploadFactory> */
    use HasFactory;

    protected $fillable = ['user_id', 'path'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
