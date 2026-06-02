import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-buscador',
  templateUrl: './buscador.html',
  styleUrls: ['./buscador.css'],
  standalone: false
})
export class Buscador {
  @Input() personajes: any[] = [];
}