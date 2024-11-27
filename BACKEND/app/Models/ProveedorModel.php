<?php

namespace App\Models;

use App\Enums\TipoArchivo;
use App\Helper\ArchivosHelper;
use App\Helper\CorreosHelper;
//use Dompdf\Dompdf;
//use Dompdf\Options;
use App\Helper\NotificacionesHelper;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Lang;
use Illuminate\Support\Facades\Log;

class ProveedorModel extends Model
{
    public $timestamps = false;
    protected $table = 'ms_proveedores';
    protected $primaryKey = 'id_proveedor';

    protected $fillable = [
        'rfc_proveedor',
        'password',
        'id_tipo_personeria_juridica',
        'nombre_proveedor',
        'primer_apellido_proveedor',
        'segundo_apellido_proveedor',
        'curp',
        'razon_social',
        'nombre_representante',
        'primer_apellido_representante',
        'segundo_apellido_representante',
        'url_identificacion_representante',
        'url_identificacion_reverso_representante',
        'numero_registro_imss',
        'url_cedula_profesional',
        'numero_cedula_profesional',
        'descripcion_giro_empresa',
        'nombre_vialidad',
        'numero_exterior',
        'numero_interior',
        'codigo_postal',
        'nombre_colonia',
        'id_localidad',
        'id_municipio',
        'id_estado',
        'referencia',
        'correo_electronico',
        'telefono',
        'url_constancia_situacion',
        //'url_certificado_proveedor',
        'id_estatus_proveedor',
        'id_usuario',
        'activo',
        'fecha_ultima_mod',
        'usuario_ultima_mod'
    ];

    protected $casts = [
        'fecha_ultima_mod' => 'datetime',
    ];


