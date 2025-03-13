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
        'price',
        'preview_image_url',
        'texture_url',
        'model_fbx_url',
        'file_url',
        'category_id',
        'end_date',
    ];

    protected $casts = [
        'price' => 'float',
        'end_date' => 'date',
    ];

    /**
     * Get the author of the model.
     */
    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'author_id', 'id')->select('id', 'profile_image');
    }

    /**
     * Get the category of the model.
     */

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class, 'category_id', 'id')->select('id', 'title');
    }
}
