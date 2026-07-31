<?php

namespace App\Models;

use Database\Factories\NewsletterCampaignFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class NewsletterCampaign extends Model
{
    /** @use HasFactory<NewsletterCampaignFactory> */
    use HasFactory;

    protected $fillable = [
        'subject', 'content', 'status', 'sent_by', 'sent_at',
        'recipient_count', 'sent_count', 'failed_count',
    ];

    protected $casts = [
        'sent_at' => 'datetime',
        'recipient_count' => 'integer',
        'sent_count' => 'integer',
        'failed_count' => 'integer',
    ];

    public function sender()
    {
        return $this->belongsTo(User::class, 'sent_by');
    }
}