    public function guardarProveedor($parametros , $arraySocios , $arrayDocumentos): RespuestaModel
    {
        if (!isset($parametros["id_proveedor"]) || $parametros["id_proveedor"] == null) {
            $queryVal = $this
                ->where(DB::raw("upper(rfc_proveedor)"), '=', strtoupper($parametros["rfc_proveedor"]))
                ->where(DB::raw("id_estatus_proveedor"), '<>', 4)
                ->where(DB::raw("activo"), '=', 1);

            $existeCoincidencia = $queryVal->first();

            if ($existeCoincidencia != null) {
                return new RespuestaModel(false, null, Lang::get('messages.request_reg_existe'));
            }
        }

        DB::beginTransaction();
        try {
            if ($parametros["id_proveedor"]) {
                $datoGuardar = $this::find($parametros["id_proveedor"]);
                $valorAnterior = clone $datoGuardar;
            }
            if (!isset($datoGuardar)) {
                $datoGuardar = new ProveedorModel();
                $valorAnterior = clone $datoGuardar;

                $datoGuardar->activo = true;
                $datoGuardar->id_estatus_proveedor = 1;
            } else {
                if (isset($parametros["activo"])) {
                    $datoGuardar->activo = $parametros["activo"];
                }
                if (isset($parametros["id_estatus_proveedor"])) {
                    $datoGuardar->id_estatus_proveedor = $parametros["id_estatus_proveedor"];
                }
            }
            if (isset($parametros["rfc_proveedor"])) {
                $datoGuardar->rfc_proveedor = strtoupper($parametros["rfc_proveedor"]);
            }
            if (isset($parametros["password"])) {
                $datoGuardar->password = bcrypt($parametros["password"]);
            }
            if (isset($parametros["nombre_proveedor"])) {
                $datoGuardar->nombre_proveedor = $parametros["nombre_proveedor"];
            }
            if (isset($parametros["id_tipo_personeria_juridica"])) {
                $datoGuardar->id_tipo_personeria_juridica = $parametros["id_tipo_personeria_juridica"];
            }
            if (isset($parametros["primer_apellido_proveedor"])) {
                $datoGuardar->primer_apellido_proveedor = $parametros["primer_apellido_proveedor"];
            }
            if (isset($parametros["segundo_apellido_proveedor"])) {
                $datoGuardar->segundo_apellido_proveedor = $parametros["segundo_apellido_proveedor"];
            }
            if (isset($parametros["curp"])) {
                $datoGuardar->curp = strtoupper($parametros["curp"]);
            }
            if (isset($parametros["razon_social"])) {
                $datoGuardar->razon_social = $parametros["razon_social"];
            }
            if (isset($parametros["nombre_representante"])) {
                $datoGuardar->nombre_representante = $parametros["nombre_representante"];
            } else {
                $datoGuardar->nombre_representante = "";
            }
            if (isset($parametros["primer_apellido_representante"])) {
                $datoGuardar->primer_apellido_representante = $parametros["primer_apellido_representante"];
            } else {
                $datoGuardar->primer_apellido_representante = "";
            }
            if (isset($parametros["segundo_apellido_representante"])) {
                $datoGuardar->segundo_apellido_representante = $parametros["segundo_apellido_representante"];
            } else {
                $datoGuardar->segundo_apellido_representante = "";
            }
            if (isset($parametros["url_identificacion_representante"])) {
                $archivoIneFrontal = $parametros["url_identificacion_representante"];
                $url_identificacion_rep = $this::almacenarArchivo($archivoIneFrontal , $parametros["rfc_proveedor"] );
                $datoGuardar->url_identificacion_representante = $url_identificacion_rep;
            }

            if (isset($parametros["url_identificacion_reverso_representante"])) {
                $archivoIneContrario = $parametros["url_identificacion_reverso_representante"];
                $url_identificacion_rev_rep = $this::almacenarArchivo($archivoIneContrario , $parametros["rfc_proveedor"] );
                $datoGuardar->url_identificacion_reverso_representante = $url_identificacion_rev_rep;
            }

            if (isset($parametros["numero_registro_imss"])) {
                $datoGuardar->numero_registro_imss = $parametros["numero_registro_imss"];
            }
            if (isset($parametros["url_cedula_profesional"])) {
                $archivoCedula = $parametros["url_cedula_profesional"];
                $url_cedula_profesional_rep = $this::almacenarArchivo($archivoCedula , $parametros["rfc_proveedor"]);
                $datoGuardar->url_cedula_profesional = $url_cedula_profesional_rep;
            }

            if (isset($parametros["numero_cedula_profesional"])) {
                $datoGuardar->numero_cedula_profesional = $parametros["numero_cedula_profesional"];
            }
            if (isset($parametros["descripcion_giro_empresa"])) {
                $datoGuardar->descripcion_giro_empresa = $parametros["descripcion_giro_empresa"];
            }
            if (isset($parametros["nombre_vialidad"])) {
                $datoGuardar->nombre_vialidad = $parametros["nombre_vialidad"];
            }
            if (isset($parametros["numero_exterior"])) {
                $datoGuardar->numero_exterior = $parametros["numero_exterior"];
            }
            if (isset($parametros["numero_interior"])) {
                $datoGuardar->numero_interior = $parametros["numero_interior"];
            }
            if (isset($parametros["codigo_postal"])) {
                $datoGuardar->codigo_postal = $parametros["codigo_postal"];
            }
            if (isset($parametros["nombre_colonia"])) {
                $datoGuardar->nombre_colonia = $parametros["nombre_colonia"];
            }
            if (isset($parametros["id_localidad"])) {
                $datoGuardar->id_localidad = $parametros["id_localidad"];
            }
            if (isset($parametros["id_municipio"])) {
                $datoGuardar->id_municipio = $parametros["id_municipio"];
            }
            if (isset($parametros["id_estado"])) {
                $datoGuardar->id_estado = $parametros["id_estado"];
            }
            if (isset($parametros["referencia"])) {
                $datoGuardar->referencia = $parametros["referencia"];
            }
            if (isset($parametros["correo_electronico"])) {
                $datoGuardar->correo_electronico = $parametros["correo_electronico"];
            }
            if (isset($parametros["telefono"])) {
                $datoGuardar->telefono = $parametros["telefono"];
            }
            if (isset($parametros["url_constancia_situacion"])) {
                $archivoConstancia = $parametros["url_constancia_situacion"];
                $url_constancia_situacion_rep = $this::almacenarArchivo($archivoConstancia , $parametros["rfc_proveedor"]);
                $datoGuardar->url_constancia_situacion = $url_constancia_situacion_rep;
            }

            $datoGuardar->fecha_ultima_mod = Carbon::now();
            $datoGuardar->usuario_ultima_mod = $parametros["idUsuario"] ?? null;

            if (!isset($datoGuardar->id_usuario)) {
                // Si no hay un ID de usuario asociado, crea uno nuevo
                $parametrosUsuario = [
                    "id" => null,
                    "usuario" => strtoupper($parametros["rfc_proveedor"]),
                    "contrasena" => $parametros["password"],
                    "nombre" => $parametros["nombre_proveedor"],
                    "aPaterno" => $parametros["primer_apellido_proveedor"],
                    "aMaterno" => $parametros["segundo_apellido_proveedor"],
                    "idRol" => 2,
                    "email" => $parametros["correo_electronico"],
                    "idUsuario" => null,
                ];
                $enviarCorreo = false;
            }else{
                $parametrosUsuario = [
                    "id" => $parametros["id_usuario"],
                    "usuario" => strtoupper($parametros["rfc_proveedor"]),
                    "contrasena" => $parametros["password"],
                    "nombre" => $parametros["nombre_proveedor"],
                    "aPaterno" => $parametros["primer_apellido_proveedor"],
                    "aMaterno" => $parametros["segundo_apellido_proveedor"],
                    "idRol" => 2,
                    "email" => $parametros["correo_electronico"],
                    "idUsuario" => null,
                ];
                $enviarCorreo = true;
            }

                $usuarioModel = new User();
                $respuestaUsuario = $usuarioModel->guardarUsuarioProveedor($parametrosUsuario);

                if ($respuestaUsuario->exito) {
                    $idUsuario = $respuestaUsuario->datos;
                    $datoGuardar->id_usuario = $idUsuario;
                } else {
                    DB::rollback();
                    return $respuestaUsuario;
                }


            $datoGuardar->save();

            $idProveedor = $datoGuardar->id_proveedor;
            $rfcProveedor = $datoGuardar->rfc_proveedor;
            $idUsuarioMod = $datoGuardar->usuario_ultima_mod;

            if (!empty($arraySocios)) {
                $sociosModel = new DetProveedoresSociosModel();
                $respSocios = $sociosModel->guardarSocio($arraySocios, $idProveedor, $idUsuarioMod);
                if ($respSocios -> exito == false){
                    DB::rollback();
                    return $respSocios;
                }
            }

            if (!empty($arrayDocumentos)) {
                $documentosModel = new DetDocumentosProveedorModel();
                $respDocumentos = $documentosModel->guardarDocumentos($arrayDocumentos, $idProveedor,$rfcProveedor, $idUsuarioMod);
                if ($respDocumentos -> exito == false){
                    DB::rollback();
                    return $respDocumentos;
                }
            }


            //VARIABLES PARA BITACORA
            $seccion = "Proveedores";

            if ($parametros["id_proveedor"]){
                $descripcionAccion = "Actualizar proveedor con rfc: ".$rfcProveedor;
            }else{
                $descripcionAccion = "Crear proveedor con rfc: ".$rfcProveedor;
            }

            $valorNuevo = $datoGuardar;

            $diferenciaNuevo = $valorNuevo->compareTo($valorAnterior);
            $diferenciaAnterior = $valorAnterior->compareTo($valorNuevo);

            // INICIO BITACORA

            $bitacoraModel = new BitacoraModel($datoGuardar->id_usuario,
                $seccion,
                $descripcionAccion);

            $bitacoraModel->valor_nuevo = $diferenciaNuevo;
            $bitacoraModel->valor_anterior = $diferenciaAnterior;



            $bit = new DetalleBitacoraModel();
            $respBit = $bit->guardarBitacora($bitacoraModel);

            if ($respBit -> exito == false){
                DB::rollback();
                return $respBit;
            }

            // FIN BITACORA
            DB::commit();

            if($enviarCorreo){
                $correo = $datoGuardar->correo_electronico;
                $nombre = $datoGuardar->nombre_proveedor;
                $rfc = $datoGuardar->rfc_proveedor;
                $helpCorreo = new CorreosHelper();
                $helpCorreo->correoProveedorModificado($correo, "Modificacion de datos",$nombre , $rfc);
            }
            return new RespuestaModel(true,  $datoGuardar->id_proveedor, Lang::get('messages.request_guardar'));
        } catch (\Exception $th) {
            Log::error($th);
            DB::rollback();
            if (str_contains(strtolower($th->getMessage()), 'smtp')) {
                return new RespuestaModel(true, null, 'El servicio de Correos no está disponible por el momento');
            }
            return new RespuestaModel(false,  null, $th->getMessage());
        }
    }

