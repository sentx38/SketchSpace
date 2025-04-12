<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Favorite extends Model
{
    use HasFactory;

    protected $fillable = ['user_id', 'model_id'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id', 'id')
            ->select('id', 'name', 'username', 'email', 'profile_image');
    }

    public function model(): BelongsTo
    {
        return $this->belongsTo(SketchModel::class, 'model_id', 'id')
            ->select('id', 'title', 'preview_image_url', 'favorite_count');
    }
}
