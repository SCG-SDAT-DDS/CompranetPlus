<?php

//use Illuminate\Support\Facades\Lang;
//trans(Lang::get('messages.request_exito'), [ 'tipo' => 'Búsqueda']);

return [
    'required'    => '¡El valor ":attribute" es requerido!',
    'numeric'    => '¡El valor ":attribute" débe ser un número!',
    'string'    => '¡El valor ":attribute" débe ser un texto!',
    'boolean' => '¡El valor ":attribute" débe ser un booleano!',

    'min' => [
        'numeric' => '¡El ":attribute" débe ser un número minimo de :min.!',
        'string' => '¡El ":attribute" débe ser de una longitud minima de :min caracteres.!'
    ],

    'fields' => [
        'anio' => '¡El valor del "año" es requerido!'
    ]
];
