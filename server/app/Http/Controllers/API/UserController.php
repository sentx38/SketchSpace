<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class UserController extends Controller
{
    public function updateProfileImage(Request $request)
    {
        $payload = $request->validate([
            "profile_image" => "required|image|mimes:jpeg,png,jpg,gif,svg,webp|max:2048"
        ]);

        try {
            $user = request()->user();
            $filename = $payload["profile_image"]->store("user_".$user->id."/profile/images");
            User::where("id", $user->id)->update(["profile_image" => $filename]);
            return response()->json([
                "image" => $filename,
            ]);
        } catch (\Exception $err) {
            Log::info("Ошибка изображения профиля =>" . $err->getMessage());
            return response()->json([
                "message"=> "Что-то пошло не так. Пожалуйста попробуйте заново позже"], 500);
        }
    }
}
