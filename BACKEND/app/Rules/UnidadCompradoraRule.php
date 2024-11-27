<?php
namespace App\Rules;

use Illuminate\Contracts\Validation\Rule;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Lang;

class UnidadCompradoraRule implements Rule
{
    /**
     * Determine if the validation rule passes.
     *
     * @param  string  $attribute
     * @param  mixed  $value
     * @return bool
     */
    public function passes($attribute, $value)
    {
        $unidadEncontrada = DB::table('cat_unidades_compradoras')
            ->where('id_unidad_compradora', $value)
            ->first();
        return $unidadEncontrada != null;
    }

    /**
     * Get the validation error message.
     *
     * @return string
     */
    public function message()
    {
        return Lang::get('messages.licitaciones.unidad_compradora_not_exits');
    }
}
