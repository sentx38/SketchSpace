<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});
Route::get('/get/{user}/models/{model}/{filename}', function ($user, $model, $filename) {
    $path = storage_path("app/public/" . $user . "/models/" . $model . "/" . $filename);
    $response = response()->file($path,['Content-Type'=>'application/octet-stream']);

    return $response;
});
