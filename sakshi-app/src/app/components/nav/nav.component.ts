import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { RouterModule } from '@angular/router';

import { AuthService } from '../../_services/auth.service';
import { MatMenuModule } from '@angular/material/menu';

import { User } from '../../_models/User';

@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [CommonModule, RouterModule, MatMenuModule],
  templateUrl: './nav.component.html',
})
export class NavComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  isNavOpen = false;
  signinSub!: Subscription;

  constructor(private authSrv: AuthService) {}

  ngOnInit() {
    this.signinSub = this.authSrv.currentUser$.subscribe((user) => {
      this.currentUser = user;
    });
  }

  googleSignOut() {
    this.authSrv.googleSignOut();
  }

  toggleNav(v?: boolean) {
    this.isNavOpen = v ?? !this.isNavOpen;
  }

  ngOnDestroy(): void {
    this.signinSub.unsubscribe();
  }
}
