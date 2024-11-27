<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Lang;
use Illuminate\Support\Facades\Log;

class DetProveedoresSociosModel extends Model
{
    public $timestamps = false;
    protected $table = 'det_proveedores_socios';
    protected $primaryKey = 'id_proveedor_socio';

    protected $fillable = [
        'id_proveedor',
        'nombre_socio',
        'primer_apellido_socio',
        'segundo_apellido_socio',
        'rfc_socio',
        'curp_socio',
        'domicilio',
        'vigente',
        'fecha_ultima_mod',
        'usuario_ultima_mod'
    ];

    protected $casts = [
        'fecha_ultima_mod' => 'datetime',
    ];

    public function getSociosProveedor($params)
    {

       $queryList = DB::table('det_proveedores_socios as dps')
           //->join('ms_proveedores as pro', 'pro.id_proveedor', '=', 'dps.id_proveedor')
           ->distinct()
           ->where('dps.id_proveedor',$params['id_proveedor'])
           ->select('dps.*');

        $pageSize = 10;

        if (isset($params['pageSize']) && $params['pageSize'] != '') {
           $pageSize = $params["pageSize"];
        }

        $data = $queryList->orderBy('dps.id_proveedor_socio')->paginate($pageSize);

        return $data;
    }

    public function guardarSocio($arraySocios , $idProveedor, $idUsuario): RespuestaModel
    {
        DB::beginTransaction();
        try{
            foreach($arraySocios as $socio){
                $datoGuardar = new DetProveedoresSociosModel();
                if($socio["id_proveedor_socio"])
                    $datoGuardar = $this::find($socio["id_proveedor_socio"]);

                if (isset($socio["vigente"])) {
                    $datoGuardar->vigente = $socio["vigente"];
                } else {
                    $datoGuardar->vigente = true; // Valor por defecto si no se proporciona
                }

                if (isset($socio["id_proveedor"])) {
                $datoGuardar->id_proveedor = $socio["id_proveedor"];
                }

                if (isset($socio["nombre_socio"])) {
                    $datoGuardar->nombre_socio = $socio["nombre_socio"];
                }

                if (isset($socio["primer_apellido_socio"])) {
                    $datoGuardar->primer_apellido_socio = $socio["primer_apellido_socio"];
                }

                if (isset($socio["segundo_apellido_socio"])) {
                    $datoGuardar->segundo_apellido_socio = $socio["segundo_apellido_socio"];
                }

                if (isset($socio["rfc_socio"])) {
                    $datoGuardar->rfc_socio = $socio["rfc_socio"];
                }

                if (isset($socio["curp_socio"])) {
                    $datoGuardar->curp_socio = $socio["curp_socio"];
                }

                if (isset($socio["domicilio"])) {
                    $datoGuardar->domicilio = $socio["domicilio"];
                }

                $datoGuardar->id_proveedor = $idProveedor;
                $datoGuardar->fecha_ultima_mod = Carbon::now();

                $datoGuardar->usuario_ultima_mod = $idUsuario ?? null;

                $datoGuardar -> save();
            }

            DB::commit();

            return new RespuestaModel(true, $datoGuardar -> id_proveedor_socio, Lang::get('messages.request_guardar'));
        } catch (\Exception $th) {
            Log::error($th);
            DB::rollback();
            return new RespuestaModel(false,  null, $th);
        }
    }
}
