<?php

namespace App\Http\Controllers\Convocantes;

use App\Http\Controllers\Controller;
use App\Models\NumeroProcedimientoModel;
use App\Models\ProcedimientoAdministrativoModel;
use App\Models\RespuestaServicio;
use App\Rules\TipoLicitacionRule;
use App\Rules\UnidadCompradoraRule;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class NumerosProcedimientosController extends Controller
{

    public function show(Request $request) {
        $request->validate([
            'idTipoLicitacion' =>  ['required', 'numeric', new TipoLicitacionRule()],
            'idTipoProcedimiento' =>  ['required', 'numeric'],
            'idUnidadCompradora' =>  ['required', 'numeric', new UnidadCompradoraRule()]
        ]);

        $params = $request->all();
//        $params["idUsuario"] = $request->user()->id_usuario;

        $helpNumProd = new NumeroProcedimientoModel();
        $respServ =  $helpNumProd->generarNumeroProd($params, $request['persistir']);

        $resp = new RespuestaServicio();
        if ($respServ->exito) {
            return $resp->setExito($respServ->datos, $respServ->mensaje)->getResponse();
        } else {
            return $resp->setError(null, $respServ->mensaje)->getResponse();
        }
    }

    function update(Request $request) {

        $request->validate([
            'id_procedimiento_administrativo' =>  ['required', 'numeric']
        ]);

        $request['persistir'] = true;

        DB::beginTransaction();
        $respObtNumProc = $this->show($request);

        if ($respObtNumProc->status()==200) {
            $numeroProcedimiento = json_decode($respObtNumProc->getContent())->datos;
            $model = new ProcedimientoAdministrativoModel();
            $respServ = $model->actualizarNumProcedimientoAdministrativo(
                $request->id_procedimiento_administrativo,
                $numeroProcedimiento
            );
            $resp1 = new RespuestaServicio();
            if ($respServ->exito) {
                DB::commit();
                return $resp1->setExito($respServ->datos, $respServ->mensaje)->getResponse();
            } else {
                DB::rollBack();
                return $resp1->setError(null, $respServ->mensaje)->getResponse();
            }
        } else {
            return $respObtNumProc->getContent();
        }
    }
}
