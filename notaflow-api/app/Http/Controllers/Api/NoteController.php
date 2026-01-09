<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Note;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class NoteController extends Controller
{
    public function index(Request $request)
    {
        try {
            $user = Auth::user();
            
            // Consulta básica
            $query = Note::where('user_id', $user->id);
            
            // Filtros simples
            if ($request->has('search')) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('title', 'like', "%{$search}%")
                      ->orWhere('content', 'like', "%{$search}%");
                });
            }
            
            if ($request->has('priority')) {
                $query->where('priority', $request->priority);
            }
            
            // Paginación simple
            $perPage = $request->get('per_page', 10);
            $notes = $query->orderBy('created_at', 'desc')->paginate($perPage);
            
            return response()->json([
                'status' => 'success',
                'data' => $notes->items(),
                'meta' => [
                    'total' => $notes->total(),
                    'current_page' => $notes->currentPage(),
                    'per_page' => $notes->perPage()
                ]
            ]);
            
        } catch (\Exception $e) {
            \Log::error('NoteController index error: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Error al obtener notas'
            ], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $user = Auth::user();
            
            $validated = $request->validate([
                'title' => 'required|string|max:255',
                'content' => 'required|string',
                'priority' => 'sometimes|in:baja,media,alta',
            ]);
            
            $note = Note::create([
                'user_id' => $user->id,
                'title' => $validated['title'],
                'content' => $validated['content'],
                'priority' => $validated['priority'] ?? 'media',
                'is_pinned' => $request->is_pinned ?? false,
            ]);
            
            return response()->json([
                'status' => 'success',
                'message' => 'Nota creada',
                'data' => $note
            ], 201);
            
        } catch (\Exception $e) {
            \Log::error('NoteController store error: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Error al crear nota'
            ], 500);
        }
    }

    public function show($id)
    {
        try {
            $user = Auth::user();
            $note = Note::where('user_id', $user->id)->find($id);
            
            if (!$note) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Nota no encontrada'
                ], 404);
            }
            
            return response()->json([
                'status' => 'success',
                'data' => $note
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Error al obtener nota'
            ], 500);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $user = Auth::user();
            $note = Note::where('user_id', $user->id)->find($id);
            
            if (!$note) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Nota no encontrada'
                ], 404);
            }
            
            $note->update($request->only(['title', 'content', 'priority', 'is_pinned']));
            
            return response()->json([
                'status' => 'success',
                'message' => 'Nota actualizada',
                'data' => $note
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Error al actualizar nota'
            ], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $user = Auth::user();
            $note = Note::where('user_id', $user->id)->find($id);
            
            if (!$note) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Nota no encontrada'
                ], 404);
            }
            
            $note->delete();
            
            return response()->json([
                'status' => 'success',
                'message' => 'Nota eliminada'
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Error al eliminar nota'
            ], 500);
        }
    }
}