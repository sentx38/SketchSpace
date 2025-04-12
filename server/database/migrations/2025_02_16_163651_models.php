<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('sketch_models', function (Blueprint $table) {
            $table->id()->primary();
            $table->string('title')->unique();
            $table->text('description')->nullable();
            $table->unsignedInteger('favorite_count')->default(0);
            $table->string('preview_image_url')->nullable();
            $table->string('envMap_url')->nullable();
            $table->string('model_glb_url')->nullable();
            $table->string('file_url');
            $table->foreignId('category_id')->nullable()->constrained('categories')->onDelete('set null');
            $table->foreignId('author_id')->constrained('users')->onDelete('cascade');
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent();
        });
    }

    public function down()
    {
        Schema::dropIfExists('sketch_models');
    }
};
