<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class UserController extends Controller
{
    /**
     * Obtener información del perfil del usuario
     */
    public function getProfile(Request $request)
    {
        try {
            $user = Auth::user();
            
            if (!$user) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Usuario no autenticado'
                ], 401);
            }
            
            \Log::info('Obteniendo perfil del usuario', ['user_id' => $user->id]);
            
            return response()->json([
                'status' => 'success',
                'message' => 'Perfil obtenido exitosamente',
                'data' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone ?? null,
                    'location' => $user->location ?? null,
                    'avatar' => $user->avatar ?? null,
                    'created_at' => $user->created_at ? $user->created_at->format('Y-m-d H:i:s') : null,
                    'updated_at' => $user->updated_at ? $user->updated_at->format('Y-m-d H:i:s') : null
                ]
            ]);
            
        } catch (\Exception $e) {
            \Log::error('Error al obtener perfil: ' . $e->getMessage());
            \Log::error('Trace: ' . $e->getTraceAsString());
            
            return response()->json([
                'status' => 'error',
                'message' => 'Error al obtener información del perfil',
                'error' => env('APP_DEBUG') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Actualizar perfil del usuario
     */
    public function updateProfile(Request $request)
    {
        try {
            $user = Auth::user();
            
            if (!$user) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Usuario no autenticado'
                ], 401);
            }
            
            \Log::info('Actualizando perfil del usuario', [
                'user_id' => $user->id,
                'data' => $request->all()
            ]);
            
            $validator = Validator::make($request->all(), [
                'name' => 'sometimes|required|string|max:255|min:2',
                'email' => 'sometimes|required|string|email|max:255|unique:users,email,' . $user->id,
                'phone' => 'nullable|string|max:20',
                'location' => 'nullable|string|max:255',
                'avatar' => 'nullable|string',
            ], [
                'name.required' => 'El nombre es obligatorio',
                'name.min' => 'El nombre debe tener al menos 2 caracteres',
                'email.required' => 'El correo electrónico es obligatorio',
                'email.email' => 'El correo electrónico no es válido',
                'email.unique' => 'Este correo electrónico ya está en uso',
                'phone.max' => 'El teléfono no puede exceder los 20 caracteres',
                'location.max' => 'La ubicación no puede exceder los 255 caracteres',
            ]);

            if ($validator->fails()) {
                \Log::warning('Validación fallida al actualizar perfil', [
                    'errors' => $validator->errors()->toArray()
                ]);
                
                return response()->json([
                    'status' => 'error',
                    'message' => 'Error de validación',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Actualizar solo los campos proporcionados
            $fieldsUpdated = [];
            
            if ($request->has('name') && $request->name !== $user->name) {
                $user->name = $request->name;
                $fieldsUpdated[] = 'name';
            }
            
            if ($request->has('email') && $request->email !== $user->email) {
                $user->email = $request->email;
                $fieldsUpdated[] = 'email';
            }
            
            if ($request->has('phone')) {
                $user->phone = $request->phone;
                $fieldsUpdated[] = 'phone';
            }
            
            if ($request->has('location')) {
                $user->location = $request->location;
                $fieldsUpdated[] = 'location';
            }
            
            if ($request->has('avatar')) {
                $user->avatar = $request->avatar;
                $fieldsUpdated[] = 'avatar';
            }
            
            if (!empty($fieldsUpdated)) {
                $user->save();
                
                \Log::info('Perfil actualizado exitosamente', [
                    'user_id' => $user->id,
                    'fields_updated' => $fieldsUpdated
                ]);
                
                return response()->json([
                    'status' => 'success',
                    'message' => 'Perfil actualizado exitosamente',
                    'data' => [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                        'phone' => $user->phone,
                        'location' => $user->location,
                        'avatar' => $user->avatar,
                        'updated_at' => $user->updated_at->format('Y-m-d H:i:s')
                    ]
                ]);
            } else {
                return response()->json([
                    'status' => 'info',
                    'message' => 'No se realizaron cambios en el perfil'
                ]);
            }

        } catch (\Exception $e) {
            \Log::error('Error al actualizar perfil: ' . $e->getMessage());
            \Log::error('Trace: ' . $e->getTraceAsString());
            
            return response()->json([
                'status' => 'error',
                'message' => 'Error al actualizar el perfil',
                'error' => env('APP_DEBUG') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Actualizar contraseña del usuario
     */
    public function updatePassword(Request $request)
    {
        try {
            $user = Auth::user();
            
            if (!$user) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Usuario no autenticado'
                ], 401);
            }
            
            \Log::info('Actualizando contraseña del usuario', ['user_id' => $user->id]);
            
            $validator = Validator::make($request->all(), [
                'current_password' => 'required|string|min:6',
                'new_password' => 'required|string|min:8|confirmed',
                'new_password_confirmation' => 'required|string|min:8',
            ], [
                'current_password.required' => 'La contraseña actual es obligatoria',
                'current_password.min' => 'La contraseña actual debe tener al menos 6 caracteres',
                'new_password.required' => 'La nueva contraseña es obligatoria',
                'new_password.min' => 'La nueva contraseña debe tener al menos 8 caracteres',
                'new_password.confirmed' => 'Las contraseñas no coinciden',
                'new_password_confirmation.required' => 'La confirmación de contraseña es obligatoria',
            ]);

            if ($validator->fails()) {
                \Log::warning('Validación fallida al actualizar contraseña', [
                    'errors' => $validator->errors()->toArray()
                ]);
                
                return response()->json([
                    'status' => 'error',
                    'message' => 'Error de validación',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Verificar contraseña actual
            if (!Hash::check($request->current_password, $user->password)) {
                \Log::warning('Contraseña actual incorrecta', ['user_id' => $user->id]);
                
                return response()->json([
                    'status' => 'error',
                    'message' => 'La contraseña actual es incorrecta'
                ], 422);
            }

            // Verificar que la nueva contraseña no sea igual a la actual
            if (Hash::check($request->new_password, $user->password)) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'La nueva contraseña debe ser diferente a la actual'
                ], 422);
            }

            // Actualizar contraseña
            $user->password = Hash::make($request->new_password);
            $user->save();
            
            // Invalida todos los tokens excepto el actual (opcional)
            $user->tokens()->where('id', '!=', $request->user()->currentAccessToken()->id)->delete();
            
            \Log::info('Contraseña actualizada exitosamente', ['user_id' => $user->id]);

            return response()->json([
                'status' => 'success',
                'message' => 'Contraseña actualizada exitosamente'
            ]);

        } catch (\Exception $e) {
            \Log::error('Error al actualizar contraseña: ' . $e->getMessage());
            \Log::error('Trace: ' . $e->getTraceAsString());
            
            return response()->json([
                'status' => 'error',
                'message' => 'Error al actualizar la contraseña',
                'error' => env('APP_DEBUG') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Obtener estadísticas del usuario
     */
    public function userStats(Request $request)
    {
        try {
            $user = Auth::user();
            
            if (!$user) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Usuario no autenticado'
                ], 401);
            }
            
            \Log::info('Obteniendo estadísticas del usuario', ['user_id' => $user->id]);
            
            // Obtener conteos de notas y tareas
            $totalNotes = $user->notes()->count();
            $totalTasks = $user->tasks()->count();
            $completedTasks = $user->tasks()->where('status', 'completada')->count();
            $pendingTasks = $totalTasks - $completedTasks;
            
            // Calcular tasa de completado
            $completionRate = $totalTasks > 0 ? round(($completedTasks / $totalTasks) * 100, 2) : 0;
            
            // Calcular tareas vencidas
            $overdueTasks = $user->tasks()
                ->where('due_date', '<', now()->format('Y-m-d'))
                ->where('status', '!=', 'completada')
                ->count();
            
            // Notas fijadas
            $pinnedNotes = $user->notes()->where('is_pinned', true)->count();
            
            // Tareas por estado
            $tasksByStatus = [
                'pendiente' => $user->tasks()->where('status', 'pendiente')->count(),
                'en_progreso' => $user->tasks()->where('status', 'en_progreso')->count(),
                'completada' => $completedTasks,
            ];
            
            // Notas por prioridad
            $notesByPriority = [
                'alta' => $user->notes()->where('priority', 'alta')->count(),
                'media' => $user->notes()->where('priority', 'media')->count(),
                'baja' => $user->notes()->where('priority', 'baja')->count(),
            ];
            
            \Log::info('Estadísticas calculadas para usuario', [
                'user_id' => $user->id,
                'total_notes' => $totalNotes,
                'total_tasks' => $totalTasks
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Estadísticas obtenidas exitosamente',
                'data' => [
                    'general' => [
                        'total_notes' => $totalNotes,
                        'total_tasks' => $totalTasks,
                        'completed_tasks' => $completedTasks,
                        'pending_tasks' => $pendingTasks,
                        'overdue_tasks' => $overdueTasks,
                        'pinned_notes' => $pinnedNotes,
                        'completion_rate' => $completionRate,
                    ],
                    'tasks_by_status' => $tasksByStatus,
                    'notes_by_priority' => $notesByPriority,
                    'account_info' => [
                        'member_since' => $user->created_at ? $user->created_at->format('M Y') : 'N/A',
                        'notes_created' => $totalNotes,
                        'tasks_completed' => $completedTasks,
                        'productivity_score' => $completionRate,
                    ]
                ]
            ]);
            
        } catch (\Exception $e) {
            \Log::error('Error al obtener estadísticas del usuario: ' . $e->getMessage());
            \Log::error('Trace: ' . $e->getTraceAsString());
            
            return response()->json([
                'status' => 'error',
                'message' => 'Error al obtener estadísticas',
                'error' => env('APP_DEBUG') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Subir avatar del usuario
     */
    public function uploadAvatar(Request $request)
    {
        try {
            $user = Auth::user();
            
            if (!$user) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Usuario no autenticado'
                ], 401);
            }
            
            $validator = Validator::make($request->all(), [
                'avatar' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
            ], [
                'avatar.required' => 'La imagen es obligatoria',
                'avatar.image' => 'El archivo debe ser una imagen',
                'avatar.mimes' => 'La imagen debe ser JPEG, PNG, JPG o GIF',
                'avatar.max' => 'La imagen no debe pesar más de 2MB',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Error de validación',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Eliminar avatar anterior si existe
            if ($user->avatar && file_exists(public_path($user->avatar))) {
                unlink(public_path($user->avatar));
            }

            // Guardar nueva imagen
            $avatarName = 'avatar_' . $user->id . '_' . time() . '.' . $request->avatar->extension();
            $request->avatar->move(public_path('avatars'), $avatarName);
            
            $avatarPath = 'avatars/' . $avatarName;
            $user->avatar = $avatarPath;
            $user->save();

            return response()->json([
                'status' => 'success',
                'message' => 'Avatar actualizado exitosamente',
                'data' => [
                    'avatar_url' => url($avatarPath)
                ]
            ]);

        } catch (\Exception $e) {
            \Log::error('Error al subir avatar: ' . $e->getMessage());
            \Log::error('Trace: ' . $e->getTraceAsString());
            
            return response()->json([
                'status' => 'error',
                'message' => 'Error al subir avatar',
                'error' => env('APP_DEBUG') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Eliminar cuenta de usuario
     */
    public function deleteAccount(Request $request)
    {
        try {
            $user = Auth::user();
            
            if (!$user) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Usuario no autenticado'
                ], 401);
            }
            
            $validator = Validator::make($request->all(), [
                'password' => 'required|string',
            ], [
                'password.required' => 'La contraseña es obligatoria para eliminar la cuenta',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Error de validación',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Verificar contraseña
            if (!Hash::check($request->password, $user->password)) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Contraseña incorrecta'
                ], 422);
            }

            // Eliminar avatar si existe
            if ($user->avatar && file_exists(public_path($user->avatar))) {
                unlink(public_path($user->avatar));
            }

            // Eliminar usuario (esto eliminará en cascada las notas y tareas)
            $user->delete();

            // Revocar todos los tokens
            $user->tokens()->delete();

            \Log::info('Cuenta de usuario eliminada', ['user_id' => $user->id]);

            return response()->json([
                'status' => 'success',
                'message' => 'Cuenta eliminada exitosamente'
            ]);

        } catch (\Exception $e) {
            \Log::error('Error al eliminar cuenta: ' . $e->getMessage());
            \Log::error('Trace: ' . $e->getTraceAsString());
            
            return response()->json([
                'status' => 'error',
                'message' => 'Error al eliminar la cuenta',
                'error' => env('APP_DEBUG') ? $e->getMessage() : null
            ], 500);
        }
    }
}