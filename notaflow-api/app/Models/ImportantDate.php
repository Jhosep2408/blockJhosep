<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ImportantDate extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'title',
        'description',
        'date',
        'importance',
        'has_alarm',
        'alarm_time',
        'alarm_days_before',
        'color',
        'is_recurring',
        'recurring_type'
    ];

    protected $casts = [
        'date' => 'date',
        'has_alarm' => 'boolean',
        'alarm_days_before' => 'array',
        'is_recurring' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function scopeUpcoming($query, $days = 30)
    {
        return $query->whereBetween('date', [now(), now()->addDays($days)])
                    ->orderBy('date')
                    ->orderByRaw("FIELD(importance, 'muy_alta', 'alta', 'media', 'baja')");
    }
}