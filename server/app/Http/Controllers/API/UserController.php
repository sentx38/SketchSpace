<?php

namespace App\Http\Controllers\API;

use App\Events\UserBroadcastEvent;
use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class UserController extends Controller
{
    /**
     * Обновление изображения профиля.
     */
    public function updateProfileImage(Request $request)
    {
        $payload = $request->validate([
            "profile_image" => "nullable|image|mimes:jpeg,png,jpg,gif,svg,webp|max:2048",
            "name" => "nullable|string|max:255",
            "email" => "nullable|email|max:255|unique:users,email," . $request->user()->id,
        ]);

        try {
            $user = $request->user();
            $updates = [];

            if (isset($payload["profile_image"])) {
                $filename = $payload["profile_image"]->store("user_".$user->id."/profile/images");
                $updates["profile_image"] = $filename;
            }
            if (isset($payload["name"])) {
                $updates["name"] = $payload["name"];
            }
            if (isset($payload["email"])) {
                $updates["email"] = $payload["email"];
            }

            if (!empty($updates)) {
                User::where("id", $user->id)->update($updates);
            }

            return response()->json([
                "image" => $updates["profile_image"] ?? $user->profile_image,
                "name" => $updates["name"] ?? $user->name,
                "email" => $updates["email"] ?? $user->email,
            ]);
        } catch (\Exception $err) {
            Log::info("Ошибка обновления профиля =>" . $err->getMessage());
            return response()->json([
                "message" => "Что-то пошло не так. Пожалуйста попробуйте заново позже"
            ], 500);
        }
    }

    /**
     * Получение списка всех пользователей (только для админа).
     */
    public function getUsers(Request $request)
    {
        try {
            $user = $request->user();

            // Проверка роли администратора
            if (!$user->role || $user->role->title !== 'admin') {
                return response()->json([
                    'message' => 'Доступ запрещен. Требуются права администратора.'
                ], 403);
            }

            // Получаем всех пользователей
            $users = User::with('role')
                ->select('id', 'name', 'username', 'email', 'profile_image', 'role_id', "created_at")
                ->get();

            // Форматируем ответ согласно APIResponseType
            $formattedUsers = $users->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'username' => $user->username,
                    'email' => $user->email,
                    'profile_image' => $user->profile_image,
                    'created_at' => $user->created_at,
                    'role' => $user->role ? $user->role->title : null,
                ];
            })->toArray();

            return response()->json([
                'data' => $formattedUsers,
                'path' => $request->path(),
                'per_page' => count($formattedUsers),
                'next_cursor' => null,
                'next_page_url' => null,
                'prev_cursor' => null,
                'prev_page_url' => null,
            ]);
        } catch (\Exception $err) {
            Log::error("Ошибка получения списка пользователей: " . $err->getMessage());
            return response()->json([
                'message' => 'Ошибка при получении списка пользователей'
            ], 500);
        }
    }

    /**
     * Получение списка всех ролей (только для админа).
     */
    public function getRoles(Request $request)
    {
        try {
            $user = $request->user();

            // Проверка роли администратора
            if (!$user->role || $user->role->title !== 'admin') {
                return response()->json([
                    'message' => 'Доступ запрещен. Требуются права администратора.'
                ], 403);
            }

            // Получаем все роли
            $roles = Role::select('id', 'title')->get();

            // Форматируем ответ согласно APIResponseType
            $formattedRoles = $roles->map(function ($role) {
                return [
                    'id' => $role->id,
                    'title' => $role->title,
                ];
            })->toArray();

            return response()->json([
                'data' => $formattedRoles,
                'path' => $request->path(),
                'per_page' => count($formattedRoles),
                'next_cursor' => null,
                'next_page_url' => null,
                'prev_cursor' => null,
                'prev_page_url' => null,
            ]);
        } catch (\Exception $err) {
            Log::error("Ошибка получения списка ролей: " . $err->getMessage());
            return response()->json([
                'message' => 'Ошибка при получении списка ролей'
            ], 500);
        }
    }

    /**
     * Обновление роли пользователя.
     */
    public function updateRole(Request $request, $id)
    {
        try {
            $currentUser = $request->user();
            if (!$currentUser->role || $currentUser->role->title !== 'admin') {
                return response()->json(['message' => 'Доступ запрещен.'], 403);
            }

            $payload = $request->validate([
                'role' => 'required|exists:roles,title'
            ]);

            $user = User::findOrFail($id);
            $role = Role::where('title', $payload['role'])->firstOrFail();
            $user->role_id = $role->id;
            $user->save();

            UserBroadcastEvent::dispatch($user, 'updated');

            return response()->json([
                'data' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'username' => $user->username,
                    'email' => $user->email,
                    'profile_image' => $user->profile_image,
                    'role' => $role->title,
                ],
                'path' => $request->path(),
                'per_page' => 1,
            ]);
        } catch (\Exception $err) {
            Log::error("Ошибка обновления роли: " . $err->getMessage());
            return response()->json(['message' => 'Ошибка при обновлении роли'], 500);
        }
    }

    /**
     * Удаление пользователя.
     */
    public function deleteUser(Request $request, $id)
    {
        try {
            $currentUser = $request->user();
            if (!$currentUser->role || $currentUser->role->title !== 'admin') {
                return response()->json(['message' => 'Доступ запрещен.'], 403);
            }

            $user = User::findOrFail($id);
            if ($user->id === $currentUser->id) {
                return response()->json(['message' => 'Нельзя удалить самого себя'], 400);
            }

            // Удаление директории "user_{id}" из storage
            $folderPath = "user_{$user->id}";
            if (Storage::exists($folderPath)) {
                Storage::deleteDirectory($folderPath);
            }

            $user->delete();
            UserBroadcastEvent::dispatch($user, 'deleted');

            return response()->json([
                'message' => 'Пользователь успешно удален',
                'path' => $request->path(),
                'per_page' => 1,
            ]);
        } catch (\Exception $err) {
            Log::error("Ошибка удаления пользователя: " . $err->getMessage());
            return response()->json(['message' => 'Ошибка при удалении пользователя'], 500);
        }
    }
}