    public function buscarProveedores($params)
    {
        $query = DB::table('ms_proveedores as p')
            ->join('cat_tipos_personerias_juridicas as tpj','tpj.id_tipo_personeria_juridica','=','p.id_tipo_personeria_juridica')
            ->join('cat_estatus_proveedores as ep','ep.id_estatus_proveedor','=','p.id_estatus_proveedor')
            ->distinct()
            ->select('p.*','ep.nombre_estatus_proveedor', 'tpj.nombre_personeria_juridica');



        if ($params["rfc_proveedor"] != null) {
            $query->where('p.rfc_proveedor', '=', $params["rfc_proveedor"]);
        }

        if ($params["id_tipo_personeria_juridica"] != null) {
            $query->where('p.id_tipo_personeria_juridica', '=', $params["id_tipo_personeria_juridica"]);
        }

        if ($params["id_estatus_proveedor"] != null) {
            $query->where('p.id_estatus_proveedor', '=', $params["id_estatus_proveedor"]);
        }

        if ($params["nombre_proveedor"] != null) {
            $query->where(DB::raw("upper(p.nombre_proveedor)"), 'like', '%' . strtoupper($params["nombre_proveedor"]). '%');
        }


        $data = $query->get();

        return $data;
    }

    public function getProveedores($params)
    {

       $queryList = DB::table('ms_proveedores as pro')
           ->join('cat_tipos_personerias_juridicas as tpj', 'tpj.id_tipo_personeria_juridica', '=', 'pro.id_tipo_personeria_juridica')
           ->join('cat_estatus_proveedores as cep', 'cep.id_estatus_proveedor', '=', 'pro.id_estatus_proveedor')
           ->distinct()
           ->select('pro.*',
                    'tpj.nombre_personeria_juridica',
                    'cep.nombre_estatus_proveedor', 'cep.estilo');

        if (isset($params['rfc']) && $params['rfc'] != '') {
            $queryList->where(DB::raw("upper(pro.rfc_proveedor)"), 'like', '%' . strtoupper($params["rfc"]). '%');
        }

        if(isset($params['razon_social']) && $params['razon_social'] != ''){
            $queryList->where(function($query) use($params){
                $query->orWhere('razon_social','like','%'.$params['razon_social'].'%');
                $query->orWhere('nombre_proveedor','like','%'.$params['razon_social'].'%');
            });
        }

        if (isset($params['id_personalidad_juridica']) && $params['id_personalidad_juridica'] != '') {
            $queryList->where('pro.id_tipo_personeria_juridica',$params['id_personalidad_juridica']);
        }

        if (isset($params['estatus']) && $params['estatus'] != '') {
            $queryList->where('pro.id_estatus_proveedor',$params['estatus']);
        }

        if (isset($params['activo']) && $params['activo'] != '') {
            $queryList->where('pro.activo',$params['activo']);
        }

        $pageSize = 10;

        if (isset($params['pageSize']) && $params['pageSize'] != '') {
           $pageSize = $params["pageSize"];
        }

        $data = $queryList->orderBy('pro.id_proveedor')->paginate($pageSize);

        return $data;
    }

