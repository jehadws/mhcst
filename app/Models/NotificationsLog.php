<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class NotificationsLog extends Model
{
    /** @use HasFactory<\Database\Factories\NotificationsLogFactory> */
    use HasFactory;

    protected $table = 'notifications_logs';

    public $timestamps = false;

    protected $fillable = ['recipient', 'channel', 'template_id', 'status', 'sent_at'];

    protected $casts = [
        'sent_at' => 'datetime',
    ];

    public function template()
    {
        return $this->belongsTo(NotificationTemplate::class, 'template_id');
    }
}
