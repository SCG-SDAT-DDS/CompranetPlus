<?php

namespace App\Models;

use App\Enums\TipoArchivo;
use App\Helper\ArchivosHelper;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Lang;
use Illuminate\Support\Facades\Log;


class ContratoModel extends Model
{

    public $timestamps = false;
    protected $table = 'ms_contratos';
    protected $primaryKey = 'id_contrato';

    protected $fillable = [
        'id_procedimiento_administrativo',
        'numero_contrato',
        'fecha_firma_contrato',
        'fecha_inicio_contrato',
        'fecha_fin_contrato',
        'contrato_generado',
        'monto',
        'monto_anticipo',
        'convenio_modificatorio',
        'url_archivo_convenio',
        'url_archivo_contrato',
        'activo',
        'fecha_ultima_mod',
        'usuario_ultima_mod'
    ];

    protected $casts = [
        'fecha_ultima_mod' => 'datetime',
    ];

    public function buscarContrato($params)
    {
        $query = DB::table('ms_contratos as c')
            ->join('det_participantes_procedimientos as pp','pp.id_participante_procedimiento','=','c.id_participante_procedimiento')
            ->join('ms_proveedores as p','pp.id_proveedor','=','p.id_proveedor')
            ->distinct()
            ->where('c.id_procedimiento_administrativo','=',$params["id_procedimiento_administrativo"])
            ->select('c.*', 'p.rfc_proveedor as rfc_proveedor', 'p.nombre_proveedor', 'p.primer_apellido_proveedor','p.segundo_apellido_proveedor', 'p.razon_social');


        $data = $query->get();

        return $data;
    }


    public function guardarContrato($parametros): RespuestaModel
    {

        DB::beginTransaction();
        try {
            if ($parametros["id_contrato"])
                $datoGuardar = $this::find($parametros["id_contrato"]);

            if (!isset($datoGuardar)) {
                $datoGuardar = new ContratoModel();
                $datoGuardar->activo = true;

            } else {
                if (isset($parametros["activo"])) {
                    $datoGuardar->activo = $parametros["activo"];
                }

            }

            if (isset($parametros["id_procedimiento_administrativo"])) {
                $datoGuardar->id_procedimiento_administrativo = $parametros["id_procedimiento_administrativo"];
            }

            if (isset($parametros["id_participante_procedimiento"])) {
                $datoGuardar->id_participante_procedimiento = $parametros["id_participante_procedimiento"];
            }

            if (isset($parametros["numero_contrato"])) {
                $datoGuardar->numero_contrato = $parametros["numero_contrato"];
            }
            if (isset($parametros["fecha_firma_contrato"])) {
                $datoGuardar->fecha_firma_contrato = $parametros["fecha_firma_contrato"];
            }
            if (isset($parametros["fecha_inicio_contrato"])) {
                $datoGuardar->fecha_inicio_contrato = $parametros["fecha_inicio_contrato"];
            }
            if (isset($parametros["fecha_fin_contrato"])) {
                $datoGuardar->fecha_fin_contrato = $parametros["fecha_fin_contrato"];
            }
            if (isset($parametros["contrato_generado"])) {
                $datoGuardar->contrato_generado = $parametros["contrato_generado"];
            }
            if (isset($parametros["monto"])) {
                $datoGuardar->monto = $parametros["monto"];
            }
            if (isset($parametros["monto_anticipo"])) {
                $datoGuardar->monto_anticipo = $parametros["monto_anticipo"];
            }
            if (isset($parametros["convenio_modificatorio"])) {
                $datoGuardar->convenio_modificatorio = $parametros["convenio_modificatorio"];
            }


            if (isset($parametros["archivo_contrato"])) {
                $archivoContrato= $parametros["archivo_contrato"];

                $url_contrato = $this::almacenarArchivo($archivoContrato);
                $datoGuardar->url_archivo_contrato = $url_contrato;
            }else{
                if (isset($parametros["url_archivo_contrato"])) {
                    $datoGuardar->url_archivo_contrato = $parametros["url_archivo_contrato"];
                }
            }



            if (isset($parametros["archivo_convenio"])) {
                $archivoConvenio = $parametros["archivo_convenio"];

                $url_convenio = $this::almacenarArchivo($archivoConvenio);
                $datoGuardar->url_archivo_convenio = $url_convenio;
            }else{
                if (isset($parametros["url_archivo_convenio"])) {
                    $datoGuardar->url_archivo_convenio = $parametros["url_archivo_convenio"];
                }
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


    public function almacenarArchivo($request)
    {
        $tipoArchivo  = TipoArchivo::obtenerTipoArchivo($request['tipoArchivo']);
        $archivo = new ArchivoModel($request['nombreArchivo'],
            $request['base64'],
            $tipoArchivo);

        $archHelp = new ArchivosHelper();
        $respServ = $archHelp->guardarDocumento(
            $archivo,
            $request['procedimiento'],
            $request['encriptar']
        );


        return $respServ->datos;
    }


}
