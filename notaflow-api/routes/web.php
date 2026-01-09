<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "web" middleware group. Make something great!
|
*/

Route::get('/', function () {
    return response()->json([
        'application' => 'NotaFlow API',
        'version' => '1.0.0',
        'status' => 'running',
        'timestamp' => now()->toDateTimeString(),
        'endpoints' => [
            'api' => [
                'base_url' => url('/api'),
                'documentation' => 'https://github.com/tuusuario/notaflow/blob/main/README.md',
                'authentication' => [
                    'POST /api/register' => 'Registrar nuevo usuario',
                    'POST /api/login' => 'Iniciar sesión',
                    'POST /api/logout' => 'Cerrar sesión (requiere token)',
                    'GET /api/user' => 'Obtener usuario actual (requiere token)'
                ],
                'notes' => [
                    'GET /api/notes' => 'Listar notas',
                    'POST /api/notes' => 'Crear nota',
                    'GET /api/notes/{id}' => 'Obtener nota específica',
                    'PUT /api/notes/{id}' => 'Actualizar nota',
                    'DELETE /api/notes/{id}' => 'Eliminar nota'
                ],
                'tasks' => [
                    'GET /api/tasks' => 'Listar tareas',
                    'POST /api/tasks' => 'Crear tarea',
                    'GET /api/tasks/{id}' => 'Obtener tarea específica',
                    'PUT /api/tasks/{id}' => 'Actualizar tarea',
                    'DELETE /api/tasks/{id}' => 'Eliminar tarea',
                    'PATCH /api/tasks/{id}/complete' => 'Marcar tarea como completada'
                ]
            ]
        ]
    ]);
});

Route::get('/test-connection', function () {
    try {
        \DB::connection()->getPdo();
        return response()->json([
            'status' => 'success',
            'message' => 'Conexión a base de datos exitosa'
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'status' => 'error',
            'message' => 'Error de conexión: ' . $e->getMessage()
        ], 500);
    }
});

// Ruta para documentación de la API
Route::get('/api/documentation', function () {
    return response()->json([
        'title' => 'NotaFlow API Documentation',
        'description' => 'API REST para la aplicación de gestión de notas y tareas',
        'version' => '1.0.0',
        'base_url' => url('/api'),
        'authentication' => [
            'method' => 'Bearer Token (Laravel Sanctum)',
            'steps' => [
                '1. Registrar usuario en POST /api/register',
                '2. Iniciar sesión en POST /api/login para obtener token',
                '3. Incluir token en header Authorization: Bearer {token}'
            ]
        ],
        'endpoints' => [
            'auth' => [
                ['method' => 'POST', 'endpoint' => '/register', 'description' => 'Registrar nuevo usuario'],
                ['method' => 'POST', 'endpoint' => '/login', 'description' => 'Iniciar sesión'],
                ['method' => 'POST', 'endpoint' => '/logout', 'description' => 'Cerrar sesión'],
                ['method' => 'GET', 'endpoint' => '/user', 'description' => 'Obtener usuario actual']
            ],
            'notes' => [
                ['method' => 'GET', 'endpoint' => '/notes', 'description' => 'Listar todas las notas', 'query_params' => '?page=1&per_page=10&search=&priority=&is_pinned='],
                ['method' => 'POST', 'endpoint' => '/notes', 'description' => 'Crear nueva nota'],
                ['method' => 'GET', 'endpoint' => '/notes/{id}', 'description' => 'Obtener nota específica'],
                ['method' => 'PUT', 'endpoint' => '/notes/{id}', 'description' => 'Actualizar nota completa'],
                ['method' => 'PATCH', 'endpoint' => '/notes/{id}', 'description' => 'Actualizar parcialmente nota'],
                ['method' => 'DELETE', 'endpoint' => '/notes/{id}', 'description' => 'Eliminar nota']
            ],
            'tasks' => [
                ['method' => 'GET', 'endpoint' => '/tasks', 'description' => 'Listar todas las tareas', 'query_params' => '?page=1&per_page=10&search=&priority=&status=&due_date='],
                ['method' => 'POST', 'endpoint' => '/tasks', 'description' => 'Crear nueva tarea'],
                ['method' => 'GET', 'endpoint' => '/tasks/{id}', 'description' => 'Obtener tarea específica'],
                ['method' => 'PUT', 'endpoint' => '/tasks/{id}', 'description' => 'Actualizar tarea completa'],
                ['method' => 'PATCH', 'endpoint' => '/tasks/{id}', 'description' => 'Actualizar parcialmente tarea'],
                ['method' => 'DELETE', 'endpoint' => '/tasks/{id}', 'description' => 'Eliminar tarea'],
                ['method' => 'PATCH', 'endpoint' => '/tasks/{id}/complete', 'description' => 'Marcar/desmarcar como completada']
            ],
            'dashboard' => [
                ['method' => 'GET', 'endpoint' => '/dashboard/stats', 'description' => 'Obtener estadísticas del dashboard'],
                ['method' => 'GET', 'endpoint' => '/dashboard/recent-activity', 'description' => 'Obtener actividad reciente']
            ]
        ],
        'models' => [
            'note' => [
                'id' => 'integer',
                'user_id' => 'integer',
                'title' => 'string (max: 255)',
                'content' => 'text',
                'priority' => 'enum: baja, media, alta',
                'is_pinned' => 'boolean',
                'created_at' => 'timestamp',
                'updated_at' => 'timestamp'
            ],
            'task' => [
                'id' => 'integer',
                'user_id' => 'integer',
                'title' => 'string (max: 255)',
                'description' => 'text',
                'due_date' => 'date',
                'priority' => 'enum: baja, media, alta',
                'status' => 'enum: pendiente, en_progreso, completada',
                'created_at' => 'timestamp',
                'updated_at' => 'timestamp'
            ]
        ],
        'status_codes' => [
            '200' => 'OK - La solicitud fue exitosa',
            '201' => 'Creado - Recurso creado exitosamente',
            '400' => 'Solicitud incorrecta',
            '401' => 'No autorizado - Token inválido o faltante',
            '403' => 'Prohibido - No tienes permisos',
            '404' => 'No encontrado - Recurso no existe',
            '422' => 'Entidad no procesable - Error de validación',
            '500' => 'Error interno del servidor'
        ]
    ]);
});