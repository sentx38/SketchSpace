<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\File;

class ModelRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules()
    {
        return [
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'price' => 'required|numeric|min:0.00',
            'category_id' => 'required|exists:categories,id',
            'end_date' => 'required|date|after:today',
            'file' => 'required|file|mimes:zip,rar|max:10240',
            'preview_image_url' => 'required|file|mimes:png,jpg,jpeg|max:2048',
            'texture_url' => 'required|file|mimes:png,jpg,jpeg|max:2048',
            'model_fbx' => 'required|file|max:10240',
        ];
    }

    public function messages()
    {
        return [
            'title.required' => 'Название обязательно',
            'description.required' => 'Описание обязательно',
            'price.required' => 'Цена обязательна',
            'price.min' => 'Цена должна быть больше 0',
            'category_id.required' => 'Категория обязательна',
            'end_date.required' => 'Дата окончания обязательна',
            'end_date.after' => 'Дата окончания должна быть в будущем',
            'file.required' => 'Архив модели обязателен',
            'preview_image_url.required' => 'Превью изображения обязательно',
            'texture_url.required' => 'Текстура модели обязательна',
            'model_fbx.required' => 'FBX-модель обязательна',
        ];
    }


}
