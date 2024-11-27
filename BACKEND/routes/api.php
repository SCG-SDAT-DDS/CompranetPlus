<?php

use App\Http\Controllers\Compranet\PaseCajaController;
use Illuminate\Support\Facades\Route;
use \App\Http\Controllers\Convocantes\NumerosProcedimientosController;
use \App\Http\Controllers\Convocantes\ArchivosTestController;
/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::group([
    'middleware' => ['cors', 'json.response'],
    'prefix' => 'auth'], function () {

    Route::post('login', 'Auth\\AuthController@login');
    Route::get('passwordReset', 'Auth\\AuthController@passwordReset');
    Route::post('validarCodigoPass', 'Auth\\AuthController@validarCodigoPass');
    Route::post('udpatePassword', 'Auth\\AuthController@updatePassword');
});

Route::group([
    'middleware' => ['auth:api', 'cors', 'json.response'],
    ], function () {

    Route::post('/logout', 'Auth\AuthController@logout')->name('logout.api');
});

Route::group([
    'middleware' => ['auth:api', 'cors', 'json.response'],
    'prefix' => 'funcionesSistema'
], function () {
    Route::post('buscarFuncionSistema', 'Catalogos\\FuncionesSistemaController@buscarFuncionSistema');
    Route::patch('guardarFuncionSistema', 'Catalogos\\FuncionesSistemaController@guardarFuncionSistema');
    Route::patch('cambiarEstatusFuncionSistema', 'Catalogos\\FuncionesSistemaController@cambiarEstatusFuncionSistema');
});

Route::group([
    'middleware' => ['auth:api', 'cors', 'json.response'],
    'prefix' => 'rolesSistema'
], function () {
    Route::post('buscarRolesSistema', 'Catalogos\\RolesSistemaController@buscarRolesSistema');
    Route::patch('guardarRolesSistema', 'Catalogos\\RolesSistemaController@guardarRolesSistema');
    Route::patch('cambiarEstatusRolesSistema', 'Catalogos\\RolesSistemaController@cambiarEstatusRolesSistema');

    Route::get('obtenerFuncionesRolesSistema', 'Catalogos\\RolesSistemaController@obtenerFuncionesRolesSistema');
    Route::patch('activarRolSistema', 'Catalogos\\RolesSistemaController@activarRolSistema');
});

Route::group([
    'middleware' => ['auth:api', 'cors', 'json.response'],
    'prefix' => 'usuarios'
], function () {
    Route::post('buscarUsuarios', 'Catalogos\\UsuariosController@buscarUsuarios');
    Route::patch('guardarUsuario', 'Catalogos\\UsuariosController@guardarUsuario');
    Route::patch('cambiarEstatusUsuario', 'Catalogos\\UsuariosController@cambiarEstatusUsuario');
    Route::patch('cambiarContrasena', 'Catalogos\\UsuariosController@cambiarContrasena');
});

