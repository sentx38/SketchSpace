<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('sketch_models', function (Blueprint $table) {
            $table->id(); // Автоинкрементный ID
            $table->string('title')->unique();
            $table->text('description')->nullable();
            $table->unsignedInteger('likes_count')->default(0); // Поле для количества лайков
            $table->decimal('price', 10, 2)->nullable();
            $table->string('preview_image_url')->nullable();
            $table->string('texture_url')->nullable();
            $table->string('model_fbx_url')->nullable();
            $table->string('file_url'); // Основной файл модели
            $table->foreignId('category_id')->nullable()->constrained('categories')->onDelete('set null');
            $table->date('end_date')->nullable();
            $table->foreignId('author_id')->constrained('users')->onDelete('cascade');
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent();
        });
    }

    public function down()
    {
        Schema::dropIfExists('models');
    }
};