    public function cambiarEstatusProveedor($parametros)
    {
        DB::beginTransaction();
        try {
            $datoGuardar = $this::find($parametros["id_proveedor"]);

            $modelEstatusAnterior = EstatusProveedorModel::find($datoGuardar->id_estatus_proveedor);
            $estatusAnterior = $modelEstatusAnterior->nombre_estatus_proveedor;

            $modelEstatusNuevo = EstatusProveedorModel::find($parametros["id_estatus_proveedor"]);
            $estatusNuevo = $modelEstatusNuevo->nombre_estatus_proveedor;

            $datoGuardar->id_estatus_proveedor = $parametros["id_estatus_proveedor"];
            $datoGuardar->fecha_ultima_mod = Carbon::now();
            $datoGuardar->usuario_ultima_mod = $parametros["idUsuario"];

            $datoGuardar->save();
            NotificacionesHelper::insertNotificacion($datoGuardar->id_usuario,"Proveedor validado","Sus datos han sido validados y su estatus a cambiado a : Proveedor Validado");

            DB::commit();



            if ($parametros["id_estatus_proveedor"] === 3) {
                $correoProveedor = $datoGuardar->correo_electronico;

                if ($datoGuardar->razon_social !== null){
                    $nombreDestinatario = $datoGuardar->razon_social;
                }else{
                    $nombreDestinatario = $datoGuardar->nombre_proveedor." ".$datoGuardar->primer_apellido_proveedor." ".$datoGuardar->segundo_apellido_proveedor;
                }
                $helpCorreo = new CorreosHelper();
                $helpCorreo->correoProveedorValidado($correoProveedor, "Proveedor Validado", $nombreDestinatario);

            }



            //VARIABLES PARA BITACORA
            $seccion = "Proveedores";

            $descripcionAccion = "Cambio de estatus del proveedor con rfc: ".$datoGuardar->rfc_proveedor." del estatus: ".$estatusAnterior.", al estatus: ".$estatusNuevo;

            // INICIO BITACORA

            $bitacoraModel = new BitacoraModel($parametros["idUsuario"], $seccion, $descripcionAccion);

            $bit = new DetalleBitacoraModel();
            $respBit = $bit->guardarBitacora($bitacoraModel);

            // FIN BITACORA


            return new RespuestaModel(true,  $datoGuardar->id_proveedor, Lang::get('messages.request_actualizar'));

        } catch (\Exception $th) {
            Log::error($th);
            DB::rollback();
            if (str_contains(strtolower($th->getMessage()), 'smtp')) {
                return new RespuestaModel(true, null, 'El servicio de Correos no está disponible por el momento');
            }
            return new RespuestaModel(false,  null, $th);
        }
    }

