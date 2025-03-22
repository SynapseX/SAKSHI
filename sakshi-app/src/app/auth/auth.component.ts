import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../_services/auth.service';
import { Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [],
  templateUrl: './auth.component.html',
})
export class AuthComponent implements OnInit, OnDestroy {
  signinSub!: Subscription;

  constructor(private authSrv: AuthService, private router: Router) {}

  ngOnInit() {
    this.signinSub = this.authSrv.currentUser$.subscribe((user) => {
      console.log(user, this.router.url);
      if (user && this.router.url == '/auth') {
        this.router.navigate(['/']);
      }
    });
  }

  googleSignIn() {
    this.authSrv.googleSignIn();
  }

  ngOnDestroy(): void {
    this.signinSub.unsubscribe();
  }
}
