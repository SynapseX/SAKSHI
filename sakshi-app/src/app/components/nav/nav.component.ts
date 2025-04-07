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
  styleUrl: './nav.component.scss',
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

  // @HostListener('window:scroll', ['$event'])
  // onWindowScroll() {
  //   const nav = document.querySelector('nav.navbar') as HTMLElement;
  //   const navLinks = document.querySelectorAll(
  //     'nav.navbar .nav_link_desk'
  //   ) as NodeListOf<HTMLAnchorElement>;
  //   if (window.scrollY > nav.clientHeight + 60) {
  //     nav.classList.add('navbar-plain');
  //     navLinks.forEach((a) => a.classList.add('nav_link_desk_plain'));
  //   } else {
  //     nav.classList.remove('navbar-plain');
  //     navLinks.forEach((a) => a.classList.remove('nav_link_desk_plain'));
  //   }
  // }

  googleSignOut() {
    this.authSrv.googleSignOut();
  }

  toggleNav(v?: boolean) {
    this.isNavOpen = v ?? !this.isNavOpen;
  }

  loadDefaultImage(e: any) {
    e.target.src =
      'https://img.freepik.com/free-psd/3d-illustration-person-with-sunglasses_23-2149436188.jpg';
  }

  ngOnDestroy(): void {
    this.signinSub.unsubscribe();
  }
}
