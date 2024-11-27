<?php

namespace App\Models;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;


class CorreoModel extends Mailable
{

    use Queueable, SerializesModels;

    public $mensaje;

    public function __construct($mensaje) {
        $this->$mensaje = $mensaje;
    }

    public function build() {
        return $this->from('sender@example.com')
            ->view('mails.demo')
            ->text('mails.demo_plain')
            ->with([
                    'testVarOne' => '1',
                    'testVarTwo' => '2',
                ])
            ->attach(public_path('/images') . '/demo.jpg', [
                'as' => 'demo.jpg',
                'mime' => 'image/jpeg',
            ]);

    }

}
