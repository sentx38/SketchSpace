<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\ModelRequest;
use App\Models\SketchModel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class ModelController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $models = SketchModel::select(
            "id",
            "author_id",
            "title",
            "description",
            "likes_count",
            "price",
            "preview_image_url",
            "file_url",
            "created_at",
            "end_date",
            "category_id"
        )->with(['author', 'category']) // Включить отношения с автором и категорией
        ->orderByDesc("id")->cursorPaginate(20);

        return response()->json($models);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(ModelRequest $request)
    {
        $payload = $request->validated();
        try {
            $user = $request->user();
            $payload["author_id"] = $user->id;

            // Логируем загруженные файлы
//            Log::debug("Uploaded files:", $request->allFiles());
//            Log::debug("Model FBX file details:", [
//                'name' => $request->file('model_fbx')->getClientOriginalName(),
//                'extension' => $request->file('model_fbx')->getClientOriginalExtension(),
//                'mime_type' => $request->file('model_fbx')->getClientMimeType(),
//            ]);

            // Формируем путь к папке
            $folderPath = "user_{$user->id}/models/model_".time(); // Временный путь, так как ID еще нет

            // Подготавливаем пути к файлам
            $fileUrls = $this->handleFileUpload($request, $folderPath);

            // Добавляем пути к файлам в payload
            $payload = array_merge($payload, $fileUrls);

            // Создаем модель с уже готовыми путями
            $model = SketchModel::create($payload);

            // Обновляем путь к папке с учетом реального ID модели
            $finalFolderPath = "user_{$user->id}/models/model_{$model->id}";
            $this->renameUploadedFiles($folderPath, $finalFolderPath, $model);

            // Загружаем связанные данные
            $model->load(['author', 'category']);

            return response()->json([
                "message" => "Модель успешно создана!",
                "model" => $model
            ], 201);
        } catch (\Exception $err) {
            Log::error("model-error => " . $err->getMessage());
            return response()->json([
                "message" => "Что-то пошло не так. Пожалуйста, попробуйте еще раз!"
            ], 500);
        }
    }

    private function handleFileUpload(Request $request, string $folderPath): array
    {
        $fileUrls = [];

        // Архив модели
        $fileName = 'archive.' . $request->file('file')->getClientOriginalExtension();
        $filePath = $request->file('file')->storeAs($folderPath, $fileName, 'public');
        $fileUrls['file_url'] = Storage::disk('public')->url($filePath);

        // Превью изображения
        $previewName = 'preview.' . $request->file('preview_image_url')->getClientOriginalExtension();
        $previewPath = $request->file('preview_image_url')->storeAs($folderPath, $previewName, 'public');
        $fileUrls['preview_image_url'] = Storage::disk('public')->url($previewPath);

        // Текстура
        $textureName = 'texture.' . $request->file('texture_url')->getClientOriginalExtension();
        $texturePath = $request->file('texture_url')->storeAs($folderPath, $textureName, 'public');
        $fileUrls['texture_url'] = Storage::disk('public')->url($texturePath);

        // FBX модель
        $fbxName = 'model.fbx';
        $fbxPath = $request->file('model_fbx')->storeAs($folderPath, $fbxName, 'public');
        $fileUrls['model_fbx_url'] = Storage::disk('public')->url($fbxPath);

        return $fileUrls;
    }


    private function renameUploadedFiles(string $oldFolderPath, string $newFolderPath, SketchModel $model)
    {
        // Переименовываем папку
        Storage::disk('public')->move($oldFolderPath, $newFolderPath);
        // Обновляем пути в модели
        $fileUrls = [
            'file_url' => Storage::disk('public')->url("$newFolderPath/archive." . pathinfo($model->file_url, PATHINFO_EXTENSION)),
            'preview_image_url' => Storage::disk('public')->url("$newFolderPath/preview." . pathinfo($model->preview_image_url, PATHINFO_EXTENSION)),
            'texture_url' => Storage::disk('public')->url("$newFolderPath/texture." . pathinfo($model->texture_url, PATHINFO_EXTENSION)),
            'model_fbx_url' => Storage::disk('public')->url("$newFolderPath/model.fbx"),
        ];

        $model->update($fileUrls);
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
        //
    }
}
