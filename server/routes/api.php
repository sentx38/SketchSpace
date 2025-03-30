<?php

use App\Events\ModelBroadCastEvent;
use App\Events\TestEvent;
use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\CategoryController;
use App\Http\Controllers\API\ModelController;
use App\Http\Controllers\API\UserController;
use App\Models\SketchModel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [AuthController::class,'logout']);
    Route::post("/update/profile", [UserController::class,'updateProfileImage']);



    Route::apiResources([
        "model" => ModelController::class
    ]);
});



Route::post('/auth/register', [AuthController::class,'register']);
Route::post('/auth/login', [AuthController::class,'login']);
Route::post('/auth/checkCredentials', [AuthController::class,'checkCredentials']);
Route::get('/categories', [CategoryController::class, 'index']); // Новый маршрут для категорий

Route::post("/test/channel", function () {
    $model = SketchModel::select("*")->with("author")->orderByDesc("id")->first();
    //TestEvent::dispatch($model);
    ModelBroadCastEvent::dispatch($model);
    return response()->json(["message" => "Data send to clients"]);
});

Broadcast::routes(["middleware" => ["auth:sanctum"]]);
