import { NavComponent } from '@/components/nav/nav.component';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-main-with-nav',
  standalone: true,
  imports: [RouterModule, NavComponent],
  templateUrl: './main-with-nav.component.html',
})
export class MainWithNavComponent {}
