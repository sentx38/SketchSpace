<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run()
    {
        $categories = [
            ['title' => 'Животные и питомцы', 'code' => 'animals_pets'],
            ['title' => 'Архитектура', 'code' => 'architecture'],
            ['title' => 'Искусство и абстракция', 'code' => 'art_abstract'],
            ['title' => 'Автомобили и транспорт', 'code' => 'cars_vehicles'],
            ['title' => 'Персонажи и существа', 'code' => 'characters_creatures'],
            ['title' => 'Культурное наследие и история', 'code' => 'cultural_heritage_history'],
            ['title' => 'Электроника и гаджеты', 'code' => 'electronics_gadgets'],
            ['title' => 'Мода и стиль', 'code' => 'fashion_style'],
            ['title' => 'Еда и напитки', 'code' => 'food_drink'],
            ['title' => 'Мебель и дом', 'code' => 'furniture_home'],
            ['title' => 'Музыка', 'code' => 'music'],
            ['title' => 'Природа и растения', 'code' => 'nature_plants'],
            ['title' => 'Новости и политика', 'code' => 'news_politics'],
            ['title' => 'Люди', 'code' => 'people'],
            ['title' => 'Места и путешествия', 'code' => 'places_travel'],
            ['title' => 'Наука и технологии', 'code' => 'science_technology'],
            ['title' => 'Спорт и фитнес', 'code' => 'sports_fitness'],
            ['title' => 'Оружие и военное дело', 'code' => 'weapons_military'],
        ];

        DB::table('categories')->insert($categories);
    }
}
