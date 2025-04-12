<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SketchModel extends Model
{
    use HasFactory;

    protected $fillable = [
        'author_id',
        'title',
        'description',
        'likes_count',
        'preview_image_url',
        'envMap_url',
        'model_glb_url',
        'file_url',
        'category_id',
    ];

    protected $casts = [
        'price' => 'float',
    ];

    /**
     * Get the author of the model.
     */
    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'author_id', 'id')->select('id', 'name', 'username', 'email', 'profile_image');
    }

    /**
     * Get the category of the model.
     */

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class, 'category_id', 'id')->select('id', 'title', 'code');
    }
}