Route::group([
    'middleware' => ['auth:api','cors', 'json.response'],
    'prefix' => 'catalogos'
],function(){
    Route::post('tipoUnidadResponsable/buscar','Catalogos\\UnidadResponsableController@obtenerTipoUnidadesResponsables');
    Route::post('tipoProcedimiento/buscar','Catalogos\\CostosInscripcionController@obtenerCatTipoProcedimiento');

    Route::post('unidadResponsable/buscar','Catalogos\\UnidadResponsableController@obtenerUnidadesResponsables');
    Route::patch('unidadResponsable/guardar','Catalogos\\UnidadResponsableController@guardarUnidadResponsable');
    Route::patch('unidadResponsable/cambiarEstatus','Catalogos\\UnidadResponsableController@cambiarEstatusCUR');
    Route::post('unidadResponsable/buscarSupervisor','Catalogos\\UnidadResponsableController@obtenerUsuariosSupervisores');
    Route::post('unidadResponsable/buscarSupervisorDisponibles','Catalogos\\UnidadResponsableController@obtenerUsuariosSupervisoresDisponibles');
    Route::patch('unidadResponsable/agregarSupervisor','Catalogos\\UnidadResponsableController@guardarSupervisor');
    Route::patch('unidadResponsable/eliminarSupervisor','Catalogos\\UnidadResponsableController@eliminarSupervisor');

    Route::post('unidadCompradora/buscar','Catalogos\\UnidadesCompradorasController@obtenerUnidadesCompradoras');
    Route::post('unidadCompradora/registroByID','Catalogos\\UnidadesCompradorasController@obtenerUnidadCompradoraID');
    Route::patch('unidadCompradora/guardar','Catalogos\\UnidadesCompradorasController@guardarUnidadCompradora');
    Route::patch('unidadCompradora/cambiarEstatus','Catalogos\\UnidadesCompradorasController@cambiarEstatusCUC');

    Route::post('unidadCompradora/buscarUsuarios','Catalogos\\UnidadesCompradorasController@obtenerUsuariosCompradora');
    Route::post('unidadCompradora/buscarUsuariosDisponibles','Catalogos\\UnidadesCompradorasController@obtenerUsuariosCompradoraDisponibles');
    Route::patch('unidadCompradora/agregarUsuario','Catalogos\\UnidadesCompradorasController@guardarUsuarioCompradora');
    Route::patch('unidadCompradora/eliminarUsuario','Catalogos\\UnidadesCompradorasController@eliminarUsuarioCompradora');

    Route::post('unidadCompradoraADExt/buscar','Catalogos\\UnidadesCompradorasController@obtenerUnidadesCompradorasADExtemporaneas');
    Route::patch('unidadCompradoraADExt/guardar','Catalogos\\UnidadesCompradorasController@guardarUnidadCompradoraADExtemporanea');
    Route::patch('unidadCompradoraADExt/cambiarEstatus','Catalogos\\UnidadesCompradorasController@cambiarEstatusCUCADExtemporanea');

    Route::post('costosInscripciones/buscar','Catalogos\\CostosInscripcionController@obtenerMsCostosInscripcion');
    Route::patch('costosInscripciones/guardar','Catalogos\\CostosInscripcionController@guardarCostoInscripcion');
    Route::patch('costosInscripciones/cambiarEstatus','Catalogos\\CostosInscripcionController@cambiarEstatusCI');
    Route::post('costosInscripciones/buscarActuales','Catalogos\\CostosInscripcionController@obtenerMsCostosInscripcionActuales');

    Route::post('estados/buscar', 'Catalogos\\EstadosController@buscarEstado');
    Route::get('estados/obtener', 'Catalogos\\EstadosController@obtenerEstados');

    Route::post('municipios/buscar', 'Catalogos\\MunicipiosController@buscarMunicipio');
    Route::post('municipios/obtener', 'Catalogos\\MunicipiosController@obtenerMunicipios');

    Route::post('localidades/buscar', 'Catalogos\\LocalidadesController@buscarLocalidad');

    Route::post('asentamientos/buscar', 'Catalogos\\CodigoPostalController@buscarCodigoPostal');
    Route::patch('asentamientos/guardar', 'Catalogos\\CodigoPostalController@guardarAsentamiento');
    Route::patch('asentamientos/cambiarEstatus', 'Catalogos\\CodigoPostalController@cambiarEstatusAsentamiento');

    Route::post('diasFestivos/obtener', 'Catalogos\\DiasFestivosController@getDiasFestivos');
    Route::post('diasFestivos/guardar', 'Catalogos\\DiasFestivosController@guardarDiaFestivo');
    Route::patch('diasFestivos/cambiarEstatus', 'Catalogos\\DiasFestivosController@cambiarEstatusDiaFestivo');
    Route::get('diasFestivos/list', 'Catalogos\\DiasFestivosController@obtenerDiasFestivos');


    Route::post('tipoArchivo/buscar', 'Catalogos\\TipoArchivoController@buscarTipoArchivos');
    Route::post('tipoArchivo/guardar', 'Catalogos\\TipoArchivoController@guardarTipoArchivo');
    Route::post('tipoArchivo/cambiarEstatus', 'Catalogos\\TipoArchivoController@eliminarTipoArchivo');
    Route::post('tipoArchivo/coincidencia', 'Catalogos\\TipoArchivoController@obtenerCoincidencia');

    Route::post('personalidadJuridica/listado', 'CatalogosController@listadoPersonalidadJuridica');
    Route::post('estatusProcedimiento/listado', 'CatalogosController@listadoEstatusProcedimiento');
    Route::post('estatusParticipaciones/listado', 'CatalogosController@listadoEstatusParticipaciones');
});

