<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('important_dates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('title');
            $table->text('description')->nullable();
            $table->date('date');
            $table->enum('importance', ['baja', 'media', 'alta', 'muy_alta']);
            $table->boolean('has_alarm')->default(false);
            $table->time('alarm_time')->nullable();
            $table->json('alarm_days_before')->nullable(); // Días antes para alarmas
            $table->string('color')->default('#3B82F6');
            $table->boolean('is_recurring')->default(false);
            $table->string('recurring_type')->nullable(); // yearly, monthly, etc
            $table->timestamps();
            
            $table->index(['user_id', 'date']);
            $table->index(['user_id', 'importance']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('important_dates');
    }
};