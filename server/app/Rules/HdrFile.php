<?php

namespace App\Rules;

use Illuminate\Contracts\Validation\Rule;

class HdrFile implements Rule
{
    public function passes($attribute, $value)
    {
        // Проверяем, что файл существует и имеет правильное расширение
        return $value->isValid() && $value->getClientOriginalExtension() === 'hdr';
    }

    public function message()
    {
        return 'The :attribute must be a valid HDR file.';
    }
}
