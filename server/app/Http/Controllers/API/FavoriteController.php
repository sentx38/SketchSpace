<?php

namespace App\Http\Controllers\API;

use App\Events\ModelFavoriteCountEvent;
use App\Http\Controllers\Controller;
use App\Models\Favorite;
use App\Models\SketchModel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class FavoriteController extends Controller
{
    /**
     * Вывод моделей в избранном у пользователя
     */
    public function index()
    {
        try {
            // Получение всех избранных моделей для текущего пользователя
            $favorites = Favorite::where('user_id', Auth::id())
                ->with(['model' => function ($query) {
                    $query->select('id', 'title', 'author_id')
                        ->with(['author' => function ($query) {
                            $query->select('id', 'username');
                        }]);
                }])
                ->get();

            // Преобразуем данные в ожидаемый формат
            $formattedFavorites = $favorites->map(function ($favorite) {
                return [
                    'id' => $favorite->model->id,
                    'title' => $favorite->model->title,
                    'author_id' => $favorite->model->author_id,
                    'author' => $favorite->model->author ? [
                        'username' => $favorite->model->author->username,
                    ] : null,
                ];
            });

            return response()->json([
                'data' => $formattedFavorites,
            ], 200);
        } catch (\Exception $e) {
            Log::error("favorites-error => " . $e->getMessage());
            return response()->json(['message' => 'Ошибка при загрузке избранных моделей.'], 500);
        }
    }

    /**
     * Сохранение модели в избранном
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

    /**
     * Проверка существует ли модель в избрранном у пользователя
     */
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
     * Удаление модели из избранного
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
