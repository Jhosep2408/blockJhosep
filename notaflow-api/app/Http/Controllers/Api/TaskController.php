<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Task;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class TaskController extends Controller
{
    public function index(Request $request)
    {
        try {
            $user = Auth::user();
            
            // Consulta básica
            $query = Task::where('user_id', $user->id);
            
            // Filtros simples
            if ($request->has('search')) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('title', 'like', "%{$search}%")
                      ->orWhere('description', 'like', "%{$search}%");
                });
            }
            
            if ($request->has('priority')) {
                $query->where('priority', $request->priority);
            }
            
            if ($request->has('status')) {
                $query->where('status', $request->status);
            }
            
            // Paginación simple
            $perPage = $request->get('per_page', 10);
            $tasks = $query->orderBy('created_at', 'desc')->paginate($perPage);
            
            return response()->json([
                'status' => 'success',
                'data' => $tasks->items(),
                'meta' => [
                    'total' => $tasks->total(),
                    'current_page' => $tasks->currentPage(),
                    'per_page' => $tasks->perPage()
                ]
            ]);
            
        } catch (\Exception $e) {
            \Log::error('TaskController index error: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Error al obtener tareas'
            ], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $user = Auth::user();
            
            $validated = $request->validate([
                'title' => 'required|string|max:255',
                'description' => 'nullable|string',
                'due_date' => 'required|date',
                'priority' => 'sometimes|in:baja,media,alta',
                'status' => 'sometimes|in:pendiente,en_progreso,completada',
            ]);
            
            $task = Task::create([
                'user_id' => $user->id,
                'title' => $validated['title'],
                'description' => $validated['description'] ?? null,
                'due_date' => $validated['due_date'],
                'priority' => $validated['priority'] ?? 'media',
                'status' => $validated['status'] ?? 'pendiente',
            ]);
            
            return response()->json([
                'status' => 'success',
                'message' => 'Tarea creada',
                'data' => $task
            ], 201);
            
        } catch (\Exception $e) {
            \Log::error('TaskController store error: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Error al crear tarea'
            ], 500);
        }
    }

    public function show($id)
    {
        try {
            $user = Auth::user();
            $task = Task::where('user_id', $user->id)->find($id);
            
            if (!$task) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Tarea no encontrada'
                ], 404);
            }
            
            return response()->json([
                'status' => 'success',
                'data' => $task
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Error al obtener tarea'
            ], 500);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $user = Auth::user();
            $task = Task::where('user_id', $user->id)->find($id);
            
            if (!$task) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Tarea no encontrada'
                ], 404);
            }
            
            $task->update($request->only(['title', 'description', 'due_date', 'priority', 'status']));
            
            return response()->json([
                'status' => 'success',
                'message' => 'Tarea actualizada',
                'data' => $task
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Error al actualizar tarea'
            ], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $user = Auth::user();
            $task = Task::where('user_id', $user->id)->find($id);
            
            if (!$task) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Tarea no encontrada'
                ], 404);
            }
            
            $task->delete();
            
            return response()->json([
                'status' => 'success',
                'message' => 'Tarea eliminada'
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Error al eliminar tarea'
            ], 500);
        }
    }

    public function complete($id)
    {
        try {
            $user = Auth::user();
            $task = Task::where('user_id', $user->id)->find($id);
            
            if (!$task) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Tarea no encontrada'
                ], 404);
            }
            
            $task->update([
                'status' => 'completada',
                'completed_at' => now()
            ]);
            
            return response()->json([
                'status' => 'success',
                'message' => 'Tarea completada',
                'data' => $task
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Error al completar tarea'
            ], 500);
        }
    }
}