    public function eliminarProveedor($parametros)
    {
        DB::beginTransaction();
        try {
            $datoGuardar = $this::find($parametros["id_proveedor"]);

            $datoGuardar->activo = $parametros["activo"];
            $datoGuardar->fecha_ultima_mod = Carbon::now();
            $datoGuardar->usuario_ultima_mod = $parametros["idUsuario"];

            $datoGuardar->save();

            DB::commit();


            //VARIABLES PARA BITACORA
            $seccion = "Proveedores";

            $descripcionAccion = "Eliminación del proveedor con rfc: ".$datoGuardar->rfc_proveedor;

            // INICIO BITACORA

            $bitacoraModel = new BitacoraModel($parametros["idUsuario"], $seccion, $descripcionAccion);

            $bit = new DetalleBitacoraModel();
            $respBit = $bit->guardarBitacora($bitacoraModel);

            // FIN BITACORA

            return new RespuestaModel(true,  $datoGuardar->id_proveedor, Lang::get('messages.request_actualizar'));

        } catch (\Exception $th) {
            Log::error($th);
            DB::rollback();
            return new RespuestaModel(false,  null, $th);
        }
    }

    public function almacenarArchivo($request , $nombreProveedor)
    {
        $tipoArchivo  = TipoArchivo::obtenerTipoArchivo($request['tipoArchivo']);
        $archivo = new ArchivoModel($request['nombreArchivo'],
            $request['base64'],
            $tipoArchivo);

        $archHelp = new ArchivosHelper();
        $respServ = $archHelp->guardarDocumento(
            $archivo,
            strtoupper($nombreProveedor),
            $request['encriptar']
        );


        return $respServ->datos;
    }

