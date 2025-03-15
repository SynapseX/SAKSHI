import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { NavComponent } from './components/nav/nav.component';
import { AuthService } from './_services/auth.service';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [CommonModule, NavComponent, HomeComponent, RouterOutlet],
    templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
    title = 'sakshi.ai';

    constructor(private authSrv: AuthService) {}

    ngOnInit(): void {
        this.authSrv.checkUserLoggedIn();
    }
}
