import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-captcha',
  templateUrl: './captcha.component.html',
  styleUrls: ['./captcha.component.css'],
  imports: [NgbModule, CommonModule, FormsModule, ReactiveFormsModule],
  standalone: true
})
export class CaptchaComponent {
  @Input() captchaFormRegistro: boolean = false;
  @Output() captchaValidacion = new EventEmitter<boolean>();

  captchaIncorrecto: boolean = false;
  captchaCorrecto: boolean = false;
   //captcha
  captcha: string = '';
   //input
  inputText: string = '';
  imageDataUrl: string | undefined;

  constructor() {
     this.captcha = this.generateRandomString(6);
     this.generateImage();
  }


  resolved(captchaResponse: string) {
    this.captcha = captchaResponse;
  }
  generateImage() {
    let texto =  this.captcha;

    // Obtenemos el factor de escala de píxeles del dispositivo
    const pixelRatio = window.devicePixelRatio || 1;

    // Creamos un canvas con el factor de escala ajustado
    let canvas = document.createElement("canvas");
    // Obtenemos el contexto
    let context = canvas.getContext("2d");
    // Definimos el tamaño del canvas con el factor de escala ajustado
    canvas.width = 260 * pixelRatio;
    canvas.height = 40 * pixelRatio;

    // Dibujamos el texto
    const fontSize = 30; // Tamaño de fuente reducido para adaptarse al canvas pequeño
    const separation = 15; // Separación horizontal entre caracteres
    context!.font = `${fontSize}px Arial`;

    // Calculamos la posición vertical para centrar las letras
    const centerY = (canvas.height + fontSize) / 3; // Ajustamos la posición

    for (let i = 0; i < texto.length; i++) {
      const character = texto[i];
      const x = 30 + i * (fontSize * 0.6) + i * separation;
      const y = centerY;

      // Seleccionamos un ángulo aleatorio entre 10 y 80 grados
      const angle = (Math.random() * 70 + 10) * (Math.PI / 180);

      // Seleccionamos factores aleatorios de escala para distorsionar la forma
      const scaleX = 1 + (Math.random() - 0.5) * 0.5; // Ajusta el factor de escala en X
      const scaleY = 1 + (Math.random() - 0.5) * 0.5; // Ajusta el factor de escala en Y

      // Guardamos el contexto actual antes de aplicar la transformación
      context!.save();

      // Aplicamos las transformaciones en el contexto
      context!.translate(x, y);
      context!.rotate(angle);
      context!.scale(scaleX, scaleY); // Aplicamos la escala

      // Dibujamos el caracter en la posición actual (0, 0)
      context!.fillText(character, 0, 0);

      // Restauramos el contexto para el siguiente caracter
      context!.restore();
    }

    // Dibujamos las rayas pequeñas del canvas
    context!.strokeStyle = "black";

    for (let i = 0; i < 300; i++) {
      const y = Math.random() * canvas.height;
      const x1 = Math.random() * canvas.width +30;
      const x2 = x1 + Math.random() * 60; // Longitud de la raya

      const angle = Math.random() * Math.PI; // Grados de inclinación aleatorios

      context!.beginPath();
      context!.moveTo(x1, y);
      context!.lineTo(x2, y);
      context!.rotate(angle);
      context!.stroke();
    }

    // Obtenemos la imagen en base64
    this.imageDataUrl = canvas.toDataURL();
  }

  validarCaptcha() {
    if (this.captcha == this.inputText) {
    const captchaResponse = false;
    this.captchaValidacion.emit(captchaResponse);

    this.captchaCorrecto= true;
    this.captchaIncorrecto=false;

    } else {

      const captchaResponse = true;
      this.captchaValidacion.emit(captchaResponse);

      this.captchaIncorrecto = true;
      this.captchaCorrecto=false;



    }
  }


  generateRandomString(length: number): string {
    const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';

    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      result += characters.charAt(randomIndex);
    }

    return result;
  }



  refreshCaptcha() {
    this.captcha = this.generateRandomString(6);
    this.generateImage();
    const captchaResponse = true;
    this.captchaValidacion.emit(captchaResponse);
    this.captchaIncorrecto = true;
    this.captchaCorrecto=false;
    this.inputText = '';
  }

}
