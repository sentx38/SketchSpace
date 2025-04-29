<?php

use App\Events\ModelBroadCastEvent;
use App\Events\ModelFavoriteCountEvent;
use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\CategoryController;
use App\Http\Controllers\API\CommentController;
use App\Http\Controllers\API\FavoriteController;
use App\Http\Controllers\API\ModelController;
use App\Http\Controllers\API\UserController;
use App\Models\SketchModel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/checkCredentials', [AuthController::class, 'checkCredentials']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::post("/update/profile", [UserController::class, 'updateProfileImage']);
    Route::get('/users', [UserController::class, 'getUsers']);
    Route::patch('/users/{id}', [UserController::class, 'updateRole']);
    Route::delete('/users/{id}', [UserController::class, 'deleteUser']);
    Route::get('/roles', [UserController::class, 'getRoles']);

    Route::post('/favorites', [FavoriteController::class, 'store']);
    Route::delete('/favorites/{id}', [FavoriteController::class, 'destroy']);
    Route::get('/favorites', [FavoriteController::class, 'index']);
    Route::get('/favorites/status/{modelId}', [FavoriteController::class, 'checkFavoriteStatus']);
    Route::post('/comment', [CommentController::class, 'store']);
    Route::post('/models', [ModelController::class, 'store']);
    Route::delete('/models/{id}', [ModelController::class, 'destroy']);
});

Route::get('/models', [ModelController::class, 'index']);
Route::get('/models/popular', [ModelController::class, 'popular']);
Route::get('/models/search', [ModelController::class, 'search']);
Route::get('/models/category/{code}', [ModelController::class, 'byCategory']);
Route::get('/models/{id}', [ModelController::class, 'show']);
Route::get('/comment', [CommentController::class, 'index']);

// Маршруты для категорий
Route::get('/categories', [CategoryController::class, 'index']);
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/categories', [CategoryController::class, 'store']);
    Route::put('/categories/{id}', [CategoryController::class, 'update']);
    Route::delete('/categories/{id}', [CategoryController::class, 'destroy']);
});

Route::post("/test/channel", function () {
    $model = SketchModel::select("*")->with("author")->orderByDesc("id")->first();
    ModelBroadCastEvent::dispatch($model);
    ModelFavoriteCountEvent::dispatch($model);
    return response()->json(["message" => "Data send to clients"]);
});

Broadcast::routes(["middleware" => ["auth:sanctum"]]);
