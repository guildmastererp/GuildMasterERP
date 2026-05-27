import { Component, OnInit } from '@angular/core';
import { CharacterService } from './services/character'; // <-- Si sigue dando error aquí, mira el paso de abajo

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
  standalone: false 
})
export class App implements OnInit {
  personajes: any[] = [];

  constructor(private characterService: CharacterService) {}

  ngOnInit(): void {
    this.characterService.getCharacters().subscribe({
      next: (response: any) => { 
        this.personajes = response.data;
      },
      error: (err: any) => { 
        console.error('Error al conectar con Laravel:', err);
      }
    });
  }
}