Route::group([
    'middleware' => ['auth:api', 'cors', 'json.response'],
    'prefix' => 'tablero'
], function () {
    Route::post('tableroProcedimientos', 'Proveedores\\TableroProveedoresController@obtenerProcedimientosProveedor');
    Route::post('notificaciones/proveedor', 'Proveedores\\TableroProveedoresController@obtenerNotificacionesProveedor');
    Route::post('notificaciones/leida', 'Proveedores\\TableroProveedoresController@notificacionLeida');
    Route::post('detalleParticipante/obtener','Proveedores\\TableroProveedoresController@obtenerDetalleParticipante');
    Route::post('detalleParticipantePaseCaja/obtener','Proveedores\\TableroProveedoresController@obtenerDetalleParticipantePaseCaja');
    Route::patch('paseCaja/generar','Proveedores\\TableroProveedoresController@generarPaseCaja');
    Route::post('propuestaProveedor/guardar','Proveedores\\TableroProveedoresController@guardarPropuestasProveedor');
    Route::post('notificaciones/acusePropuesta', 'Proveedores\\TableroProveedoresController@notificarAcusePropuesta');
});

/**
 * rutas especialidas para la validacion de la firma electronica fiel
 */
Route::group([
    'middleware' => ['auth:api', 'cors', 'json.response'],
    'prefix' => 'fiel'
],function(){
    Route::post('datos-certificado','FielController@obtenerDatosCertificado')->name('fiel.datos_certificado');
    Route::post('validacion','FielController@validarFirmaElectronica')->name('fiel.validacion');

    Route::post('datos-certificado-old','FielControllerOld@obtenerDatosCertificado')->name('fiel.datos_certificado');
    Route::post('validacion-old','FielControllerOld@validarFirmaElectronica')->name('fiel.validacion');
});

Route::group([
    'middleware' => ['auth.basic.scce','cors', 'json.response'],
    'prefix' => 'externos'
], function () {
    Route::post('guardarProveedor', 'Proveedores\\ProveedorController@guardarProveedor');
});

Route::group([
    'middleware' => ['auth:api','cors', 'json.response'],
    'prefix' => 'procedimientos'
], function () {
    Route::post('obtenerTiposProcedimientos', 'Convocantes\\ProcedimientosController@obtenerTiposProcedimientos');
    Route::post('obtenerTiposCaracteres', 'Convocantes\\ProcedimientosController@obtenerTiposCaracteresLicitaciones');
    Route::post('obtenerTiposModalidades', 'Convocantes\\ProcedimientosController@obtenerTiposModalidadesLicitaciones');
    Route::post('obtenerTiposArchivos', 'Convocantes\\ProcedimientosController@obtenerTiposArchivos');
    Route::post('buscarProcedimientosAdministrativos', 'Convocantes\\ProcedimientosController@buscarProcedimientosAdministrativos');
    Route::patch('guardarProcedimientoAdministrativo', 'Convocantes\\ProcedimientosController@guardarProcedimientoAdministrativo');
    Route::post('obtenerProcedimientoAdministrativo', 'Convocantes\\ProcedimientosController@obtenerProcedimientoAdministrativo');
    Route::post('obtenerAnexosProcedimientoAdministrativo', 'Convocantes\\ProcedimientosController@obtenerAnexosProcedimientoAdministrativo');
    Route::patch('guardarAnexosProcedimientoAdministrativo', 'Convocantes\\ProcedimientosController@guardarAnexosProcedimientoAdministrativo');
    Route::post('obtenerContratosProcedimientoAdministrativo', 'Convocantes\\ProcedimientosController@obtenerContratosProcedimientoAdministrativo');
    Route::patch('guardarContratoProcedimientoAdministrativo', 'Convocantes\\ProcedimientosController@guardarContratoProcedimientoAdministrativo');
    Route::post('obtenerParticipantesGanadoresProcedimiento', 'Convocantes\\ParticipantesController@obtenerParticipantesGanadoresProcedimiento');
    Route::post('obtenerArchivoBase64', 'Convocantes\\ProcedimientosController@obtenerArchivoBase64');


    Route::post('obtenerEstatusProcedimiento', 'Convocantes\\ProcedimientosController@obtenerEstatusProcedimiento');
    Route::patch('guardarEstatusProcedimientoAdministrativo', 'Convocantes\\ProcedimientosController@cambiarEstatusProcedimiento');

    Route::post('obtenerUnidadesCompradorasUsuario', 'Convocantes\\ProcedimientosController@obtenerUnidadesCompradorasUsuario');

    Route::post('obtenerParticipanteInvitado', 'Convocantes\\ParticipantesController@obtenerParticipanteInvitado');
    Route::patch('cambiarEstatusParticipanteInvitado', 'Convocantes\\ParticipantesController@cambiarEstatusParticipante');
    Route::post('guardarParticipanteInvitado', 'Convocantes\\ParticipantesController@guardarParticipanteInvitado');

    Route::post('obtenerParticipanteInvitadoFallo', 'Convocantes\\ParticipantesController@obtenerParticipanteInvitadoFallo');
    Route::post('guardarFallo', 'Convocantes\\ParticipantesController@guardarParticipantesGanadores');

    //Acto de Recepcion y Apetura de Proposiciones
    Route::post('obtenerPermisosApetura', 'Convocantes\\ProcedimientosController@obtenerAutorizacionApertura');
    Route::post('autorizarApertura', 'Convocantes\\ProcedimientosController@generarAutorizacionApertura');
    Route::post('enviarAvisoPropuesta','Convocantes\\ParticipantesController@notificarDescargaPropuesta');

    Route::post('obtenerPropuestas','Convocantes\\ParticipantesController@obtenerProposiciones');
    Route::post('recepcionActo','Convocantes\\DetalleConvocatoriaController@recepcionApertura');


    //esto genera un post (update) y un get (show)
    Route::singleton('proximoNumeroProcedimiento', NumerosProcedimientosController::class)
        ->only(['show', 'update']);

    Route::post('almacenarArchivoTest', 'Convocantes\\ArchivosTestController@almacenarArchivoTest');
    Route::get('obtenerArchivoTest', 'Convocantes\\ArchivosTestController@obtenerArchivoTest');


    //Acto de Diferimiento de Apertura
    Route::post('obtenerFechasProcedimiento','Convocantes\\DetalleConvocatoriaController@obtenerDetalleFechas');
    Route::post('diferendoActo','Convocantes\\DetalleConvocatoriaController@diferendoActoApertura');

    // Adjudicaciones extemporaneas

    Route::get('obtenerADExtemporaneasUsuario','Convocantes\\ProcedimientosController@obtenerADExtemporaneasUsuario');
    Route::get('obtenerAniosPrevios','Convocantes\\ProcedimientosController@obtenerAniosPrevios');

    // Actualizar estatus CRON

    Route::get('actualizarEstatusCron','Convocantes\\ProcedimientosController@actualizarEstatusCron');

});

