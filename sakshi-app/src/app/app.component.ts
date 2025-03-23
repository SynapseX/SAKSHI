import { Component, OnInit, AfterContentInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { NavComponent } from './components/nav/nav.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, NavComponent, HomeComponent, RouterOutlet],
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
  title = 'sakshi.ai';

  constructor() {}

  ngOnInit(): void {}
}
