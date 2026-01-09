<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ImportantDate;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ImportantDateController extends Controller
{
    // GET: /api/important-dates
    public function index(Request $request)
    {
        $user = $request->user();
        
        $query = ImportantDate::where('user_id', $user->id);
        
        // Filtros
        if ($request->has('upcoming')) {
            $days = $request->get('upcoming', 30);
            $query->where('date', '>=', now()->toDateString())
                  ->where('date', '<=', now()->addDays($days)->toDateString());
        }
        
        if ($request->has('importance')) {
            $query->where('importance', $request->get('importance'));
        }
        
        $perPage = $request->get('per_page', 10);
        $dates = $query->orderBy('date')->orderByRaw("FIELD(importance, 'muy_alta', 'alta', 'media', 'baja')")->get();
        
        return response()->json([
            'success' => true,
            'data' => $dates,
            'message' => 'Fechas importantes obtenidas exitosamente'
        ]);
    }

    // GET: /api/important-dates/upcoming
    public function upcoming(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'No autenticado. Por favor inicia sesión.'
            ], 401);
        }
        $days = $request->get('days', 7);
        
        $dates = ImportantDate::where('user_id', $user->id)
            ->where('date', '>=', now()->toDateString())
            ->where('date', '<=', now()->addDays($days)->toDateString())
            ->orderBy('date')
            ->orderByRaw("FIELD(importance, 'muy_alta', 'alta', 'media', 'baja')")
            ->get();
        
        return response()->json([
            'success' => true,
            'data' => $dates,
            'message' => 'Próximas fechas importantes obtenidas'
        ]);
    }

    // POST: /api/important-dates
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'date' => 'required|date|after_or_equal:today',
            'importance' => 'required|in:baja,media,alta,muy_alta',
            'has_alarm' => 'boolean',
            'alarm_time' => 'nullable|date_format:H:i',
            'alarm_days_before' => 'nullable|array',
            'alarm_days_before.*' => 'integer|min:0|max:365',
            'color' => 'nullable|string|size:7',
            'is_recurring' => 'boolean',
            'recurring_type' => 'nullable|in:yearly,monthly,weekly'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $importanceColors = [
            'baja' => '#10B981',
            'media' => '#F59E0B',
            'alta' => '#EF4444',
            'muy_alta' => '#DC2626'
        ];

        $date = ImportantDate::create([
            'user_id' => $request->user()->id,
            'title' => $request->title,
            'description' => $request->description,
            'date' => $request->date,
            'importance' => $request->importance,
            'has_alarm' => $request->has_alarm ?? false,
            'alarm_time' => $request->alarm_time,
            'alarm_days_before' => $request->alarm_days_before,
            'color' => $request->color ?? ($importanceColors[$request->importance] ?? '#3B82F6'),
            'is_recurring' => $request->is_recurring ?? false,
            'recurring_type' => $request->recurring_type
        ]);

        return response()->json([
            'success' => true,
            'data' => $date,
            'message' => 'Fecha importante creada exitosamente'
        ], 201);
    }

    // GET: /api/important-dates/{id}
    public function show($id)
    {
        $date = ImportantDate::where('user_id', request()->user()->id)->find($id);
        
        if (!$date) {
            return response()->json([
                'success' => false,
                'message' => 'Fecha importante no encontrada'
            ], 404);
        }
        
        return response()->json([
            'success' => true,
            'data' => $date
        ]);
    }

    // PUT/PATCH: /api/important-dates/{id}
    public function update(Request $request, $id)
    {
        $date = ImportantDate::where('user_id', $request->user()->id)->find($id);
        
        if (!$date) {
            return response()->json([
                'success' => false,
                'message' => 'Fecha importante no encontrada'
            ], 404);
        }
        
        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'date' => 'sometimes|date',
            'importance' => 'sometimes|in:baja,media,alta,muy_alta',
            'has_alarm' => 'boolean',
            'alarm_time' => 'nullable|date_format:H:i',
            'alarm_days_before' => 'nullable|array',
            'alarm_days_before.*' => 'integer|min:0|max:365',
            'color' => 'nullable|string|size:7',
            'is_recurring' => 'boolean',
            'recurring_type' => 'nullable|in:yearly,monthly,weekly'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $date->update($request->all());

        return response()->json([
            'success' => true,
            'data' => $date,
            'message' => 'Fecha importante actualizada exitosamente'
        ]);
    }

    // DELETE: /api/important-dates/{id}
    public function destroy($id)
    {
        $date = ImportantDate::where('user_id', request()->user()->id)->find($id);
        
        if (!$date) {
            return response()->json([
                'success' => false,
                'message' => 'Fecha importante no encontrada'
            ], 404);
        }

        $date->delete();

        return response()->json([
            'success' => true,
            'message' => 'Fecha importante eliminada exitosamente'
        ]);
    }
}