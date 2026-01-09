<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

/*
|--------------------------------------------------------------------------
| Console Routes
|--------------------------------------------------------------------------
|
| This file is where you may define all of your Closure based console
| commands. Each Closure is bound to a command instance allowing a
| simple approach to interacting with each command's IO methods.
|
*/

// Comando personalizado para limpiar la base de datos
Artisan::command('notaflow:cleanup', function () {
    $this->info('Iniciando limpieza de la base de datos...');
    
    // Eliminar notas eliminadas hace más de 30 días (soft deletes)
    $deletedNotes = \App\Models\Note::onlyTrashed()
        ->where('deleted_at', '<', now()->subDays(30))
        ->forceDelete();
    
    // Eliminar tareas eliminadas hace más de 30 días (soft deletes)
    $deletedTasks = \App\Models\Task::onlyTrashed()
        ->where('deleted_at', '<', now()->subDays(30))
        ->forceDelete();
    
    // Limpiar tokens expirados
    $expiredTokens = \Laravel\Sanctum\PersonalAccessToken::where('last_used_at', '<', now()->subDays(90))
        ->orWhere('created_at', '<', now()->subDays(90))
        ->delete();
    
    $this->info("Limpieza completada:");
    $this->info("- Notas eliminadas permanentemente: {$deletedNotes}");
    $this->info("- Tareas eliminadas permanentemente: {$deletedTasks}");
    $this->info("- Tokens expirados eliminados: {$expiredTokens}");
})->purpose('Limpiar base de datos de registros antiguos');

// Comando para generar datos de prueba
Artisan::command('notaflow:seed-test {user_id}', function ($user_id) {
    $user = \App\Models\User::find($user_id);
    
    if (!$user) {
        $this->error("Usuario con ID {$user_id} no encontrado.");
        return;
    }
    
    $this->info("Generando datos de prueba para: {$user->name}");
    
    // Crear 10 notas de prueba
    $notes = \App\Models\Note::factory(10)->create([
        'user_id' => $user->id
    ]);
    
    // Crear 15 tareas de prueba
    $tasks = \App\Models\Task::factory(15)->create([
        'user_id' => $user->id
    ]);
    
    $this->info("Datos generados exitosamente:");
    $this->info("- Notas creadas: 10");
    $this->info("- Tareas creadas: 15");
})->purpose('Generar datos de prueba para un usuario');

// Comando para verificar estado del sistema
Artisan::command('notaflow:status', function () {
    $this->info('=== Estado del Sistema NotaFlow ===');
    
    // Verificar conexión a base de datos
    try {
        \DB::connection()->getPdo();
        $this->info('✅ Conexión a base de datos: OK');
        
        // Contar registros
        $users = \App\Models\User::count();
        $notes = \App\Models\Note::count();
        $tasks = \App\Models\Task::count();
        
        $this->info("📊 Estadísticas:");
        $this->info("   👥 Usuarios: {$users}");
        $this->info("   📝 Notas: {$notes}");
        $this->info("   ✅ Tareas: {$tasks}");
        
    } catch (\Exception $e) {
        $this->error('❌ Error de conexión a base de datos: ' . $e->getMessage());
    }
    
    // Verificar almacenamiento
    $storagePath = storage_path();
    $freeSpace = disk_free_space($storagePath);
    $totalSpace = disk_total_space($storagePath);
    $percentUsed = round((($totalSpace - $freeSpace) / $totalSpace) * 100, 2);
    
    $this->info("💾 Almacenamiento:");
    $this->info("   📦 Usado: " . $this->formatBytes($totalSpace - $freeSpace));
    $this->info("   🆓 Libre: " . $this->formatBytes($freeSpace));
    $this->info("   📊 Porcentaje usado: {$percentUsed}%");
    
    // Verificar entorno
    $this->info("⚙️  Entorno:");
    $this->info("   🏷️  APP_ENV: " . env('APP_ENV', 'No configurado'));
    $this->info("   🔗 APP_URL: " . env('APP_URL', 'No configurado'));
    $this->info("   🗄️  DB_CONNECTION: " . env('DB_CONNECTION', 'No configurado'));
    
    $this->info('===================================');
})->purpose('Verificar estado del sistema');

// Función helper para formatear bytes
Artisan::command('notaflow:status', function () {
    // ... código anterior
})->purpose('Verificar estado del sistema');

// Programar tareas automáticas
Schedule::command('notaflow:cleanup')->dailyAt('03:00');
Schedule::command('cache:prune-stale-tags')->hourly();

// Tarea para enviar recordatorios de tareas vencidas
Schedule::call(function () {
    $today = now()->toDateString();
    $overdueTasks = \App\Models\Task::where('due_date', '<', $today)
        ->where('status', '!=', 'completada')
        ->with('user')
        ->get();
    
    foreach ($overdueTasks as $task) {
        // Aquí podrías enviar notificaciones por email
        \Log::info("Tarea vencida: {$task->title} - Usuario: {$task->user->email}");
    }
})->dailyAt('09:00');