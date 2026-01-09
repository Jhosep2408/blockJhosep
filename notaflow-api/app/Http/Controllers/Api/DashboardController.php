<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class DashboardController extends Controller
{
    /**
     * Obtener estadísticas del dashboard
     */
    public function stats(Request $request)
    {
        \Log::info('Obteniendo estadísticas del dashboard', ['user_id' => Auth::id()]);
        
        try {
            $user = Auth::user();
            
            if (!$user) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Usuario no autenticado'
                ], 401);
            }
            
            // Obtener conteos básicos
            $totalNotes = $user->notes()->count();
            $totalTasks = $user->tasks()->count();
            $completedTasks = $user->tasks()->where('status', 'completada')->count();
            $pendingTasks = $totalTasks - $completedTasks;
            
            // Calcular tareas vencidas
            $overdueTasks = $user->tasks()
                ->where('due_date', '<', now()->format('Y-m-d'))
                ->where('status', '!=', 'completada')
                ->count();
            
            // Notas fijadas
            $pinnedNotes = $user->notes()->where('is_pinned', true)->count();
            
            // Calcular tasa de completado
            $completionRate = $totalTasks > 0 ? round(($completedTasks / $totalTasks) * 100, 2) : 0;
            
            \Log::info('Estadísticas calculadas', [
                'totalNotes' => $totalNotes,
                'totalTasks' => $totalTasks,
                'completedTasks' => $completedTasks
            ]);
            
            return response()->json([
                'status' => 'success',
                'message' => 'Estadísticas obtenidas exitosamente',
                'data' => [
                    'totalNotes' => $totalNotes,
                    'totalTasks' => $totalTasks,
                    'completedTasks' => $completedTasks,
                    'pendingTasks' => $pendingTasks,
                    'overdueTasks' => $overdueTasks,
                    'pinnedNotes' => $pinnedNotes,
                    'completionRate' => $completionRate
                ]
            ]);
            
        } catch (\Exception $e) {
            \Log::error('Error al obtener estadísticas: ' . $e->getMessage());
            \Log::error('Trace: ' . $e->getTraceAsString());
            
            return response()->json([
                'status' => 'error',
                'message' => 'Error al obtener estadísticas',
                'error' => env('APP_DEBUG') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Obtener actividad reciente
     */
    public function recentActivity(Request $request)
    {
        try {
            $user = Auth::user();
            $limit = $request->get('limit', 5);
            
            // Obtener notas recientes
            $recentNotes = $user->notes()
                ->orderBy('updated_at', 'desc')
                ->limit($limit)
                ->get()
                ->map(function ($note) {
                    return [
                        'id' => $note->id,
                        'type' => 'note',
                        'title' => $note->title,
                        'action' => $note->created_at == $note->updated_at ? 'creada' : 'actualizada',
                        'priority' => $note->priority,
                        'is_pinned' => $note->is_pinned,
                        'timestamp' => $note->updated_at->format('Y-m-d H:i:s'),
                        'time_ago' => $note->updated_at->diffForHumans()
                    ];
                });
            
            // Obtener tareas recientes
            $recentTasks = $user->tasks()
                ->orderBy('updated_at', 'desc')
                ->limit($limit)
                ->get()
                ->map(function ($task) {
                    return [
                        'id' => $task->id,
                        'type' => 'task',
                        'title' => $task->title,
                        'action' => 'actualizada',
                        'status' => $task->status,
                        'priority' => $task->priority,
                        'due_date' => $task->due_date,
                        'is_overdue' => $task->due_date < now()->format('Y-m-d') && $task->status != 'completada',
                        'timestamp' => $task->updated_at->format('Y-m-d H:i:s'),
                        'time_ago' => $task->updated_at->diffForHumans()
                    ];
                });
            
            // Combinar y ordenar por fecha
            $allActivities = $recentNotes->merge($recentTasks)
                ->sortByDesc('timestamp')
                ->values()
                ->take($limit);
            
            return response()->json([
                'status' => 'success',
                'message' => 'Actividad reciente obtenida',
                'data' => $allActivities
            ]);
            
        } catch (\Exception $e) {
            \Log::error('Error al obtener actividad reciente: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Error al obtener actividad reciente',
                'error' => env('APP_DEBUG') ? $e->getMessage() : null
            ], 500);
        }
    }
}