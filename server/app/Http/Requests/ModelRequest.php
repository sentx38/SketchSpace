<?php

namespace App\Http\Requests;

use App\Rules\HdrFile;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Log;

class ModelRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules()
    {
        Log::info('Validation data:', $this->all());
        return [
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'category_id' => 'required|exists:categories,id',
            'file' => 'required|file|mimes:zip,rar',
            'preview_image_url' => 'required|file|mimes:png,jpg,jpeg|max:2048',
            'envMap_url' => ['required', 'file', new HdrFile()],
            'model_glb' => 'required|file|mimes:glb',
        ];
    }

    public function messages()
    {
        return [
            'title.required' => 'Название обязательно',
            'description.required' => 'Описание обязательно',
            'category_id.required' => 'Категория обязательна',
            'file.required' => 'Архив модели обязателен',
            'file.mimes' => 'Архив должен быть в формате .zip или .rar',
            'preview_image_url.required' => 'Превью изображения обязательно',
            'preview_image_url.mimes' => 'Превью должно быть в формате .png, .jpg или .jpeg',
            'preview_image_url.max' => 'Превью не должно превышать 2 МБ',
            'envMap_url.required' => 'Окружение обязательно',
            'envMap_url.mimes' => 'Окружение должно быть в формате .hdr',
            'model_glb.required' => 'Модель обязательна',
        ];
    }
}