Route::group([
    'middleware' => ['auth:api','cors', 'json.response'],
    'prefix' => 'partidas'
], function () {
    //obtener partidas presupuestales
    Route::get('obtenerPartidasProcedimiento','Convocantes\\PartidasPresupuestalesController@obtenerPartidasProcedimiento');
    Route::get('obtenerAnexoPartidasProcedimiento','Convocantes\\PartidasPresupuestalesController@obtenerAnexoPartidasProcedimiento');
    Route::get('obtenerPartidasProveedor','Convocantes\\PartidasPresupuestalesController@obtenerPartidasProveedor');
    Route::get('obtenerPropuestaParticipanteProcedimiento','Convocantes\\PartidasPresupuestalesController@obtenerPropuestaParticipanteProcedimiento');
    Route::post('almacenarPartidasProveedor','Convocantes\\PartidasPresupuestalesController@almacenarPartidasProveedor');
});

Route::group([
    'middleware' => ['auth:api','cors', 'json.response'],
    'prefix' => 'juntas'
], function () {
    Route::get('obtenerPreguntasProcedimiento','Convocantes\\JuntasProcedimientosController@obtenerPreguntasProcedimiento');
    Route::get('obtenerArchivosPreguntasProcedimiento','Convocantes\\JuntasProcedimientosController@obtenerArchivosPreguntasProcedimiento');
    Route::post('guardarPreguntasProcedimiento','Convocantes\\JuntasProcedimientosController@guardarPreguntasProcedimiento');
    Route::post('guardarActaJunta','Convocantes\\JuntasProcedimientosController@guardarActaJunta');
    Route::get('obtenerUltimaJunta','Convocantes\\JuntasProcedimientosController@obtenerUltimaJunta');
    Route::post('crearProrrogaJunta','Convocantes\\JuntasProcedimientosController@crearProrrogaJunta');
});

