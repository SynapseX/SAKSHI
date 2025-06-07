import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HomeComponent } from './features/home/home.component';
import { NavComponent } from './components/nav/nav.component';
import { TextToSpeechService } from '@/speech-module/text-to-speech.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, NavComponent, HomeComponent, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  title = 'sakshi.ai';

  constructor(private text2Speech: TextToSpeechService) {}

  ngOnInit(): void {}
}