    public static function findDataProveedor($params){
        $query = DB::table('ms_proveedores as pro')
            ->leftjoin('ms_usuarios as usu', 'usu.id_usuario', '=', 'pro.id_usuario')
            ->leftJoin('cat_estatus_proveedores as cep','cep.id_estatus_proveedor','=','pro.id_estatus_proveedor')
            ->distinct()
            ->select('pro.id_proveedor','pro.rfc_proveedor','cep.id_estatus_proveedor')
            ->where('pro.id_usuario','=',$params);

        $data = $query->first();

        return [
            'id_p' => $data->id_proveedor ?? null,
            'rp' => $data->rfc_proveedor ?? null,
            'sts_p' => $data->id_estatus_proveedor ?? null
        ];


    }

    public function finalizarRegistroProveedor($parametros)
    {
        DB::beginTransaction();
        try {
            $datoGuardar = $this::find($parametros["id_proveedor"]);

            $datoGuardar->id_estatus_proveedor = 2;
            $datoGuardar->fecha_ultima_mod = Carbon::now();

            $datoGuardar->save();

            NotificacionesHelper::insertNotificacion($datoGuardar->id_usuario,"Proveedor registrado","Sus datos han sido autenticados por la e-firma y su estatus a cambiado a : Proveedor Registrado");


            DB::commit();

            $correoProveedor = $datoGuardar->correo_electronico;
            if ($datoGuardar->razon_social !== null){
                $nombreDestinatario = $datoGuardar->razon_social;
            }else{
                $nombreDestinatario = $datoGuardar->nombre_proveedor." ".$datoGuardar->primer_apellido_proveedor." ".$datoGuardar->segundo_apellido_proveedor;
            }
            $helpCorreo = new CorreosHelper();
            $helpCorreo->correoProveedorRegistrado($correoProveedor, "Proveedor Registrado", $nombreDestinatario);




            return new RespuestaModel(true,  $datoGuardar->id_proveedor, Lang::get('messages.proveedores.registro_complete'));

        } catch (\Exception $th) {
            Log::error($th);
            DB::rollback();
            if (str_contains(strtolower($th->getMessage()), 'smtp')) {
                return new RespuestaModel(true, null, 'El servicio de Correos no está disponible por el momento');
            }
            return new RespuestaModel(false,  null, $th);
        }
    }

    public function obtenerArchivo($url, $encriptar)
    {

        $archHelp = new ArchivosHelper();
        $respServ = $archHelp->obtenerDocumento(
            $url,
            $encriptar
        );

        return $respServ->datos;

    }


    public static function obtenerCorreoProveedor($prov)
    {

        $query = DB::table('ms_proveedores as usu')
            ->select('usu.*')
            ->where('usu.id_proveedor', '=', $prov);

        return $query->get()->first();
    }


    public static function obtenerRFCProveedor($prov)
    {

        $query = DB::table('ms_proveedores as usu')
            ->select('usu.*')
            ->where('usu.id_proveedor', '=', $prov);

        return $query->get()->first();
    }

    public function getStatusProveedor($prov)
    {
        $query = DB::table('ms_proveedores as mp')
            ->join('cat_estatus_proveedores as ep','ep.id_estatus_proveedor','=','mp.id_estatus_proveedor')
            ->distinct()
            ->select('ep.id_estatus_proveedor','ep.nombre_estatus_proveedor')
            ->where('mp.id_proveedor','=',$prov);

        return $query->get()->first();
    }

    public function compareTo(ProveedorModel $other)
    {
        $attributes = collect($this->getAttributes())
            ->map(function ($attribute, $key) use ($other) {
                if ($attribute != $other->$key) {
                    return $key = $attribute;
                }
            })->reject(function ($attribute, $key) {
                return !$attribute || in_array($key, ['id', 'created_at', 'updated_at']);
            });

        return $attributes;
    }
}
