<?php

namespace App\Http\Controllers\API;

use App\Events\CategoryBroadcastEvent;
use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class CategoryController extends Controller
{
    public function index()
    {
        $categories = Category::all(['id', 'title', 'code']); // Получаем id, title и code
        return response()->json($categories);
    }

    public function store(Request $request)
    {
        try {
            $payload = $request->validate([
                'title' => 'required|string|max:255',
                'code' => 'required|string|unique:categories,code',
            ]);

            // Находим минимальный свободный id
            $existingIds = Category::pluck('id')->toArray();
            sort($existingIds);
            $newId = 1;
            foreach ($existingIds as $id) {
                if ($id == $newId) {
                    $newId++;
                } else {
                    break;
                }
            }

            // Создаем категорию с новым id
            $category = new Category($payload);
            $category->id = $newId;
            $category->save();

            CategoryBroadcastEvent::dispatch($category, 'created');

            return response()->json($category, 201);
        } catch (\Exception $err) {
            Log::error("Ошибка создания категории: " . $err->getMessage());
            return response()->json(['message' => 'Ошибка при создании категории'], 500);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $category = Category::findOrFail($id);
            $payload = $request->validate([
                'title' => 'sometimes|string|max:255',
                'code' => 'sometimes|string|unique:categories,code,' . $id,
            ]);

            $category->update($payload);
            CategoryBroadcastEvent::dispatch($category, 'updated');

            return response()->json($category);
        } catch (\Exception $err) {
            Log::error("Ошибка обновления категории: " . $err->getMessage());
            return response()->json(['message' => 'Ошибка при обновлении категории'], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $category = Category::findOrFail($id);
            $category->delete();
            CategoryBroadcastEvent::dispatch($category, 'deleted');

            return response()->json(['message' => 'Категория успешно удалена']);
        } catch (\Exception $err) {
            Log::error("Ошибка удаления категории: " . $err->getMessage());
            return response()->json(['message' => 'Ошибка при удалении категории'], 500);
        }
    }
}
