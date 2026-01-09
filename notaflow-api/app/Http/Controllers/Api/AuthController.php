<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Password;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    /**
     * Registrar nuevo usuario
     */
    public function register(Request $request)
    {
        try {
            $data = $request->json()->all();

            $validator = Validator::make($data, [
                'name' => 'required|string|min:2|max:255',
                'email' => 'required|string|email|max:255|unique:users',
                'password' => 'required|string|min:8|confirmed',
            ], [
                'name.required' => 'El nombre es obligatorio',
                'email.required' => 'El correo electrónico es obligatorio',
                'email.email' => 'El correo electrónico no es válido',
                'email.unique' => 'Este correo ya está registrado',
                'password.required' => 'La contraseña es obligatoria',
                'password.min' => 'La contraseña debe tener al menos 8 caracteres',
                'password.confirmed' => 'Las contraseñas no coinciden',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Error de validación',
                    'errors' => $validator->errors()
                ], 422);
            }

            $user = User::create([
                'name' => $data['name'],
                'email' => $data['email'],
                'password' => Hash::make($data['password']),
            ]);

            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json([
                'status' => 'success',
                'message' => 'Usuario registrado exitosamente',
                'user' => $user,
                'token' => $token,
                'token_type' => 'Bearer'
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Error interno del servidor',
                'error' => env('APP_DEBUG') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Iniciar sesión
     */
    public function login(Request $request)
        {
            try {
                $data = $request->all(); // 👈 CAMBIO CLAVE

                $validator = Validator::make($data, [
                    'email' => 'required|string|email',
                    'password' => 'required|string',
                ], [
                    'email.required' => 'El correo electrónico es obligatorio',
                    'password.required' => 'La contraseña es obligatoria',
                ]);

                if ($validator->fails()) {
                    return response()->json([
                        'status' => 'error',
                        'message' => 'Error de validación',
                        'errors' => $validator->errors()
                    ], 422);
                }

                $user = User::where('email', $data['email'])->first();

                if (!$user || !Hash::check($data['password'], $user->password)) {
                    return response()->json([
                        'status' => 'error',
                        'message' => 'Credenciales incorrectas'
                    ], 401);
                }

                $user->tokens()->delete();
                $token = $user->createToken('auth_token')->plainTextToken;

                return response()->json([
                    'status' => 'success',
                    'message' => 'Inicio de sesión exitoso',
                    'user' => $user,
                    'token' => $token,
                    'token_type' => 'Bearer'
                ]);

            } catch (\Exception $e) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Error interno del servidor',
                    'error' => env('APP_DEBUG') ? $e->getMessage() : null
                ], 500);
            }
        }


    /**
     * Cerrar sesión
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Sesión cerrada'
        ]);
    }

    /**
     * Usuario autenticado
     */
    public function user(Request $request)
    {
        return response()->json([
            'status' => 'success',
            'user' => $request->user()
        ]);
    }

    /**
     * Cambiar contraseña
     */
    public function changePassword(Request $request)
    {
        try {
            $data = $request->json()->all();

            $validator = Validator::make($data, [
                'current_password' => 'required|string',
                'new_password' => 'required|string|min:8|confirmed',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => 'error',
                    'errors' => $validator->errors()
                ], 422);
            }

            $user = $request->user();

            if (!Hash::check($data['current_password'], $user->password)) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Contraseña actual incorrecta'
                ], 422);
            }

            $user->update([
                'password' => Hash::make($data['new_password'])
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Contraseña actualizada'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Error interno',
                'error' => env('APP_DEBUG') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Solicitar reset de contraseña
     */
    public function forgotPassword(Request $request)
    {
        $data = $request->json()->all();

        $validator = Validator::make($data, [
            'email' => 'required|email|exists:users,email',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'errors' => $validator->errors()
            ], 422);
        }

        $status = Password::sendResetLink(['email' => $data['email']]);

        return response()->json([
            'status' => $status === Password::RESET_LINK_SENT ? 'success' : 'error',
            'message' => __($status)
        ]);
    }

    /**
     * Resetear contraseña
     */
    public function resetPassword(Request $request)
    {
        $data = $request->json()->all();

        $validator = Validator::make($data, [
            'token' => 'required',
            'email' => 'required|email',
            'password' => 'required|string|min:8|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'errors' => $validator->errors()
            ], 422);
        }

        $status = Password::reset(
            $data,
            function ($user, $password) {
                $user->forceFill([
                    'password' => Hash::make($password)
                ])->setRememberToken(Str::random(60));

                $user->save();
                event(new PasswordReset($user));
            }
        );

        return response()->json([
            'status' => $status === Password::PASSWORD_RESET ? 'success' : 'error',
            'message' => __($status)
        ]);
    }
}
