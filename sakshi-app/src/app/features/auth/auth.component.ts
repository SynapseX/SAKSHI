import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../../_services/auth.service';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [],
  templateUrl: './auth.component.html',
})
export class AuthComponent implements OnInit, OnDestroy {
  signinSub!: Subscription;

  constructor(
    private authSrv: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    const forwardUrl: string = this.route.snapshot.data['to'];

    this.signinSub = this.authSrv.currentUser$.subscribe({
      next: (user) => {
        if (user && this.router.url.startsWith('/auth')) {
          this.router.navigate(forwardUrl ? forwardUrl.split('/') : ['/']);
        }
      },
    });
  }

  googleSignIn() {
    this.authSrv.googleSignIn();
  }

  ngOnDestroy(): void {
    this.signinSub.unsubscribe();
  }
}
