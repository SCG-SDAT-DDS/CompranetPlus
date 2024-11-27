<?php

namespace App\Http\Controllers\Catalogos;

use App\Http\Controllers\Controller;
use App\Models\CatUnidadesCompradorasADExtemporaneoModel;
use App\Models\CatUnidadesCompradorasModel;
use App\Models\CatUnidadesCompradorasMsUsuariosModel;
use App\Models\RespuestaServicio;
use Illuminate\Http\Request;
use Lang;
use Illuminate\Support\Facades\Log;

class UnidadesCompradorasController extends Controller
{

    function __construct()
    {
    }

    public function obtenerUnidadesCompradoras(Request $request)
    {
        $params = $request->all();
        Log::info('***** UnidadesCompradorasController->obtenerUnidadesCompradoras');
        Log::info(json_encode($params));

        $catUnidadesCompradorasModel = new CatUnidadesCompradorasModel();
        $datosUnidadesCompradoras = $catUnidadesCompradorasModel->getCatUnidadesCompradoras($params);

        return RespuestaServicio::setBusquedaExito($datosUnidadesCompradoras)->getResponse();
    }

    public function obtenerUnidadCompradoraID(Request $request){
        $request->validate([
            'id_unidad_compradora' => 'required|numeric'
        ]);
        $params = $request->all();
        $catUnidadesCompradoras = CatUnidadesCompradorasModel::find($params['id_unidad_compradora']);

        return RespuestaServicio::setBusquedaExito($catUnidadesCompradoras)->getResponse();
    }

    public function guardarUnidadCompradora(Request $request)
    {
        $request->validate([
            'id_unidad_compradora' => 'nullable|numeric',
            'clave_unidad_compradora' => 'required|string|min:9',
            'nombre_unidad_compradora' => 'required|string',
            'id_unidad_responsable' => 'required|numeric',
            'activo' => 'nullable|boolean',
        ]);

        $params = $request->all();
        $params["id_usuario"] = $request->user()->id_usuario;
        $catUnidadesCompradorasModel = new CatUnidadesCompradorasModel();
        $respServ = $catUnidadesCompradorasModel->guardarUnidadCompradora($params);
        $resp = new RespuestaServicio();
        if ($respServ->exito) {
            return $resp->setExito($respServ->datos, $respServ->mensaje)->getResponse();
        } else {
            return $resp->setError(null, $respServ->mensaje)->getResponse();
        }
    }

    public function cambiarEstatusCUC(Request $request)
    {
        $request->validate([
            'id_unidad_compradora' => 'required|numeric',
            'activo' => 'required|boolean'
        ]);
        $params = $request->all();
        $params["id_usuario"] = $request->user()->id_usuario;
        $catUnidadesCompradorasModel = new CatUnidadesCompradorasModel();
        $respServ = $catUnidadesCompradorasModel->actualizarUnidadCompradora($params);
        $resp = new RespuestaServicio();
        if ($respServ->exito) {
            return $resp->setExito($respServ->datos, $respServ->mensaje)->getResponse();
        } else {
            return $resp->setError(null, $respServ->mensaje)->getResponse();
        }
    }

    /**
     * este apartado de funciones es para lo relacionado a las adjudicaiones directas extemporaneas que estaran relacionadas a las unidades compradoras
     * @author: Enrique Corona
     * @date: ago/2023
     */

    public function obtenerUnidadesCompradorasADExtemporaneas(Request $request)
    {
        $request->validate([
            'id_unidad_compradora' => 'required|numeric',
        ]);
        $params = $request->all();
        Log::info('***** UnidadesCompradorasController->obtenerUnidadesCompradorasADExtemporaneas');
        Log::info(json_encode($params));

        $catUCADExtemporaneaModel = new CatUnidadesCompradorasADExtemporaneoModel();
        $datosUnidadesCompradorasADExtemporanea = $catUCADExtemporaneaModel->getCatUnidadesCompradorasADExtemporanea($params);

        return RespuestaServicio::setBusquedaExito($datosUnidadesCompradorasADExtemporanea)->getResponse();
    }

