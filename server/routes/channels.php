<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    Log::info(["the user is " => json_encode($user)]);
    return (int) $user->id === (int) $id;
});
