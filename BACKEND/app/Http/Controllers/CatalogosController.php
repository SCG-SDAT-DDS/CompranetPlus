<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\CatEstatusParticipacionesModel;
use App\Models\CatTiposPersoneriasJuridicasModel;
use App\Models\EstatusProcedimientoModel;
use App\Models\RespuestaServicio;
use Illuminate\Http\Request;
use Lang;
use Illuminate\Support\Facades\Log;

class CatalogosController extends Controller
{

    function __construct()
    {
    }

    public function listadoPersonalidadJuridica(Request $request)
    {
        Log::info('***** CatalogosController->obtenerPersoneriaJuridica');

        $catTiposPersoneriasJuridicasModel = new CatTiposPersoneriasJuridicasModel();
        $datosPersonalidadJuridica = $catTiposPersoneriasJuridicasModel->listado();

        return RespuestaServicio::setBusquedaExito($datosPersonalidadJuridica)->getResponse();
    }

    public function listadoEstatusProcedimiento(Request $request)
    {
        Log::info('***** CatalogosController->listadoEstatusProcedimiento');

        $estatusProcedimientoModel = new EstatusProcedimientoModel();
        $datos = $estatusProcedimientoModel->listado();

        return RespuestaServicio::setBusquedaExito($datos)->getResponse();
    }

    public function listadoEstatusParticipaciones()
    {
        $catEstatusParticipacion = new CatEstatusParticipacionesModel();
        $datosCatEstatusParticipacion = $catEstatusParticipacion->get();

        return RespuestaServicio::setBusquedaExito($datosCatEstatusParticipacion)->getResponse();
    }

}

?>
