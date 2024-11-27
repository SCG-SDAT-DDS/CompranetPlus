<?php

namespace App\Http\Controllers\Proveedores;

use App\Http\Controllers\Controller;
use App\Models\DetDocumentosProveedorModel;
use App\Models\RespuestaServicio;
use Illuminate\Http\Request;

class DocumentsProveedorController extends Controller
{

    public function getDocumentosProveedor(Request $request)
    {
        $params = $request;
        $doc = new DetDocumentosProveedorModel();
        $dataResp = $doc -> getDocumentosProveedor($params);

        $resp = new RespuestaServicio();
        return $resp -> setBusquedaExito($dataResp) -> getResponse();
    }
}