    public function guardarUnidadCompradoraADExtemporanea(Request $request)
    {
        $request->validate([
            'id_cat_unidades_compradoras_ad_extemporanea' => 'nullable|numeric',
            //'fecha_otorgado' => 'nullable|string',
            'fecha_inicio_periodo' => 'required|date_format:Y-m-d',
            'fecha_fin_periodo' => 'required|date_format:Y-m-d',
            'id_unidad_compradora' => 'required|numeric',
            'activo' => 'nullable|boolean',
            'estatus_periodo' => 'nullable|boolean',
        ]);

        $params = $request->all();
        $params["id_usuario"] = $request->user()->id_usuario;
        $catUCADExtemporaneaModel = new CatUnidadesCompradorasADExtemporaneoModel();
        $respServ = $catUCADExtemporaneaModel->guardarUnidadCompradoraADExtemporanea($params);
        $resp = new RespuestaServicio();
        if ($respServ->exito) {
            return $resp->setExito($respServ->datos, $respServ->mensaje)->getResponse();
        } else {
            return $resp->setError(null, $respServ->mensaje)->getResponse();
        }
    }

    public function cambiarEstatusCUCADExtemporanea(Request $request)
    {
        $request->validate([
            'id_cat_unidades_compradoras_ad_extemporanea' => 'required|numeric',
            'activo' => 'required|boolean',
            'estatus_periodo' => 'nullable|boolean',
        ]);
        $params = $request->all();
        $params["id_usuario"] = $request->user()->id_usuario;
        $catUCADExtemporaneaModel = new CatUnidadesCompradorasADExtemporaneoModel();
        $respServ = $catUCADExtemporaneaModel->actualizarUnidadCompradoraADExtemporanea($params);
        $resp = new RespuestaServicio();
        if ($respServ->exito) {
            return $resp->setExito($respServ->datos, $respServ->mensaje)->getResponse();
        } else {
            return $resp->setError(null, $respServ->mensaje)->getResponse();
        }
    }

    public function obtenerUsuariosCompradora(Request $request){

        $request->validate([
            'id_unidad_compradora' => 'required|numeric',
        ]);

        $params = $request->all();

        $catUCUsuario = new CatUnidadesCompradorasMsUsuariosModel();
        $datosUsuariosCompradora = $catUCUsuario->getUsuariosCompradora($params);

        return RespuestaServicio::setBusquedaExito($datosUsuariosCompradora)->getResponse();
    }

    public function obtenerUsuariosCompradoraDisponibles(Request $request){
        $params = $request->all();

        $catUCUsuario = new CatUnidadesCompradorasMsUsuariosModel();
        $datosUsuariosCompradoras = $catUCUsuario->getUsuariosompradoraDisponibles($params);

        return RespuestaServicio::setBusquedaExito($datosUsuariosCompradoras)->getResponse();
    }

    public function guardarUsuarioCompradora(Request $request){
        $request->validate([
            'id_unidad_compradora' => 'required|numeric',
            'id_usuario' => 'required|numeric'
        ]);
        $params = $request->all();
        $params["id_usuario_sesion"] = $request->user()->id_usuario;
        $catUCUsuario = new CatUnidadesCompradorasMsUsuariosModel();
        $respServ = $catUCUsuario->guardarUnidadCompradoraUsuario($params);
        if ($respServ->exito) {
            return RespuestaServicio::setExito($respServ->datos, $respServ->mensaje)->getResponse();
        } else {
            return RespuestaServicio::setError(null, $respServ->mensaje)->getResponse();
        }
    }

    public function eliminarUsuarioCompradora(Request $request){
        $request->validate([
            'id_unidad_compradora' => 'required|numeric',
            'id_usuario' => 'required|numeric'
        ]);
        $params = $request->all();
        $params["id_usuario_sesion"] = $request->user()->id_usuario;
        $catUCUsuario = new CatUnidadesCompradorasMsUsuariosModel();
        $respServ = $catUCUsuario->eliminarUnidadCompradoraUsuario($params);
        if ($respServ->exito) {
            return RespuestaServicio::setExito($respServ->datos, $respServ->mensaje)->getResponse();
        } else {
            return RespuestaServicio::setError(null, $respServ->mensaje)->getResponse();
        }
    }

    public function obtenerRelacionInteresParticipacion(Request $request){
        $request->validate([
            'id_unidad_compradora' => 'required|numeric',
        ]);

        $catUCModel = new CatUnidadesCompradorasModel();
        $datosRelacionInteresParticipacion = $catUCModel->obtenerRelacionInteresParticipacion($request->input('id_unidad_compradora'));

        return RespuestaServicio::setBusquedaExito($datosRelacionInteresParticipacion)->getResponse();
    }

}

?>
