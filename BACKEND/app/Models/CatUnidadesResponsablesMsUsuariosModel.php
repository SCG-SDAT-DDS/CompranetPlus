<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Lang;

class CatUnidadesResponsablesMsUsuariosModel extends Model{

    public $timestamps = false;

    protected $table = 'cat_unidad_responsable_ms_usuario';
    protected $primaryKey = 'id_cat_unidad_responsable_ms_usuario';
    protected $fillable = [
        'id_unidad_responsable',
        'id_usuario',
        'activo',
        'fecha_ultima_mod',
        'usuario_ultima_mod'
    ];

    protected $casts = [
        'fecha_ultima_mod' => 'datetime',
    ];

    public function getUsuariosSupervisor($params){
        try{
            $users = User::join('cat_unidad_responsable_ms_usuario','cat_unidad_responsable_ms_usuario.id_usuario','=','ms_usuarios.id_usuario')
                ->join('cat_roles', 'cat_roles.id_rol', '=', 'ms_usuarios.id_rol')
                ->select('ms_usuarios.*','cat_unidad_responsable_ms_usuario.activo as activo_usuario')
                ->where('cat_unidad_responsable_ms_usuario.activo',true)
                ->where('cat_roles.nombre_rol', 'SUPERVISOR')
                //->where('ms_usuarios.id_rol',5) //valiudar si este es el rol del usuario supervisor
                ->where('cat_unidad_responsable_ms_usuario.id_unidad_responsable',$params['id_unidad_responsable'])
                ->get();
            return $users;
        }catch (\Exception $th) {
            //Log::error($th);
            Log::info('****** CatUnidadesResponsablesMsUsuariosModel->getCatUnidadesResponsables');
            Log::error($th->getMessage());
            Log::error($th->getFile());
            Log::error($th->getLine());
            DB::rollback();
            return new RespuestaModel(false,  null, $th);
        }
    }

    public function getUsuariosSupervisorDisponibles($params){
        try{
            $users = User::leftJoin('cat_unidad_responsable_ms_usuario','cat_unidad_responsable_ms_usuario.id_usuario','=','ms_usuarios.id_usuario')
            ->join('cat_roles', 'cat_roles.id_rol', '=', 'ms_usuarios.id_rol')
            ->select('ms_usuarios.*','cat_unidad_responsable_ms_usuario.activo as activo_usuario')
            ->where('cat_roles.nombre_rol', 'SUPERVISOR')
                //->where('ms_usuarios.id_rol',5) //valiudar si este es el rol del usuario supervisor
                ->where(function($query) use($params){
                    $query->orWhere('cat_unidad_responsable_ms_usuario.id_usuario',null);
                    $query->orWhere('cat_unidad_responsable_ms_usuario.id_unidad_responsable','<>',$params['id_unidad_responsable']);
                    $query->orWhere('cat_unidad_responsable_ms_usuario.activo',false);
                })
                ->get();
            return $users;
        }catch (\Exception $th) {
            //Log::error($th);
            Log::info('****** CatUnidadesResponsablesMsUsuariosModel->getCatUnidadesResponsables');
            Log::error($th->getMessage());
            Log::error($th->getFile());
            Log::error($th->getLine());
            DB::rollback();
            return new RespuestaModel(false,  null, $th);
        }
    }

    public function catUnidadesResponsables(){
        return $this->hasOne('App\Models\CatUnidadesResponsablesModel','id_unidad_responsable','id_unidad_responsable');
    }

    public function msUsuario(){
        return $this->hasOne('App\Models\User','id_usuario','id_usuario');
    }

