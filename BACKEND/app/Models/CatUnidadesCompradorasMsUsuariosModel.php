<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Lang;

class CatUnidadesCompradorasMsUsuariosModel extends Model{

    public $timestamps = false;

    protected $table = 'cat_unidad_compradora_ms_usuario';
    protected $primaryKey = 'id_cat_unidad_compradora_ms_usuario';
    protected $fillable = [
        'id_unidad_compradora',
        'id_usuario',
        'activo',
        'fecha_ultima_mod',
        'usuario_ultima_mod'
    ];

    protected $casts = [
        'fecha_ultima_mod' => 'datetime',
    ];

    public function getUsuariosCompradora($params){
        try{
            $users = User::join('cat_unidad_compradora_ms_usuario','cat_unidad_compradora_ms_usuario.id_usuario','=','ms_usuarios.id_usuario')
                ->join('cat_roles', 'cat_roles.id_rol', '=', 'ms_usuarios.id_rol')
                ->select('ms_usuarios.*','cat_unidad_compradora_ms_usuario.activo as activo_usuario')
                ->where('cat_unidad_compradora_ms_usuario.activo',true)
                ->where('cat_roles.nombre_rol', 'CONVOCANTE')
                //->where('ms_usuarios.id_rol',3)  //valiudar si este es el rol del usuario para ñas imodades compradoras
                ->where('cat_unidad_compradora_ms_usuario.id_unidad_compradora',$params['id_unidad_compradora'])
                ->get();
            return $users;
        }catch (\Exception $th) {
            //Log::error($th);
            Log::info('****** CatUnidadesCompradoraMsUsuariosModel->getUsuariosComprador');
            Log::error($th->getMessage());
            Log::error($th->getFile());
            Log::error($th->getLine());
            DB::rollback();
            return new RespuestaModel(false,  null, $th);
        }
    }

    public function getUsuariosompradoraDisponibles($params){
        try{
            $users = User::leftJoin('cat_unidad_compradora_ms_usuario','cat_unidad_compradora_ms_usuario.id_usuario','=','ms_usuarios.id_usuario')
            ->join('cat_roles', 'cat_roles.id_rol', '=', 'ms_usuarios.id_rol')
            ->select('ms_usuarios.*','cat_unidad_compradora_ms_usuario.activo as activo_usuario')
            ->where('cat_roles.nombre_rol',  'CONVOCANTE')

                //->where('ms_usuarios.id_rol',3) //valiudar si este es el rol del usuario para ñas imodades compradoras
                ->where(function($query) use($params){
                    $query->orWhere('cat_unidad_compradora_ms_usuario.id_usuario',null);
                    $query->orWhere('cat_unidad_compradora_ms_usuario.id_unidad_compradora','<>',$params['id_unidad_compradora']);
                    $query->orWhere('cat_unidad_compradora_ms_usuario.activo',false);
                })
                ->get();
            return $users;
        }catch (\Exception $th) {
            //Log::error($th);
            Log::info('****** CatUnidadesCompradoraMsUsuariosModel->getUsuariosompradorDisponibles');
            Log::error($th->getMessage());
            Log::error($th->getFile());
            Log::error($th->getLine());
            DB::rollback();
            return new RespuestaModel(false,  null, $th);
        }
    }

    public function catUnidadesCompradora(){
        return $this->hasOne('App\Models\CatUnidadesCompradorasModel','id_unidad_compradora','id_unidad_compradora');
    }

    public function msUsuario(){
        return $this->hasOne('App\Models\User','id_usuario','id_usuario');
    }

    public function guardarUnidadCompradoraUsuario($params){
        try{
            $existeRegistro = CatUnidadesCompradorasMsUsuariosModel::where('activo',true)
                ->where('id_unidad_compradora',$params['id_unidad_compradora'])
                ->where('id_usuario',$params['id_usuario'])
                ->first();
            if($existeRegistro != null){
                return new RespuestaModel(false, null, Lang::get('messages.request_reg_existe'));
            }else{
                $existeRegistroEliminado = CatUnidadesCompradorasMsUsuariosModel::where('activo',false)
                ->where('id_unidad_compradora',$params['id_unidad_compradora'])
                ->where('id_usuario',$params['id_usuario'])
                ->first();
                if($existeRegistroEliminado != null){
                    DB::beginTransaction();
                    $existeRegistroEliminado->activo = true;
                    $existeRegistroEliminado->fecha_ultima_mod = Carbon::now();
                    $existeRegistroEliminado->usuario_ultima_mod =$params['id_usuario_sesion'];
                    $existeRegistroEliminado->save();
                    DB::commit();
                }
            }
            DB::beginTransaction();
            $catUCUsuario = new CatUnidadesCompradorasMsUsuariosModel();
            $catUCUsuario->id_unidad_compradora = $params['id_unidad_compradora'];
            $catUCUsuario->id_usuario = $params['id_usuario'];
            $catUCUsuario->fecha_ultima_mod = Carbon::now();
            $catUCUsuario->usuario_ultima_mod =$params['id_usuario_sesion'];
            $catUCUsuario->save();
            DB::commit();
            return new RespuestaModel(true,$catUCUsuario->id_cat_unidad_compradora_ms_usuario, Lang::get('messages.request_guardar'));
        }catch (\Exception $th) {
            Log::error($th);
            DB::rollback();
            return new RespuestaModel(false,  null, $th);
        }
    }

    public function actualizarUnidadCompradoraUsuario($params){
        try{
            DB::beginTransaction();
            $unidadCompradoraUsuario = CatUnidadesCompradorasMsUsuariosModel::find($params['id_cat_unidad_compradora_ms_usuario']);
            isset($params['id_unidad_compradora']) ? $unidadCompradoraUsuario->id_unidad_compradora = $params['id_unidad_compradora'] : false;
            isset($params['id_usuario']) ? $unidadCompradoraUsuario->id_usuario = $params['id_usuario'] : false;
            isset($params['activo']) ? $unidadCompradoraUsuario->activo = $params['activo'] : false;
            $unidadCompradoraUsuario->fecha_ultima_mod = Carbon::now();
            $unidadCompradoraUsuario->usuario_ultima_mod =$params['id_usuario_sesion'];
            $unidadCompradoraUsuario->save();
            DB::commit();
            return new RespuestaModel(true,$unidadCompradoraUsuario->id_cat_unidad_compradora_ms_usuario, Lang::get('messages.request_guardar'));
        }catch (\Exception $th) {
            Log::error('***** CatUnidadesCompradoraMsUsuariosModel->actualizarUnidadCompradoraUsuario');
            Log::error($th->getMessage());
            Log::error($th->getFile());
            Log::error($th->getLine());
            DB::rollback();
            return new RespuestaModel(false,  null, $th);
        }
    }

    /**
     * funcion de eliminar la relacion de un usuario y la unidad responsable
     * de momento se hace eliminado fisico por issue que se presenta al obtener
     * los usuarios disponibles si existe el mismo registro uno activo y otro inactivo
     */
    public function eliminarUnidadCompradoraUsuario($params){
        try{
            DB::beginTransaction();
            $catURUsuario=CatUnidadesCompradorasMsUsuariosModel::where('id_unidad_compradora',$params['id_unidad_compradora'])
                ->where('id_usuario',$params['id_usuario'])
                ->delete();
            DB::commit();
            return new RespuestaModel(true,$catURUsuario, Lang::get('messages.request_actualizar'));
        }catch (\Exception $th) {
            Log::error($th);
            DB::rollback();
            return new RespuestaModel(false,  null, $th);
        }
    }



}

?>
