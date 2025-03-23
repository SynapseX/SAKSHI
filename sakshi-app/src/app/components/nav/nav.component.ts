import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../_services/auth.service';
import { Subscription } from 'rxjs';

import { User } from '../../_models/User';

@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './nav.component.html',
})
export class NavComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  isNavOpen = false;
  isProfileOpen = false;
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

  toggleNav() {
    this.isNavOpen = !this.isNavOpen;
  }
  toggleProfile() {
    this.isProfileOpen = !this.isProfileOpen;
  }

  ngOnDestroy(): void {
    this.signinSub.unsubscribe();
  }
}
