<?php

namespace App\Http\Controllers\Catalogos;

use App\Http\Controllers\Controller;
use App\Models\CatTiposProcedimientosModel;
use App\Models\CatUnidadesCompradorasModel;
use App\Models\MsCostosIncripcionesModel;
use App\Models\RespuestaServicio;
use Illuminate\Http\Request;
use Lang;

class CostosInscripcionController extends Controller
{

    function __construct()
    {
    }

    public function obtenerCatTipoProcedimiento(){
        $catTipoProcedimientoModel = new CatTiposProcedimientosModel();
        $datosCatTiposProcedimiento = $catTipoProcedimientoModel->getCatTiposProcedimientos();

        return RespuestaServicio::setBusquedaExito($datosCatTiposProcedimiento)->getResponse();
    }

    public function obtenerMsCostosInscripcion(Request $request)
    {
        $params = $request->all();
        $msCostosInscripcionModel = new MsCostosIncripcionesModel();
        $datosCostosInscripcion = $msCostosInscripcionModel->getMsCostosInscripciones($params);

        return RespuestaServicio::setBusquedaExito($datosCostosInscripcion)->getResponse();
    }

    public function obtenerMsCostosInscripcionActuales(Request $request)
    {
        $params = $request['params'];

        $msCostosInscripcionModel = new MsCostosIncripcionesModel();
        $datosCostosInscripcion = $msCostosInscripcionModel->getMsCostosInscripcionesActuales($params);

        return RespuestaServicio::setBusquedaExito($datosCostosInscripcion)->getResponse();
    }

    public function guardarCostoInscripcion(Request $request)
    {
        $request->validate([
            'id_costo_inscripcion' => 'nullable|numeric',
            'id_tipo_procedimiento' => 'required|numeric',
            'anio' => 'required|numeric|min:'.date('Y')-2,
            'presupuesto_autorizado' => 'required|string',
            'costo_inscripcion' => 'required|numeric',
            'activo' => 'nullable|boolean',
        ],[
            'anio.required' => Lang::get('validation.fields.anio')
        ]);

        $params = $request->all();
        $params["id_usuario"] = $request->user()->id_usuario;
        $msCostosInscripcionModel = new MsCostosIncripcionesModel();
        $respServ = $msCostosInscripcionModel->guardarCostoInscripcion($params);
        $resp = new RespuestaServicio();
        if ($respServ->exito) {
            return $resp->setExito($respServ->datos, $respServ->mensaje)->getResponse();
        } else {
            return $resp->setError(null, $respServ->mensaje)->getResponse();
        }
    }

    public function cambiarEstatusCI(Request $request)
    {
        $request->validate([
            'id_costo_inscripcion' => 'required|numeric',
            'activo' => 'required|boolean'
        ]);
        $params = $request->all();
        $params["id_usuario"] = $request->user()->id_usuario;
        $msCostosInscripcionModel = new MsCostosIncripcionesModel();
        $respServ = $msCostosInscripcionModel->actualizarCostoInscripcion($params);
        $resp = new RespuestaServicio();
        if ($respServ->exito) {
            return $resp->setExito($respServ->datos, $respServ->mensaje)->getResponse();
        } else {
            return $resp->setError(null, $respServ->mensaje)->getResponse();
        }
    }

}

?>
