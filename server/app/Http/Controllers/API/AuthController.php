<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\RegisterRequest;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class AuthController extends Controller
{
	public function register(RegisterRequest $request)
	{
		$payload = $request->validated();

		try {
			$payload["password"] = Hash::make($payload["password"]);
			User::create($payload);
			return response()->json([
				"message"=> "Учетная запись зарегестрирована успешно",
			], 200);
		}
		catch (\Exception $err) {
			Log::info("Ошибка регистрации =>".$err->getMessage());
			return response()->json([
                "status"=> 500,
				"message"=> "Что-то пошло не так. Пожалуйста попробуйте заново позже",
			], 500);
		}
	}
	public function login(Request $request)
	{
		$payload = $request->validate([
			"email" => "required|email",
			"password"=> "required",
		]);

		try {
			$user = User::where("email", $payload["email"])->first();
			if ($user)
			{
				// * Проверка пароля
				if (!Hash::check($payload["password"], $user->password)) {
                    return response()->json([
                        "status" => 401,
                        "message" => "Неверное имя пользователя или пароль. Проверьте правильность введенных данных"]);
				}

				$token = $user->createToken("web")->plainTextToken;
				$authRes = array_merge($user->toArray(), ["token" => $token]);
				return response()->json([
                    "status" => 200,
					"message" => "Успешно выполнен вход в систему",
					"user" => $authRes]);
			}
            return response()->json([
                "status" => 401,
                "message" => "Неверное имя пользователя или пароль. Проверьте правильность введенных данных"]);
		}
		catch (\Exception $err) {
            Log::info("user_register_err =>" . $err->getMessage());
			return response()->json([
                "status" => 500,
				"message"=> "Что-то пошло не так. Пожалуйста попробуйте заново позже"], 500);
		}
	}
    public function checkCredentials(Request $request)
    {
        $payload = $request->validate([
            "email" => "required|email",
            "password"=> "required",
        ]);

        try {
            $user = User::where("email", $payload["email"])->first();
            if ($user)
            {
                // * Проверка пароля
                if (!Hash::check($payload["password"], $user->password)) {
                    return response()->json([
                        "status" => 401,
                        "message" => "Неверное имя пользователя или пароль. Проверьте правильность введенных данных"]);
                }

                return response()->json([
                    "status" => 200,
                    "message" => "Успешно выполнен вход в систему"]);
            }
            return response()->json([
                "status" => 401,
                "message" => "Неверное имя пользователя или пароль. Проверьте правильность введенных данных"]);
        }

        catch (\Exception $err) {
            Log::info("Ошибка с учетными данными для входа в систему =>" . $err->getMessage());
            return response()->json([
                "status" => 500,
                "message"=> "Что-то пошло не так. Пожалуйста попробуйте заново позже"], 500);
        }
    }
    public function logout(Request $request){
        try {
            $request->user()->currentAccessToken()->delete();
            return [
                "message" => "Успешный выход",
            ];
        } catch (\Exception $err) {
            Log::info("Ошибка выхода =>" . $err->getMessage());
            return response()->json([
                "status" => 500,
                "message"=> "Что-то пошло не так. Пожалуйста попробуйте заново позже"], 500);
        }
    }
}
