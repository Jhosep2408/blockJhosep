<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\NoteController;
use App\Http\Controllers\Api\TaskController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\DashboardController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Rutas públicas (sin autenticación)
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);

// Ruta para verificar estado del servidor
Route::get('/health', function () {
    return response()->json([
        'status' => 'healthy',
        'timestamp' => now()->toDateTimeString(),
        'service' => 'NotaFlow API',
        'version' => '1.0.0'
    ]);
});

// ... dentro del grupo auth:sanctum ...

// Fechas importantes (registradas dentro del grupo protegido más abajo)

// Rutas protegidas con Sanctum
Route::middleware('auth:sanctum')->group(function () {
    // Autenticación
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', function (Request $request) {
        return response()->json([
            'user' => $request->user(),
            'permissions' => [
                'can_create_notes' => true,
                'can_create_tasks' => true,
                'max_notes' => 1000,
                'max_tasks' => 1000
            ]
        ]);
    });

        // Fechas importantes
    Route::apiResource('important-dates', \App\Http\Controllers\Api\ImportantDateController::class);
    Route::get('important-dates/upcoming', [\App\Http\Controllers\Api\ImportantDateController::class, 'upcoming']);
    
 // Perfil de usuario   
    Route::prefix('profile')->group(function () {
        Route::get('/', [UserController::class, 'getProfile']);
        Route::put('/', [UserController::class, 'updateProfile']);
        Route::put('/password', [UserController::class, 'updatePassword']);
        Route::post('/avatar', [UserController::class, 'uploadAvatar']);
        Route::delete('/', [UserController::class, 'deleteAccount']);
        Route::get('/stats', [UserController::class, 'userStats']);
    });

    // Dashboard y estadísticas
    Route::get('/dashboard/stats', [DashboardController::class, 'stats']);
    Route::get('/dashboard/recent-activity', [DashboardController::class, 'recentActivity']);

    // Notas - CRUD completo
    Route::prefix('notes')->group(function () {
        Route::get('/', [NoteController::class, 'index']);
        Route::post('/', [NoteController::class, 'store']);
        Route::get('/{note}', [NoteController::class, 'show']);
        Route::put('/{note}', [NoteController::class, 'update']);
        Route::patch('/{note}', [NoteController::class, 'updatePartial']);
        Route::delete('/{note}', [NoteController::class, 'destroy']);
        
        // Rutas adicionales para notas
        Route::patch('/{note}/pin', [NoteController::class, 'togglePin']);
        Route::get('/search/{query}', [NoteController::class, 'search']);
        Route::post('/{note}/duplicate', [NoteController::class, 'duplicate']);
        Route::get('/priority/{priority}', [NoteController::class, 'getByPriority']);
    });

    // Tareas - CRUD completo
    Route::prefix('tasks')->group(function () {
        Route::get('/', [TaskController::class, 'index']);
        Route::post('/', [TaskController::class, 'store']);
        Route::get('/{task}', [TaskController::class, 'show']);
        Route::put('/{task}', [TaskController::class, 'update']);
        Route::patch('/{task}', [TaskController::class, 'updatePartial']);
        Route::delete('/{task}', [TaskController::class, 'destroy']);
        
        // Rutas adicionales para tareas
        Route::patch('/{task}/complete', [TaskController::class, 'toggleComplete']);
        Route::patch('/{task}/status', [TaskController::class, 'updateStatus']);
        Route::get('/status/{status}', [TaskController::class, 'getByStatus']);
        Route::get('/priority/{priority}', [TaskController::class, 'getByPriority']);
        Route::get('/due/{date}', [TaskController::class, 'getByDueDate']);
        Route::get('/overdue', [TaskController::class, 'getOverdue']);
        Route::get('/upcoming', [TaskController::class, 'getUpcoming']);
    });

    // Usuario
    Route::prefix('user')->group(function () {
        Route::get('/profile', [UserController::class, 'profile']);
        Route::put('/profile', [UserController::class, 'updateProfile']);
        Route::put('/password', [UserController::class, 'updatePassword']);
        Route::get('/stats', [UserController::class, 'userStats']);
    });

    // Exportación de datos
    Route::prefix('export')->group(function () {
        Route::get('/notes/csv', [NoteController::class, 'exportCsv']);
        Route::get('/notes/pdf', [NoteController::class, 'exportPdf']);
        Route::get('/tasks/csv', [TaskController::class, 'exportCsv']);
        Route::get('/tasks/pdf', [TaskController::class, 'exportPdf']);
    });
});

// Ruta fallback para endpoints no encontrados
Route::fallback(function () {
    return response()->json([
        'message' => 'Endpoint no encontrado. Por favor, verifica la URL.',
        'documentation' => '/api/documentation',
        'available_endpoints' => [
            'POST /api/register',
            'POST /api/login',
            'GET /api/health'
        ]
    ], 404);
});