<?php

namespace App\Models;

use App\Enums\TipoArchivo;

class ArchivoModel {

    private String $nombreArchivo;
    private String $base64;

    private array $tipoArchivo;

    /**
     * @param String $nombreArchivo
     * @param String $base64
     * @param array $tipoArchivo
     */
    public function __construct(string $nombreArchivo, string $base64, array $tipoArchivo)
    {
        $this->nombreArchivo = $nombreArchivo;
        $this->base64 = $base64;
        $this->tipoArchivo = $tipoArchivo;
    }

    /**
     * @return String
     */
    public function getNombreArchivo(): string
    {
        return $this->nombreArchivo;
    }

    /**
     * @return String
     */
    public function getBase64(): string
    {
        return $this->base64;
    }

    /**
     * @return TipoArchivo
     */
    public function getTipoArchivo(): array
    {
        return $this->tipoArchivo;
    }




}

?>