    public function guardarUnidadResponsableUsuario($params){
        try{
            //se cam
            $listadoUCompradoras = CatUnidadesCompradorasModel::obtenerUCompradoras($params['id_unidad_responsable']);
            $existeRegistro = CatUnidadesResponsablesMsUsuariosModel::where('activo',true)
                ->where('id_unidad_responsable',$params['id_unidad_responsable'])
                ->where('id_usuario',$params['id_usuario'])
                ->first();
            if($existeRegistro != null){
                return new RespuestaModel(false, null, Lang::get('messages.request_reg_existe'));
            }else{
                /**
                 * se cambia la implementación para no eliminar un registro fisicamente
                 * validamos si existe un registro en estatus eliminado y lo volveremos a activar
                 */
                $existeRegistroEliminado = CatUnidadesResponsablesMsUsuariosModel::where('activo',false)
                    ->where('id_unidad_responsable',$params['id_unidad_responsable'])
                    ->where('id_usuario',$params['id_usuario'])
                    ->first();
                if($existeRegistroEliminado != null){
                    DB::beginTransaction();
                    $existeRegistroEliminado->activo = true;
                    $existeRegistroEliminado->fecha_ultima_mod = Carbon::now();
                    $existeRegistroEliminado->usuario_ultima_mod =$params['id_usuario_sesion'];
                    $existeRegistroEliminado->save();

                    DB::commit();
                    return new RespuestaModel(true,$existeRegistroEliminado->id_cat_unidad_responsable_ms_usuario, Lang::get('messages.request_guardar'));
                }
                DB::beginTransaction();
                $catURUsuario = new CatUnidadesResponsablesMsUsuariosModel();
                $catURUsuario->id_unidad_responsable = $params['id_unidad_responsable'];
                $catURUsuario->id_usuario = $params['id_usuario'];
                $catURUsuario->fecha_ultima_mod = Carbon::now();
                $catURUsuario->usuario_ultima_mod =$params['id_usuario_sesion'];
                $catURUsuario->save();
                foreach ($listadoUCompradoras as $uCompradora) {
                    $catUCUsuario = new CatUnidadesCompradorasMsUsuariosModel();
                    $supervisorUnidad['id_unidad_compradora'] = $uCompradora->id_unidad_compradora;;
                    $supervisorUnidad['id_usuario'] = $params['id_usuario'];
                    $supervisorUnidad['id_usuario_sesion'] = $params['id_usuario_sesion'];
                    Log::info($supervisorUnidad);
                    $catUCUsuario->guardarUnidadCompradoraUsuario($supervisorUnidad);
                }
                DB::commit();
                return new RespuestaModel(true,$catURUsuario->id_cat_unidad_responsable_ms_usuario, Lang::get('messages.request_guardar'));
            }
        }catch (\Exception $th) {
            Log::error($th);
            DB::rollback();
            return new RespuestaModel(false,  null, $th);
        }
    }

    public function actualizarUnidadResponsableUsuario($params){
        try{
            DB::beginTransaction();
            $unidadResponsableUsuario = CatUnidadesResponsablesMsUsuariosModel::find($params['id_cat_unidad_responsable_ms_usuario']);
            isset($params['id_unidad_responsable']) ? $unidadResponsableUsuario->id_unidad_responsable = $params['id_unidad_responsable'] : false;
            isset($params['id_usuario']) ? $unidadResponsableUsuario->id_usuario = $params['id_usuario'] : false;
            isset($params['activo']) ? $unidadResponsableUsuario->activo = $params['activo'] : false;
            $unidadResponsableUsuario->fecha_ultima_mod = Carbon::now();
            $unidadResponsableUsuario->usuario_ultima_mod =$params['id_usuario_sesion'];
            $unidadResponsableUsuario->save();
            DB::commit();
            return new RespuestaModel(true,$unidadResponsableUsuario->id_cat_unidad_responsable_ms_usuario, Lang::get('messages.request_guardar'));
        }catch (\Exception $th) {
            Log::error('***** CatUnidadesResponsablesMsUsuariosModel->actualizarUnidadResponsableUsuario');
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
    public function eliminarUnidadResponsableUsuario($params){
        $listadoUCompradoras = CatUnidadesCompradorasModel::obtenerUCompradoras($params['id_unidad_responsable']);
        try{
            DB::beginTransaction();
            $catURUsuario=CatUnidadesResponsablesMsUsuariosModel::where('id_unidad_responsable',$params['id_unidad_responsable'])
                ->where('id_usuario',$params['id_usuario'])
                ->delete();

            foreach ($listadoUCompradoras as $uCompradora) {
                $catUCUsuario = new CatUnidadesCompradorasMsUsuariosModel();
                $supervisorUnidad['id_unidad_compradora'] = $uCompradora->id_unidad_compradora;;
                $supervisorUnidad['id_usuario'] = $params['id_usuario'];
                $catUCUsuario->eliminarUnidadCompradoraUsuario($supervisorUnidad);
            }
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
