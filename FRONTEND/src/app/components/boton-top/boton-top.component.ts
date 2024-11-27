import { CommonModule } from '@angular/common';
import { Component, HostListener } from '@angular/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-boton-top',
  templateUrl: './boton-top.component.html',
  styleUrls: ['./boton-top.component.css'],
  standalone: true,
  imports: [NgbModule , CommonModule]
})
export class BotonTopComponent {
  scrolled: boolean = false;


  @HostListener('window:scroll', [])
  onWindowScroll() {
    const numb = window.scrollY;
    if (numb >= 200) {
      this.scrolled = true;
    } else {
      this.scrolled = false;
    }
  }
 

  subir() {
    window.scrollTo({top: 0, behavior: 'smooth'});
  }

}
