<?php

namespace App\Models;

use Database\Factories\LeadFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Lead extends Model
{
    /** @use HasFactory<LeadFactory> */
    use HasFactory;

    protected $fillable = [
        'name', 'email', 'phone', 'subject', 'message', 'type', 'status',
    ];
}
