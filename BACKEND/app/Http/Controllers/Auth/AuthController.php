<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\BitacoraModel;
use App\Models\CatUnidadesCompradorasModel;
use App\Models\CatUnidadesResponsablesModel;
use App\Models\DetalleBitacoraModel;
use App\Models\ProveedorModel;
use App\Models\RespuestaServicio;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Lang;

class AuthController extends Controller
{

    /**
     * Inicio de sesión y creación de token
     */
    public function login(Request $request)
    {
        $request->validate([
            'usuario' => 'required|string',
            'password' => 'required|string'
        ]);

        $credentials = ['usuario' => $request->usuario, 'password' => $request->password];
        $resp = new RespuestaServicio();

        if (!Auth::attempt($credentials))
            return $resp->setError(null, Lang::get('messages.system_login_error'))->getResponse();

        $user = $request->user();

        $privilegiosFuncionesBd = User::obtenerPrivilegiosFunciones($request->usuario);
        $privilegiosRolesBd = User::obtenerPrivilegiosRoles($request->usuario);
        $usuarioBd = User::findByUser($request->usuario);

        $tokenResult = $user->createToken('user_api_token')->accessToken;


        $usuarioBd = User::findByUser($request->usuario);
        $unidadesCompradoras = CatUnidadesCompradorasModel::findByIdUsuario($usuarioBd->id_usuario);
        $unidadesResponsables = CatUnidadesResponsablesModel::findByIdUsuario($usuarioBd->id_usuario);
        $proveedor = ProveedorModel::findDataProveedor($usuarioBd->id_usuario);

        $lstUnidades = [];
        foreach ($unidadesCompradoras as $uni) {
            $lstUnidades[] = [
                'idU' => $uni->id_unidad_compradora,
                'nombreU' => $uni->nombre_unidad_compradora
            ];
        }

        $lstUnidadesResp = [];
        foreach ($unidadesResponsables as $uni) {
            $lstUnidadesResp[] = [
                'idUR' => $uni->id_unidad_responsable,
                'nombreUR' => $uni->nombre_unidad_responsable
            ];
        }


        //VARIABLES PARA BITACORA

        $seccion = "Iniciar sesión";
        $descripcionAccion = "Inicio de sesión del usuario: ".$request->usuario;


        //BITACORA

        $bitacoraModel = new BitacoraModel($usuarioBd->id_usuario,
            $seccion,
            $descripcionAccion);

        $bit = new DetalleBitacoraModel();
        $respBit = $bit->guardarBitacora($bitacoraModel);

        //BITACORA

        return $resp->setExito([
            'access_token' => $tokenResult,
            'functions' => $privilegiosFuncionesBd,
            'roles' => $privilegiosRolesBd,
            'me' => $usuarioBd->nombre_usuario.' '.$usuarioBd->primer_apellido_usuario.' '.$usuarioBd->segundo_apellido_usuario,
            'id' => $usuarioBd->id_usuario,
            'proveedor' => $proveedor,
            'unidades_compradoras' => $lstUnidades,
            'unidades_responsables' => $lstUnidadesResp,
            'token_type' => 'Bearer'
        ], Lang::get('messages.system_login_exito'))->getResponse();
    }

    /**
     * Cierre de sesión (anular el token)
     */
    public function logout(Request $request)
    {
        $request->user()->token()->revoke();

        return  (new RespuestaServicio())->setExito(null, 'Se finalizó la sesión con éxito');
    }

    public function passwordReset(Request $request)
    {
        $request->validate([
            'usuario' => 'required|string',
            'correo' => 'required|string|email',
        ]);

        $user = new User();
        $respServ = $user->generarCodigoRecuperarPass($request->usuario, $request->correo);

        $resp = new RespuestaServicio();
        if ($respServ->exito) {
            return $resp->setExito($respServ->datos, $respServ->mensaje)->getResponse();
        } else {
            return $resp->setError(null, $respServ->mensaje)->getResponse();
        }
    }

    public function validarCodigoPass(Request $request)
    {
        $request->validate([
            'usuario' => 'required|string',
            'correo' => 'required|string|email',
            'codigo' => 'required|string',
        ]);

        $user = new User();
        $respServ = $user->validarCodigoPass($request->usuario, $request->correo, $request->codigo);

        $resp = new RespuestaServicio();
        if ($respServ->exito) {
            return $resp->setExito($respServ->datos, $respServ->mensaje)->getResponse();
        } else {
            return $resp->setError(null, $respServ->mensaje)->getResponse();
        }
    }

    public function updatePassword(Request $request)
    {
        $request->validate([
            'usuario' => 'required|string',
            'correo' => 'required|string|email',
            'nuevaContrasena' => 'required|string',
        ]);

        $usuario = new User();
        $respServ = $usuario->actualizarPass($request->usuario, $request->correo, $request->nuevaContrasena);

        $resp = new RespuestaServicio();
        if ($respServ->exito) {
            return $resp->setExito($respServ->datos, $respServ->mensaje)->getResponse();
        } else {
            return $resp->setError(null, $respServ->mensaje)->getResponse();
        }
    }

}
