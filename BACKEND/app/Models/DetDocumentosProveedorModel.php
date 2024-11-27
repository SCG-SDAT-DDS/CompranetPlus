<?php

namespace App\Models;

use App\Enums\TipoArchivo;
use App\Helper\ArchivosHelper;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Lang;
use Illuminate\Support\Facades\Log;

class DetDocumentosProveedorModel extends Model
{
    public $timestamps = false;
    protected $table = 'det_documentos_proveedores';
    protected $primaryKey = 'id_documento_proveedor';

    protected $fillable = [
        'id_proveedor',
        'url_documento_proveedor',
        'activo',
        'fecha_ultima_mod',
        'usuario_ultima_mod'
    ];

    protected $casts = [
        'fecha_ultima_mod' => 'datetime',
    ];

    public function getDocumentosProveedor($params)
    {
       $queryList = DB::table('det_documentos_proveedores as dp')
           ->distinct()
           ->where('dp.id_proveedor', $params['id_proveedor'])
           ->get();

        return $queryList;
    }

    public function guardarDocumentos($arrayDocuments ,$idProveedor, $rfcProveedor , $idUsuario): RespuestaModel
    {
        DB::beginTransaction();
        try{
            foreach($arrayDocuments as $doc){
                $datoGuardar = new DetDocumentosProveedorModel();
                if($doc["id_documento_proveedor"])
                    $datoGuardar = $this::find($doc["id_documento_proveedor"]);

                if (isset($doc["activo"])) {
                    $datoGuardar->activo = $doc["activo"];
                } else {
                    $datoGuardar->activo = true; // Valor por defecto si no se proporciona
                }


                if (isset($doc["url_documento_proveedor"])) {
                    $archivoProveedor = $doc["url_documento_proveedor"];
                    $url_documento_proveedor_rep = $this::almacenarArchivo($archivoProveedor, $rfcProveedor );
                    $datoGuardar->url_documento_proveedor = $url_documento_proveedor_rep;
                }


                $datoGuardar->id_proveedor = $idProveedor;
                $datoGuardar->fecha_ultima_mod = Carbon::now();

                $datoGuardar->usuario_ultima_mod = $idUsuario ?? null;

                $datoGuardar -> save();
            }

            DB::commit();

            return new RespuestaModel(true, $datoGuardar -> id_documento_proveedor, Lang::get('messages.request_guardar'));
        } catch (\Exception $th) {
            Log::error($th);
            DB::rollback();
            return new RespuestaModel(false,  null, $th);
        }
    }

    public function almacenarArchivo($request , $rfcProveedor)
    {
        $tipoArchivo  = TipoArchivo::obtenerTipoArchivo($request['tipoArchivo']);
        $archivo = new ArchivoModel($request['nombreArchivo'],
            $request['base64'],
            $tipoArchivo);

        $archHelp = new ArchivosHelper();
        $respServ = $archHelp->guardarDocumento(
            $archivo,
            strtoupper($rfcProveedor),
            $request['encriptar']
        );


        return $respServ->datos;
    }
}
