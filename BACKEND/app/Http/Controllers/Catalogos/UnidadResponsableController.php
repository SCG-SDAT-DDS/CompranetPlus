<?php

namespace App\Http\Controllers\Catalogos;

use App\Http\Controllers\Controller;
use App\Models\CatTipoUnidadesResponsablesModel;
use App\Models\CatUnidadesResponsablesModel;
use App\Models\CatUnidadesResponsablesMsUsuariosModel;
use App\Models\RespuestaServicio;
use Illuminate\Http\Request;
use Lang;

class UnidadResponsableController extends Controller
{

    function __construct()
    {
    }

    public function obtenerTipoUnidadesResponsables()
    {
        $catTipoUnidadesResponsablesRModel = new CatTipoUnidadesResponsablesModel();
        $datosTipoUnidadResponsable = $catTipoUnidadesResponsablesRModel->get();

        return RespuestaServicio::setBusquedaExito($datosTipoUnidadResponsable)->getResponse();
    }

    public function obtenerUnidadesResponsables(Request $request)
    {
        $params = $request->all();

        $catUnidadesResponsablesModel = new CatUnidadesResponsablesModel();
        $datosUnidadesResponsables = $catUnidadesResponsablesModel->getCatUnidadesResponsables($params);

        return RespuestaServicio::setBusquedaExito($datosUnidadesResponsables)->getResponse();
    }

    public function guardarUnidadResponsable(Request $request){
        $request->validate([
            'id_unidad_responsable' => 'nullable|numeric',
            'nombre_unidad_responsable' => 'required|string',
            'siglas' => 'required|string',
            'id_tipo_unidad_responsable' => 'required|numeric',
            'activo' => 'nullable|boolean',
        ]);

        $params = $request->all();
        $params["id_usuario"] = $request->user()->id_usuario;
        $catUnidadesResponsablesModel = new CatUnidadesResponsablesModel();
        $respServ = $catUnidadesResponsablesModel->guardarUnidadResponsable($params);
        $resp = new RespuestaServicio();
        if ($respServ->exito) {
            return $resp->setExito($respServ->datos, $respServ->mensaje)->getResponse();
        } else {
            return $resp->setError(null, $respServ->mensaje)->getResponse();
        }
    }

    public function cambiarEstatusCUR(Request $request){
        $request->validate([
            'id_unidad_responsable' => 'required|numeric',
            'activo' => 'required|boolean'
        ]);
        $params = $request->all();
        $params["id_usuario"] = $request->user()->id_usuario;
        $catUnidadesResponsablesModel = new CatUnidadesResponsablesModel();
        $respServ = $catUnidadesResponsablesModel->actualizarUnidadResponsable($params);
        $resp = new RespuestaServicio();
        if ($respServ->exito) {
            return $resp->setExito($respServ->datos, $respServ->mensaje)->getResponse();
        } else {
            return $resp->setError(null, $respServ->mensaje)->getResponse();
        }
    }

    /**
     * apartado de funciones para los supervisores de las unidades responsables
     */
    public function obtenerUsuariosSupervisores(Request $request){

        $request->validate([
            'id_unidad_responsable' => 'required|numeric',
        ]);

        $params = $request->all();

        $catURUsuario = new CatUnidadesResponsablesMsUsuariosModel();
        $datosUsuariosSupervisores = $catURUsuario->getUsuariosSupervisor($params);

        return RespuestaServicio::setBusquedaExito($datosUsuariosSupervisores)->getResponse();
    }

    public function obtenerUsuariosSupervisoresDisponibles(Request $request){
        $params = $request->all();

        $catURUsuario = new CatUnidadesResponsablesMsUsuariosModel();
        $datosUsuariosSupervisores = $catURUsuario->getUsuariosSupervisorDisponibles($params);

        return RespuestaServicio::setBusquedaExito($datosUsuariosSupervisores)->getResponse();
    }

    public function guardarSupervisor(Request $request){
        $request->validate([
            'id_unidad_responsable' => 'required|numeric',
            'id_usuario' => 'required|numeric'
        ]);
        $params = $request->all();
        $params["id_usuario_sesion"] = $request->user()->id_usuario;
        $catURUsuario = new CatUnidadesResponsablesMsUsuariosModel();
        $respServ = $catURUsuario->guardarUnidadResponsableUsuario($params);
        if ($respServ->exito) {
            return RespuestaServicio::setExito($respServ->datos, $respServ->mensaje)->getResponse();
        } else {
            return RespuestaServicio::setError(null, $respServ->mensaje)->getResponse();
        }
    }

    public function eliminarSupervisor(Request $request){
        $request->validate([
            'id_unidad_responsable' => 'required|numeric',
            'id_usuario' => 'required|numeric'
        ]);
        $params = $request->all();
        $params["id_usuario_sesion"] = $request->user()->id_usuario;
        $catURUsuario = new CatUnidadesResponsablesMsUsuariosModel();
        $respServ = $catURUsuario->eliminarUnidadResponsableUsuario($params);
        if ($respServ->exito) {
            return RespuestaServicio::setExito($respServ->datos, $respServ->mensaje)->getResponse();
        } else {
            return RespuestaServicio::setError(null, $respServ->mensaje)->getResponse();
        }
    }

}

?>
