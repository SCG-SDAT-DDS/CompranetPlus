<?php

namespace App\Exceptions;

use App\Models\RespuestaServicio;
use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Illuminate\Support\Facades\Lang;
use Illuminate\Validation\ValidationException;
use Throwable;

class Handler extends ExceptionHandler
{
    /**
     * A list of exception types with their corresponding custom log levels.
     *
     * @var array<class-string<\Throwable>, \Psr\Log\LogLevel::*>
     */
    protected $levels = [
        //
    ];

    /**
     * A list of the exception types that are not reported.
     *
     * @var array<int, class-string<\Throwable>>
     */
    protected $dontReport = [
        //
    ];

    /**
     * A list of the inputs that are never flashed to the session on validation exceptions.
     *
     * @var array<int, string>
     */
    protected $dontFlash = [
        'current_password',
        'password',
        'password_confirmation',
    ];

    /**
     * Register the exception handling callbacks for the application.
     *
     * @return void
     */
    public function register()
    {
        $this->reportable(function (Throwable $e) {
            //
        });
    }

    public function render($request, Exception|Throwable $e)
    {
        if ($request->wantsJson()) {
            // Define the response
            $response = [

            ];

            // If the app is in debug mode
            if (config('app.debug')) {
                // Add the exception class name, message and stack trace to response
                $response['exception'] = get_class($e); // Reflection might be better here
                $response['trace'] = $e->getTraceAsString();
            }

            // Default response of 400
            $status = self::getStatus($e);

            // If this exception is an instance of HttpException
            if ($this->isHttpException($e)) {
                // Grab the HTTP status code from the Exception
                $status = $e->getStatusCode();
            }

            // If is validation exception and json request
            if ($e instanceof ValidationException && $request->wantsJson())
            {
                // Apply pluralization
                $messages = $e->validator->errors()->all();
                $message = array_shift($messages);
                if ($additional = count($messages)) {
                    $pluralized = $additional === 1 ? __('error') : __('errores');
                    $message .= __(" (y :additional :pluralized más)", compact('additional', 'pluralized'));
                }
                return (RespuestaServicio::setError($response, $message, $status))->getResponse();
            }

            return (RespuestaServicio::setError($response, $e->getMessage(), $status))->getResponse();
        }

        // Default to the parent class' implementation of handler
        return parent::render($request, $e);
    }

    private function getStatus($e){
        $status = 400;
        switch(get_class(($e))){
            case 'Illuminate\Validation\ValidationException': $status = 400; break;
            default: $status = 500; break;
        }
        return $status;
    }
}
