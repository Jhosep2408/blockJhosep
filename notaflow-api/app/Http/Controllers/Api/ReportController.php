<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class ReportController extends Controller
{
    /**
     * Obtener estadísticas generales
     */
    public function generalStats(Request $request)
    {
        try {
            $user = Auth::user();
            $today = now();
            
            // Estadísticas generales
            $totalNotes = $user->notes()->count();
            $totalTasks = $user->tasks()->count();
            $completedTasks = $user->tasks()->where('status', 'completada')->count();
            $pendingTasks = $totalTasks - $completedTasks;
            $overdueTasks = $user->tasks()
                ->where('due_date', '<', $today->format('Y-m-d'))
                ->where('status', '!=', 'completada')
                ->count();
            
            // Notas por prioridad
            $notesByPriority = [
                'alta' => $user->notes()->where('priority', 'alta')->count(),
                'media' => $user->notes()->where('priority', 'media')->count(),
                'baja' => $user->notes()->where('priority', 'baja')->count(),
            ];
            
            // Tareas por prioridad
            $tasksByPriority = [
                'alta' => $user->tasks()->where('priority', 'alta')->count(),
                'media' => $user->tasks()->where('priority', 'media')->count(),
                'baja' => $user->tasks()->where('priority', 'baja')->count(),
            ];
            
            // Tareas por estado
            $tasksByStatus = [
                'pendiente' => $user->tasks()->where('status', 'pendiente')->count(),
                'en_progreso' => $user->tasks()->where('status', 'en_progreso')->count(),
                'completada' => $completedTasks,
            ];
            
            return response()->json([
                'status' => 'success',
                'data' => [
                    'general' => [
                        'total_notes' => $totalNotes,
                        'total_tasks' => $totalTasks,
                        'completed_tasks' => $completedTasks,
                        'pending_tasks' => $pendingTasks,
                        'overdue_tasks' => $overdueTasks,
                        'completion_rate' => $totalTasks > 0 ? round(($completedTasks / $totalTasks) * 100, 2) : 0,
                    ],
                    'notes_by_priority' => $notesByPriority,
                    'tasks_by_priority' => $tasksByPriority,
                    'tasks_by_status' => $tasksByStatus,
                ]
            ]);
            
        } catch (\Exception $e) {
            \Log::error('ReportController generalStats error: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Error al obtener estadísticas generales'
            ], 500);
        }
    }

    /**
     * Obtener estadísticas por mes
     */
    public function monthlyStats(Request $request)
    {
        try {
            $user = Auth::user();
            $year = $request->get('year', now()->year);
            
        $monthlyData = [];
        
        for ($month = 1; $month <= 12; $month++) {
            $startDate = Carbon::create($year, $month, 1)->startOfMonth();
            $endDate = Carbon::create($year, $month, 1)->endOfMonth();
            
            $monthlyData[$month] = [
                'month' => $startDate->format('F'),
                'notes_created' => $user->notes()
                    ->whereBetween('created_at', [$startDate, $endDate])
                    ->count(),
                'tasks_created' => $user->tasks()
                    ->whereBetween('created_at', [$startDate, $endDate])
                    ->count(),
                'tasks_completed' => $user->tasks()
                    ->where('status', 'completada')
                    ->whereBetween('completed_at', [$startDate, $endDate])
                    ->count(),
                'tasks_pending' => $user->tasks()
                    ->where('status', '!=', 'completada')
                    ->whereBetween('created_at', [$startDate, $endDate])
                    ->count(),
            ];
        }
            
            return response()->json([
                'status' => 'success',
                'data' => [
                    'year' => $year,
                    'monthly_stats' => $monthlyData,
                ]
            ]);
            
        } catch (\Exception $e) {
            \Log::error('ReportController monthlyStats error: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Error al obtener estadísticas mensuales'
            ], 500);
        }
    }

    /**
     * Obtener estadísticas por semana
     */
    public function weeklyStats(Request $request)
    {
        try {
            $user = Auth::user();
            $weeks = $request->get('weeks', 8); // Últimas 8 semanas por defecto
            
            $weeklyData = [];
            $today = now();
            
            for ($i = $weeks - 1; $i >= 0; $i--) {
                $startDate = $today->copy()->subWeeks($i)->startOfWeek();
                $endDate = $today->copy()->subWeeks($i)->endOfWeek();
                $weekLabel = "Semana " . $startDate->format('W') . " (" . $startDate->format('d/m') . ")";
                
                $weeklyData[] = [
                    'week' => $weekLabel,
                    'start_date' => $startDate->format('Y-m-d'),
                    'end_date' => $endDate->format('Y-m-d'),
                    'notes_created' => $user->notes()
                        ->whereBetween('created_at', [$startDate, $endDate])
                        ->count(),
                    'tasks_created' => $user->tasks()
                        ->whereBetween('created_at', [$startDate, $endDate])
                        ->count(),
                    'tasks_completed' => $user->tasks()
                        ->where('status', 'completada')
                        ->whereBetween('completed_at', [$startDate, $endDate])
                        ->count(),
                ];
            }
            
            return response()->json([
                'status' => 'success',
                'data' => [
                    'weeks' => $weeks,
                    'weekly_stats' => $weeklyData,
                ]
            ]);
            
        } catch (\Exception $e) {
            \Log::error('ReportController weeklyStats error: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Error al obtener estadísticas semanales'
            ], 500);
        }
    }

    /**
     * Obtener estadísticas por fecha específica
     */
    public function dateRangeStats(Request $request)
    {
        try {
            $user = Auth::user();
            
            $request->validate([
                'start_date' => 'required|date',
                'end_date' => 'required|date|after_or_equal:start_date',
            ]);
            
            $startDate = Carbon::parse($request->start_date)->startOfDay();
            $endDate = Carbon::parse($request->end_date)->endOfDay();
            
            $notesCreated = $user->notes()
                ->whereBetween('created_at', [$startDate, $endDate])
                ->count();
            
            $tasksCreated = $user->tasks()
                ->whereBetween('created_at', [$startDate, $endDate])
                ->count();
            
            $tasksCompleted = $user->tasks()
                ->where('status', 'completada')
                ->whereBetween('completed_at', [$startDate, $endDate])
                ->count();
            
            $notesByPriority = [
                'alta' => $user->notes()
                    ->where('priority', 'alta')
                    ->whereBetween('created_at', [$startDate, $endDate])
                    ->count(),
                'media' => $user->notes()
                    ->where('priority', 'media')
                    ->whereBetween('created_at', [$startDate, $endDate])
                    ->count(),
                'baja' => $user->notes()
                    ->where('priority', 'baja')
                    ->whereBetween('created_at', [$startDate, $endDate])
                    ->count(),
            ];
            
            $tasksByStatus = [
                'pendiente' => $user->tasks()
                    ->where('status', 'pendiente')
                    ->whereBetween('created_at', [$startDate, $endDate])
                    ->count(),
                'en_progreso' => $user->tasks()
                    ->where('status', 'en_progreso')
                    ->whereBetween('created_at', [$startDate, $endDate])
                    ->count(),
                'completada' => $tasksCompleted,
            ];
            
            return response()->json([
                'status' => 'success',
                'data' => [
                    'date_range' => [
                        'start_date' => $startDate->format('Y-m-d'),
                        'end_date' => $endDate->format('Y-m-d'),
                    ],
                    'stats' => [
                        'notes_created' => $notesCreated,
                        'tasks_created' => $tasksCreated,
                        'tasks_completed' => $tasksCompleted,
                        'completion_rate' => $tasksCreated > 0 ? round(($tasksCompleted / $tasksCreated) * 100, 2) : 0,
                    ],
                    'notes_by_priority' => $notesByPriority,
                    'tasks_by_status' => $tasksByStatus,
                ]
            ]);
            
        } catch (\Exception $e) {
            \Log::error('ReportController dateRangeStats error: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Error al obtener estadísticas por rango de fechas'
            ], 500);
        }
    }

    /**
     * Obtener tendencias (comparación con período anterior)
     */
    public function trends(Request $request)
    {
        try {
            $user = Auth::user();
            $period = $request->get('period', 'month'); // month, week, year
            
            $today = now();
            
            if ($period === 'month') {
                // Comparar este mes vs mes anterior
                $currentStart = $today->copy()->startOfMonth();
                $currentEnd = $today->copy()->endOfMonth();
                $previousStart = $today->copy()->subMonth()->startOfMonth();
                $previousEnd = $today->copy()->subMonth()->endOfMonth();
                
                $currentLabel = $currentStart->format('F Y');
                $previousLabel = $previousStart->format('F Y');
            } elseif ($period === 'week') {
                // Comparar esta semana vs semana anterior
                $currentStart = $today->copy()->startOfWeek();
                $currentEnd = $today->copy()->endOfWeek();
                $previousStart = $today->copy()->subWeek()->startOfWeek();
                $previousEnd = $today->copy()->subWeek()->endOfWeek();
                
                $currentLabel = "Semana " . $currentStart->format('W');
                $previousLabel = "Semana " . $previousStart->format('W');
            } else {
                // Comparar este año vs año anterior
                $currentStart = $today->copy()->startOfYear();
                $currentEnd = $today->copy()->endOfYear();
                $previousStart = $today->copy()->subYear()->startOfYear();
                $previousEnd = $today->copy()->subYear()->endOfYear();
                
                $currentLabel = $currentStart->format('Y');
                $previousLabel = $previousStart->format('Y');
            }
            
            // Estadísticas período actual
            $currentStats = [
                'notes_created' => $user->notes()
                    ->whereBetween('created_at', [$currentStart, $currentEnd])
                    ->count(),
                'tasks_created' => $user->tasks()
                    ->whereBetween('created_at', [$currentStart, $currentEnd])
                    ->count(),
                'tasks_completed' => $user->tasks()
                    ->where('status', 'completada')
                    ->whereBetween('completed_at', [$currentStart, $currentEnd])
                    ->count(),
            ];
            
            // Estadísticas período anterior
            $previousStats = [
                'notes_created' => $user->notes()
                    ->whereBetween('created_at', [$previousStart, $previousEnd])
                    ->count(),
                'tasks_created' => $user->tasks()
                    ->whereBetween('created_at', [$previousStart, $previousEnd])
                    ->count(),
                'tasks_completed' => $user->tasks()
                    ->where('status', 'completada')
                    ->whereBetween('completed_at', [$previousStart, $previousEnd])
                    ->count(),
            ];
            
            // Calcular tendencias
            $trends = [];
            foreach ($currentStats as $key => $currentValue) {
                $previousValue = $previousStats[$key];
                $change = $previousValue > 0 ? round((($currentValue - $previousValue) / $previousValue) * 100, 2) : ($currentValue > 0 ? 100 : 0);
                
                $trends[$key] = [
                    'current' => $currentValue,
                    'previous' => $previousValue,
                    'change' => $change,
                    'direction' => $change >= 0 ? 'up' : 'down',
                    'is_positive' => $change >= 0,
                ];
            }
            
            return response()->json([
                'status' => 'success',
                'data' => [
                    'period' => $period,
                    'current_period' => $currentLabel,
                    'previous_period' => $previousLabel,
                    'trends' => $trends,
                ]
            ]);
            
        } catch (\Exception $e) {
            \Log::error('ReportController trends error: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Error al obtener tendencias'
            ], 500);
        }
    }
}