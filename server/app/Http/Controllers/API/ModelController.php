<?php

namespace App\Http\Controllers\API;

use App\Events\ModelBroadCastEvent;
use App\Http\Controllers\Controller;
use App\Http\Requests\ModelRequest;
use App\Models\SketchModel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class ModelController extends Controller
{
    public function index()
    {
        $models = SketchModel::select(
            "id",
            "author_id",
            "title",
            "description",
            "favorite_count",
            "preview_image_url",
            "file_url",
            "model_glb_url",
            "created_at",
            "category_id"
        )
            ->with(['author', 'category'])
            ->orderByDesc("id","asc")
            ->cursorPaginate(20);

        return response()->json($models);
    }

    public function popular(Request $request)
    {
        try {
            $models = SketchModel::select(
                "id",
                "author_id",
                "title",
                "description",
                "favorite_count",
                "preview_image_url",
                "file_url",
                "model_glb_url",
                "created_at",
                "category_id"
            )
                ->with(['author', 'category'])
                ->orderByDesc("favorite_count")
                ->get();

            return response()->json($models);
        } catch (\Exception $e) {
            Log::error("model-popular-error => " . $e->getMessage());
            return response()->json([
                "message" => "Не удалось загрузить популярные модели."
            ], 500);
        }
    }

    public function byCategory(Request $request, string $categoryCode)
    {
        try {
            $query = SketchModel::select(
                "id",
                "author_id",
                "title",
                "description",
                "favorite_count",
                "preview_image_url",
                "file_url",
                "model_glb_url",
                "created_at",
                "category_id"
            )->with(['author', 'category'])
                ->orderByDesc("id");

            if ($categoryCode !== 'all') {
                $query->whereHas('category', function ($q) use ($categoryCode) {
                    $q->where('code', $categoryCode);
                });
            }

            return response()->json($query->cursorPaginate(20));
        } catch (\Exception $e) {
            Log::error("model-category-error => " . $e->getMessage());
            return response()->json(["message" => "Ошибка при загрузке моделей по категории."], 500);
        }
    }

    public function search(Request $request)
    {
        try {
            $query = $request->input('query', '');

            if (empty($query)) {
                return response()->json([
                    "message" => "Пожалуйста, укажите поисковый запрос."
                ], 400);
            }

            $models = SketchModel::select(
                "id",
                "author_id",
                "title",
                "description",
                "favorite_count",
                "preview_image_url",
                "file_url",
                "model_glb_url",
                "created_at",
                "category_id"
            )
                ->with(['author', 'category'])
                ->where('title', 'LIKE', "%{$query}%")
                ->orWhere('description', 'LIKE', "%{$query}%")
                ->orderByDesc("id")
                ->cursorPaginate(20);

            return response()->json($models);
        } catch (\Exception $err) {
            Log::error("model-search-error => " . $err->getMessage());
            return response()->json([
                "message" => "Что-то пошло не так. Пожалуйста, попробуйте еще раз!"
            ], 500);
        }
    }

    public function store(ModelRequest $request)
    {
        Log::info('Request data:', $request->all());
        $payload = $request->validated();
        return DB::transaction(function () use ($request, $payload) {
            try {
                $user = $request->user();
                $payload["author_id"] = $user->id;

                // Находим минимальный свободный id
                $existingIds = SketchModel::pluck('id')->toArray();
                sort($existingIds);
                $newId = 1;
                foreach ($existingIds as $id) {
                    if ($id == $newId) {
                        $newId++;
                    } else {
                        break;
                    }
                }

                $folderPath = "user_{$user->id}/models/model_".time();
                $fileUrls = $this->handleFileUpload($request, $folderPath);
                $payload = array_merge($payload, $fileUrls);

                // Создаем модель с новым id
                $model = new SketchModel($payload);
                $model->id = $newId;
                $model->save();

                $finalFolderPath = "user_{$user->id}/models/model_{$model->id}";
                $this->renameUploadedFiles($folderPath, $finalFolderPath, $model);

                $model->load(['author', 'category']);
                Log::debug("Model with relations after creation:", $model->toArray());

                ModelBroadCastEvent::dispatch($model, 'create');

                return response()->json([
                    "message" => "Модель успешно создана!",
                    "model" => $model
                ], 201);
            } catch (\Exception $err) {
                Log::error("model-error => " . $err->getMessage());
                return response()->json([
                    "message" => "Что-то пошло не так. Пожалуйста, попробуйте еще раз!",
                    "error" => $err->getMessage()
                ], 500);
            }
        });
    }

    private function handleFileUpload(Request $request, string $folderPath): array
    {
        $fileUrls = [];
        $baseUrl = config('app.url'); // Базовый URL из .env (например, http://127.0.0.1:8000)

        // Загружаем основной файл (оставляем /storage)
        if ($request->hasFile('file') && $request->file('file')->isValid()) {
            $fileName = 'archive.' . $request->file('file')->getClientOriginalExtension();
            $filePath = $request->file('file')->storeAs($folderPath, $fileName, 'public');
            $fileUrls['file_url'] = Storage::url($filePath); // Используем /storage
        }

        // Загружаем превью (оставляем /storage)
        if ($request->hasFile('preview_image_url') && $request->file('preview_image_url')->isValid()) {
            $previewName = 'preview.' . $request->file('preview_image_url')->getClientOriginalExtension();
            $previewPath = $request->file('preview_image_url')->storeAs($folderPath, $previewName, 'public');
            $fileUrls['preview_image_url'] = Storage::url($previewPath); // Используем /storage
        }

        // Загружаем envMap (используем /get)
        if ($request->hasFile('envMap_url') && $request->file('envMap_url')->isValid()) {
            $envMapName = 'envMap.' . $request->file('envMap_url')->getClientOriginalExtension();
            $envMapPath = $request->file('envMap_url')->storeAs($folderPath, $envMapName, 'public');
            $fileUrls['envMap_url'] = "$baseUrl/get/$envMapPath"; // Кастомный путь /get
        }

        // Загружаем модель (используем /get)
        if ($request->hasFile('model_glb') && $request->file('model_glb')->isValid()) {
            $modelExtension = $request->file('model_glb')->getClientOriginalExtension();
            $modelName = "model.{$modelExtension}";
            $modelPath = $request->file('model_glb')->storeAs($folderPath, $modelName, 'public');
            $fileUrls['model_glb_url'] = "$baseUrl/get/$modelPath"; // Кастомный путь /get
        }

        Log::debug("Uploaded file URLs:", $fileUrls);
        return $fileUrls;
    }

    private function renameUploadedFiles(string $oldFolderPath, string $newFolderPath, SketchModel $model)
    {
        Storage::disk('public')->move($oldFolderPath, $newFolderPath);
        $baseUrl = config('app.url'); // Базовый URL из .env

        $fileUrls = [
            'file_url' => "$baseUrl/get/$newFolderPath/archive." . pathinfo($model->file_url, PATHINFO_EXTENSION),
            'preview_image_url' => Storage::url("$newFolderPath/preview." . pathinfo($model->preview_image_url, PATHINFO_EXTENSION)),
            'envMap_url' => "$baseUrl/get/$newFolderPath/envMap." . pathinfo($model->envMap_url, PATHINFO_EXTENSION),
            'model_glb_url' => "$baseUrl/get/$newFolderPath/model." . pathinfo($model->model_glb_url, PATHINFO_EXTENSION),
        ];

        Log::debug("Renamed file URLs:", $fileUrls);
        $model->update($fileUrls);
    }

    public function show(string $id)
    {
        try {
            $model = SketchModel::select(
                "id",
                "author_id",
                "title",
                "description",
                "favorite_count",
                "preview_image_url",
                "file_url",
                "model_glb_url",
                "envMap_url",
                "created_at",
                "category_id"
            )
                ->with(['author', 'category'])
                ->findOrFail($id);

            return response()->json($model);
        } catch (\Exception $err) {
            Log::error("model-show-error => " . $err->getMessage());
            return response()->json([
                "message" => "Модель не найдена."
            ], 404);
        }
    }

    public function destroy(Request $request, string $id)
    {
        try {
            $user = $request->user();
            $model = SketchModel::findOrFail($id);

            // Проверяем, является ли пользователь админом или автором модели
            if ($user->role !== 'admin' && $model->author_id !== $user->id) {
                return response()->json([
                    "message" => "У вас нет прав для удаления этой модели."
                ], 403);
            }

            $folderPath = "user_{$model->author_id}/models/model_{$model->id}";

            // Удаляем папку с файлами модели
            if (Storage::disk('public')->exists($folderPath)) {
                Storage::disk('public')->deleteDirectory($folderPath);
                Log::info("Deleted model folder: {$folderPath}");
            }

            // Удаляем модель из базы данных
            $model->delete();

            Log::info("Model deleted: ID={$id}, UserID={$user->id}, Role={$user->role}");
						ModelBroadCastEvent::dispatch($model, 'delete');

            return response()->json([
                "message" => "Модель успешно удалена."
            ], 200);
        } catch (\Exception $err) {
            Log::error("model-delete-error => " . $err->getMessage());
            return response()->json([
                "message" => "Не удалось удалить модель."
            ], 500);
        }
    }
}
