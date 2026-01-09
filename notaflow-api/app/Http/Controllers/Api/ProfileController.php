// En tu backend Laravel (App\Http\Controllers\Api\ProfileController.php)
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class ProfileController extends Controller
{
    public function update(Request $request)
    {
        $user = Auth::user();
        
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
            'phone' => 'nullable|string|max:20',
            'location' => 'nullable|string|max:255',
            'current_password' => 'nullable|required_with:new_password',
            'new_password' => 'nullable|min:8|confirmed',
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Error de validación',
                'errors' => $validator->errors()
            ], 422);
        }
        
        try {
            // Actualizar información básica
            $user->name = $request->name;
            $user->email = $request->email;
            $user->phone = $request->phone;
            $user->location = $request->location;
            
            // Actualizar contraseña si se proporciona
            if ($request->filled('current_password')) {
                if (!Hash::check($request->current_password, $user->password)) {
                    return response()->json([
                        'status' => 'error',
                        'message' => 'La contraseña actual es incorrecta'
                    ], 422);
                }
                
                $user->password = Hash::make($request->new_password);
            }
            
            $user->save();
            
            return response()->json([
                'status' => 'success',
                'message' => 'Perfil actualizado correctamente',
                'data' => $user
            ]);
            
        } catch (\Exception $e) {
            \Log::error('Error updating profile: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Error al actualizar perfil'
            ], 500);
        }
    }
}