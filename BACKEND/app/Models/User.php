<?php

namespace App\Models;

use App\Helper\CorreosHelper;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Lang;
use Illuminate\Support\Facades\Log;
use Laravel\Passport\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    public $timestamps = false;
    protected $table = 'ms_usuarios';
    protected $primaryKey = 'id_usuario';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'nombre_usuario',
        'usuario',
        'contrasenia',
        'activo'
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'contrasenia'
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
    ];

    public function getAuthPassword()
    {
        return $this->contrasenia;
    }

    public static function findByUser($usuario)
    {
        return DB::table('ms_usuarios as usu')
            ->select('usu.*')
            ->where('usu.usuario', '=', $usuario)
            ->where('usu.activo', '=', 1)
            ->first();
    }

    public static function obtenerPrivilegiosFunciones($nombreUsuario)
    {
        return DB::table('ms_usuarios as usu')
            ->distinct()
            ->join('cat_roles as rol',  function($join)
            {
                $join->on('rol.id_rol', '=', 'usu.id_rol');
                $join->on('rol.activo','=', DB::raw(1));
            })
            ->join('det_roles_funcionalidades as rolf', function($join)
            {
                $join->on('rolf.id_rol', '=', 'rol.id_rol');
                $join->on('rolf.activo','=',DB::raw(1));
            })
            ->join('cat_funcionalidades as funs', function($join)
            {
                $join->on('funs.id_funcionalidad', '=', 'rolf.id_funcionalidad');
                $join->on('funs.activo','=',DB::raw(1));
            })
            ->select('funs.nombre_funcionalidad')
            ->where('usu.usuario', '=', $nombreUsuario)
            ->where('usu.activo', '=', 1)
            ->pluck('nombre_funcionalidad')->toArray();
//            ->get();
    }

    public static function obtenerPrivilegiosRoles($nombreUsuario)
    {
        return DB::table('ms_usuarios as usu')
            ->distinct()
            ->join('cat_roles as rol',  function($join)
            {
                $join->on('rol.id_rol', '=', 'usu.id_rol');
                $join->on('rol.activo','=', DB::raw(1));
            })
            ->select('rol.nombre_rol')
            ->where('usu.usuario', '=', $nombreUsuario)
            ->where('usu.activo', '=', 1)
            ->pluck('nombre_rol')->toArray();
    }


    public function generarCodigoRecuperarPass($usuario, $correo)
    {
        $usuario = $this->where('usuario', $usuario)->where('correo', $correo)->where('activo', true)->first();

        if ($usuario == null) {
            return new RespuestaModel(false,  $correo, Lang::get('messages.restablecer_pass.usu_no_existe'));
        }

        $time = Carbon::now();
        $endTime = $time->addMinutes(5);

        $usuario->contrasenia_temp = substr(md5(uniqid(mt_rand(), true)) , 0, 8);
        $usuario->contrasenia_temp_limite = $endTime;
        $usuario->save();

        $datos = [
            [
                'CAD' => '{{VENCIMIENTO}}',
                'VAL' => $usuario->contrasenia_temp_limite->format('Y-m-d h:i:s')
            ],
            [
                'CAD' => '{{NOMBRE}}',
                'VAL' => $usuario->nombre_usuario.' '.$usuario->primer_apellido_usuario.' '.$usuario->segundo_apellido_usuario
            ],
            [
                'CAD' => '{{CODIGO}}',
                'VAL' => $usuario->contrasenia_temp
            ],
        ];

        $helpCorreo = new CorreosHelper();
        $helpCorreo->enviarCorreoRecuperarPass($correo,
            Lang::get("messages.restablecer_pass.exito"),
            $datos);

        return new RespuestaModel(true,  $correo, Lang::get('messages.restablecer_pass.exito_info'));
    }

    public function validarCodigoPass($usuario, $correo, $codigo)
    {
        $usuario = $this->where('usuario', $usuario)
            ->where('correo', $correo)
            ->where('activo', true)
            ->where('contrasenia_temp', $codigo)
            ->where('contrasenia_temp_limite', '>=', Carbon::now())
            ->first();

        if ($usuario == null) {
            return new RespuestaModel(false,  $correo, Lang::get('messages.restablecer_pass.codigo_no_valido'));
        }

        $time = Carbon::now();
        $endTime = $time->addMinutes(5);

        $usuario->contrasenia_temp = substr(md5(uniqid(mt_rand(), true)) , 0, 8);
        $usuario->contrasenia_temp_limite = $endTime;
        $usuario->save();

        $datos = [
            [
                'CAD' => '{{VENCIMIENTO}}',
                'VAL' => $usuario->contrasenia_temp_limite->format('Y-m-d h:i:s')
            ],
            [
                'CAD' => '{{NOMBRE}}',
                'VAL' => $usuario->nombre_usuario.' '.$usuario->primer_apellido_usuario.' '.$usuario->segundo_apellido_usuario
            ],
            [
                'CAD' => '{{CODIGO}}',
                'VAL' => $usuario->contrasenia_temp
            ],
        ];

        $helpCorreo = new CorreosHelper();
        $helpCorreo->enviarCorreoRecuperarPass($correo,
            Lang::get("messages.restablecer_pass.exito"),
            $datos);

        return new RespuestaModel(true,  $correo, Lang::get('messages.restablecer_pass.exito_info'));
    }

    public function actualizarPass($usuario, $correo, $nuevaContrasena)
    {

        $usuario = $this->where('usuario', $usuario)
            ->where('correo', $correo)
            ->where('activo', true)
            ->first();

        if ($usuario != null) {
            $usuario->contrasenia = bcrypt($nuevaContrasena);
            $usuario->fecha_ultima_mod = Carbon::now();
            $usuario->save();

            return new RespuestaModel(true,  $this->id_usuario, Lang::get('messages.restablecer_pass.exito_cambio'));
        }

        return new RespuestaModel(false,  $this->id_usuario, Lang::get('messages.restablecer_pass.usu_no_existe'));
    }

    public function buscarUsuarios($params)
    {
        $query = DB::table($this->table.' as us')
            ->join('cat_roles as rol',  'rol.id_rol', 'us.id_rol')

            ->leftJoin(DB::raw('(SELECT user_id, MAX(created_at) fecha_ultimo_ingreso
               FROM oauth_access_tokens GROUP BY user_id)
               as ultIngr'),
                function($join)
                {
                    $join->on('us.id_usuario', '=', 'ultIngr.user_id');
                })

            ->select('us.*', 'rol.nombre_rol', 'ultIngr.fecha_ultimo_ingreso')
            ->distinct();

        if ($params["nombre"] != null) {
            $query->where(DB::raw("upper(CONCAT(nombre_usuario,' ', primer_apellido_usuario, ' ', segundo_apellido_usuario))"), 'like', '%' . strtoupper($params["nombre"]). '%');
        }

        if ($params["aPaterno"] != null) {
            $query->where(DB::raw("upper(primer_apellido_usuario)"), 'like', '%' . strtoupper($params["aPaterno"]). '%');
        }

        if ($params["aMaterno"] != null) {
            $query->where(DB::raw("upper(segundo_apellido_usuario)"), 'like', '%' . strtoupper($params["aMaterno"]). '%');
        }

        if ($params["idRol"] != null) {
            $query->where('us.id_rol', '=', $params["idRol"]);
        }

        if ($params["estatus"] === false || $params["estatus"] === true) {
            $query->where('us.activo', '=', $params["estatus"]);
        }

        $data = $query->get();

        $resultado = Array();
        foreach ($data as $dat) {
            $temp = [
                "id" => $dat->id_usuario,
                "nombre" => $dat->nombre_usuario,
                "aPaterno" => $dat->primer_apellido_usuario,
                "aMaterno" => $dat->segundo_apellido_usuario,
                "nombreCompleto" => $dat->nombre_usuario.' '.$dat->primer_apellido_usuario.' '.$dat->segundo_apellido_usuario,
                "usuario" => $dat->usuario,
                "email" => $dat->correo,
                "idRol" => $dat->id_rol,
                "rol" => $dat->nombre_rol,
                "estatus" => $dat->activo == 1,
                "fechaRegistro" => $dat->fecha_alta,
                "fechaModificacion" => $dat->fecha_ultima_mod,
                "fechaUltimoIngreso" => $dat->fecha_ultimo_ingreso,
            ];
            array_push($resultado, $temp);
        }

        return $resultado;
    }

    public function guardarUsuario($parametros): RespuestaModel
    {
        $queryVal = $this::
        where(DB::raw("upper(usuario)"), '=', strtoupper($parametros["usuario"]));

        if (isset($parametros["id"]) && $parametros["id"] != null) {
            $queryVal->where('id_usuario', '<>', $parametros["id"]);
        }

        $existeCoincidencia = $queryVal->first();

        if ($existeCoincidencia != null) {
            return new RespuestaModel(false, null, Lang::get('messages.request_reg_existe'));
        }


        DB::beginTransaction();
        try {
            if ($parametros["id"])
                $datoGuardar = $this::find($parametros["id"]);

            if (!isset($datoGuardar)) {
                $datoGuardar = new User();
                $datoGuardar->contrasenia = bcrypt($parametros["contrasena"]);
                $datoGuardar->fecha_alta = Carbon::now();
                $datoGuardar->activo = true;
            } else {
                if (isset($parametros["estatus"])) {
                    $datoGuardar->activo = $parametros["estatus"];
                }
            }

            if (isset($parametros["nombre"])) {
                $datoGuardar->nombre_usuario = $parametros["nombre"];
            }

            if (isset($parametros["aPaterno"])) {
                $datoGuardar->primer_apellido_usuario = $parametros["aPaterno"];
            }

            if (isset($parametros["aMaterno"])) {
                $datoGuardar->segundo_apellido_usuario = $parametros["aMaterno"];
            }

            if (isset($parametros["usuario"])) {
                $datoGuardar->usuario = $parametros["usuario"];
            }

            if (isset($parametros["idRol"])) {
                $datoGuardar->id_rol = $parametros["idRol"];
            }

            if (isset($parametros["email"])) {
                $datoGuardar->correo = $parametros["email"];
            }

            $datoGuardar->fecha_ultima_mod = Carbon::now();
            $datoGuardar->usuario_ultima_mod = $parametros["idUsuario"];

            $datoGuardar->save();

            DB::commit();

            return new RespuestaModel(true,  $datoGuardar->id_rol, Lang::get('messages.request_guardar'));

        } catch (\Exception $th) {
            Log::error($th);
            DB::rollback();
            return new RespuestaModel(false,  null, $th);
        }

    }

    public function guardarUsuarioProveedor($parametros): RespuestaModel
    {
        $queryVal = $this::
        where(DB::raw("upper(usuario)"), '=', strtoupper($parametros["usuario"]));

        if (isset($parametros["id"]) && $parametros["id"] != null) {
            $queryVal->where('id_usuario', '<>', $parametros["id"]);
        }

        $existeCoincidencia = $queryVal->first();

        if ($existeCoincidencia != null) {
            return new RespuestaModel(false, null, Lang::get('messages.request_reg_existe'));
        }


        DB::beginTransaction();
        try {
            if ($parametros["id"])
                $datoGuardar = $this::find($parametros["id"]);

            if (!isset($datoGuardar)) {
                $datoGuardar = new User();
                $datoGuardar->contrasenia = bcrypt($parametros["contrasena"]);
                $datoGuardar->fecha_alta = Carbon::now();
                $datoGuardar->activo = true;
            } else {
                if (isset($parametros["estatus"])) {
                    $datoGuardar->activo = $parametros["estatus"];
                }
            }

            if (isset($parametros["nombre"])) {
                $datoGuardar->nombre_usuario = $parametros["nombre"];
            }

            if (isset($parametros["aPaterno"])) {
                $datoGuardar->primer_apellido_usuario = $parametros["aPaterno"];
            }

            if (isset($parametros["aMaterno"])) {
                $datoGuardar->segundo_apellido_usuario = $parametros["aMaterno"];
            }

            if (isset($parametros["usuario"])) {
                $datoGuardar->usuario = $parametros["usuario"];
            }

            if (isset($parametros["idRol"])) {
                $datoGuardar->id_rol = $parametros["idRol"];
            }

            if (isset($parametros["email"])) {
                $datoGuardar->correo = $parametros["email"];
            }

            $datoGuardar->fecha_ultima_mod = Carbon::now();
            $datoGuardar->usuario_ultima_mod = $parametros["idUsuario"];

            $datoGuardar->save();

            DB::commit();

            return new RespuestaModel(true,  $datoGuardar->id_usuario, Lang::get('messages.request_guardar'));

        } catch (\Exception $th) {
            Log::error($th);
            DB::rollback();
            return new RespuestaModel(false,  null, $th);
        }

    }

    public function cambiarEstatusUsuario($parametros): RespuestaModel
    {
        DB::beginTransaction();
        try {
            $datoGuardar = $this::find($parametros["id"]);

            $datoGuardar->activo = $parametros["estatus"];
            $datoGuardar->fecha_ultima_mod = Carbon::now();
            $datoGuardar->usuario_ultima_mod = $parametros["idUsuario"];

            $datoGuardar->save();

            DB::commit();

            return new RespuestaModel(true,  $datoGuardar->id_funcionalidad, Lang::get('messages.request_actualizar'));

        } catch (\Exception $th) {
            Log::error($th);
            DB::rollback();
            return new RespuestaModel(false,  null, $th);
        }

    }

    public function cambiarContrasena($parametros): RespuestaModel
    {
        DB::beginTransaction();
        try {
            $datoGuardar = $this::find($parametros["id"]);

            $datoGuardar->contrasenia = bcrypt($parametros["contrasena"]);
            $datoGuardar->fecha_ultima_mod = Carbon::now();
            $datoGuardar->usuario_ultima_mod = $parametros["idUsuario"];

            $datoGuardar->save();

            DB::commit();

            return new RespuestaModel(true,  $datoGuardar->id_funcionalidad, Lang::get('messages.request_actualizar'));

        } catch (\Exception $th) {
            Log::error($th);
            DB::rollback();
            return new RespuestaModel(false,  null, $th);
        }

    }

    public static function usuarioTieneRol($nombre_usuario, $id_rol)
    {
        $tiene = DB::table('ms_usuarios as usu')
            ->where('usu.id_usuario', '=', $nombre_usuario)
            ->where('usu.activo', '=', 1)
            ->where('usu.id_rol','=',$id_rol)
            ->count('*');

        if($tiene > 0){
            return true;
        }else{
            return false;
        }
    }

    public static function obtenerCorreoUsuario($usuario)
    {

        $query = DB::table('ms_usuarios as usu')
            ->select('usu.correo')
            ->where('usu.id_usuario', '=', $usuario);

        return $query->get()->first();
    }


}
