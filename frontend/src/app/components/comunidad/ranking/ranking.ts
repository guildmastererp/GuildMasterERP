import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-ranking',
  templateUrl: './ranking.html',
  styleUrls: ['./ranking.css'],
  standalone: false
})
export class Ranking {
  @Input() personajes: any[] = [];
}