<?php

namespace App\Http\Controllers\API;

use App\Events\ModelFavoriteCountEvent;
use App\Http\Controllers\Controller;
use App\Models\Favorite;
use App\Models\SketchModel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class FavoriteController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        // Получение всех избранных моделей для текущего пользователя
        $favorites = Favorite::where('user_id', Auth::id())
            ->with('model') // Подгружаем связанные модели
            ->get();

        return response()->json($favorites);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'model_id' => 'required|exists:sketch_models,id',
        ]);

        $model = SketchModel::find($validated['model_id']);
        if (!$model) {
            return response()->json(['message' => 'Model not found'], 404);
        }

        $favoriteExists = Favorite::where('user_id', Auth::id())
            ->where('model_id', $model->id)
            ->exists();

        if ($favoriteExists) {
            return response()->json(['message' => 'This model is already in favorites'], 400);
        }

        // Находим минимальный свободный id
        $existingIds = Favorite::pluck('id')->toArray();
        sort($existingIds);
        $newId = 1;
        foreach ($existingIds as $id) {
            if ($id == $newId) {
                $newId++;
            } else {
                break;
            }
        }

        // Добавление в избранное с новым id
        $favorite = new Favorite([
            'user_id' => Auth::id(),
            'model_id' => $model->id,
        ]);
        $favorite->id = $newId;
        $favorite->save();

        SketchModel::where("id", $model->id)->increment("favorite_count", 1);
        ModelFavoriteCountEvent::dispatch($model->id);

        return response()->json(['message' => 'Model added to favorites', 'favorite' => $favorite], 201);
    }

    public function checkFavoriteStatus($modelId)
    {
        $model = SketchModel::find($modelId);
        if (!$model) {
            return response()->json(['message' => 'Model not found'], 404);
        }

        $isFavorited = Favorite::where('user_id', Auth::id())
            ->where('model_id', $modelId)
            ->exists();

        return response()->json(['isFavorited' => $isFavorited], 200);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $model = SketchModel::find($id);
        if (!$model) {
            return response()->json(['message' => 'Model not found'], 404);
        }

        // Проверка, есть ли модель в избранном
        $favorite = Favorite::where('user_id', Auth::id())
            ->where('model_id', $model->id)
            ->first();

        if (!$favorite) {
            return response()->json(['message' => 'This model is not in favorites'], 400);
        }

        // Удаление из избранного
        $favorite->delete();
        SketchModel::where("id", $model->id)->decrement("favorite_count", 1);
        ModelFavoriteCountEvent::dispatch($model->id);

        return response()->json(['message' => 'Model removed from favorites'], 200);
    }
}
