import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Snippets } from './components/snippets/snippets';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Snippets],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
}