Route::group([
    'middleware' => ['cors', 'json.response'],
    'prefix' => 'proveedores'
], function () {
    Route::post('guardarProveedor', 'Proveedores\\ProveedorController@guardarProveedor');
    Route::post('guardarSocioProveedor', 'Proveedores\\SociosController@guardarSocio');
    Route::post('obtenerProcedimientos','Convocantes\\ProcedimientosController@obtenerProcedimientosVistaPublica');
    Route::post('obtenerArchivoBase64', 'Convocantes\\ProcedimientosController@obtenerArchivoBase64');
    Route::post('detalleProcedimiento','Convocantes\\ProcedimientosController@obtenerDetalleProcedimientoAdministrativo');
    Route::post('unidadResponsable/obtener','Catalogos\\UnidadResponsableController@obtenerUnidadesResponsables');
    Route::post('buscarProveedores', 'Proveedores\\ProveedorController@buscarProovedores');
    Route::post('tipoProcedimiento/obtener','Catalogos\\CostosInscripcionController@obtenerCatTipoProcedimiento');
    Route::get('tipoContrataciones/obtener','Convocantes\\ProcedimientosController@obtenerTiposContrataciones');
    Route::post('buscarProveedores', 'Proveedores\\ProveedorController@buscarProovedores');
    Route::post('inscripcionProveedor', 'Proveedores\\TableroProveedoresController@inscripcionProcedimiento');

});

Route::group([
    'middleware' => ['auth:api','cors','json.response'],
    'prefix' => 'proveedor'
], function () {
    Route::post('completarRegistro','Proveedores\\ProveedorController@finalizarRegistroProveedor');
    Route::post('estatusProveedor','Proveedores\\ProveedorController@obtenerEstatusProveedor');
});

Route::group([
    'middleware' => ['cors', 'json.response'],
    'prefix' => 'cat'
], function () {
    Route::get('estados/obtener', 'Catalogos\\EstadosController@obtenerEstados');
    Route::post('municipios/obtener', 'Catalogos\\MunicipiosController@obtenerMunicipios');
    Route::post('localidades/obtener', 'Catalogos\\LocalidadesController@obtenerLocalidades');
    Route::post('asentamiento/obtener', 'Catalogos\\CodigoPostalController@obtenerAsentamientoByCP');

});

Route::group([
    'middleware' => ['auth:api', 'cors', 'json.response'],
    'prefix' => 'admin-proveedores'
], function () {
    Route::post('obtener', 'Proveedores\\ProveedorController@getProveedores');
    Route::patch('cambiarEstatusProveedor', 'Proveedores\\ProveedorController@cambiarEstatusProveedor');
    Route::post('guardarProveedor', 'Proveedores\\ProveedorController@guardarProveedor');
    Route::patch('eliminarProveedor', 'Proveedores\\ProveedorController@eliminarProveedor');
    Route::post('obtenerSociosProveedor', 'Proveedores\\SociosController@getSociosProveedor');
    Route::post('obtenerDocumentosProveedor', 'Proveedores\\DocumentsProveedorController@getDocumentosProveedor');
});

Route::group([
    'middleware' => ['auth:api','cors', 'json.response'],
    'prefix' => 'bitacoras'
], function () {
    Route::post('buscarBitacoras', 'Bitacoras\\BitacorasController@buscarBitacoras');

});

Route::group([
    'middleware' => ['auth:api','cors', 'json.response'],
    'prefix' => 'reportes'
], function () {
    Route::post('actualizar', 'ReportesController@actualizar');
    Route::post('columnas/listado', 'ReportesController@listadoColumnasDisponibles');
    Route::any('ultimoReporte', 'ReportesController@ultimoReporte');
    Route::post('miReporte/listado', 'ReportesController@listadoMisReportes');
    Route::post('miReporte/guardar', 'ReportesController@guardarMiReporte');
    Route::post('miReporte/eliminar', 'ReportesController@cambiarEstatusDR');
    Route::post('publicoAdmin/listado','ReportesController@rpListado');
    Route::post('publicoAdmin/agregar','ReportesController@rpAgregar');
    Route::post('publicoAdmin/eliminar','ReportesController@rpEliminar');
    Route::post('publicoAdmin/enviarCorreo','ReportesController@rpEnviarCorreo');
});

Route::group([
    'middleware' => ['cors', 'json.response'],
    'prefix' => 'reportes'
], function () {
    Route::get('actualizar', 'ReportesController@actualizar');
    Route::any('obtener', 'ReportesController@generar');
    Route::get('publico/descarga', 'ReportesController@rpDescarga');
});

Route::group([
    'middleware' => ['auth:api','cors', 'json.response'],
    'prefix' => 'paseCaja'
], function () {
    Route::get('/obtenerConceptos', [PaseCajaController::class, 'obtenerConceptosCobro']);
    Route::post('/generarPaseCaja', [PaseCajaController::class, 'generarPaseCaja']);
    Route::post('/obtenerB64PaseCaja', [PaseCajaController::class, 'obtenerB64PaseCaja']);
    Route::post('/consultarRecibo', [PaseCajaController::class, 'consultaRecibo']);
});
