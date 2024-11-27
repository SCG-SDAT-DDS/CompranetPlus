<?php

namespace App\Console\Commands;

use App\Mail\TestMail;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

class SendTestEmail extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'email:send-test {email}';


    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Enviar un correo de prueba';

    public function __construct()
    {
        parent::__construct();
    }

    public function handle()
    {
        $email = $this->argument('email');
        Mail::to($email)->send(new TestMail());
        $this->info('Correo de prueba enviado a ' . $email);
    }
}
