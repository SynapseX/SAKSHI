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
  to!: boolean;
  signinSub!: Subscription;

  constructor(
    private authSrv: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.route.snapshot.paramMap.get('to');

    this.signinSub = this.authSrv.currentUser$.subscribe((user) => {
      if (user && this.router.url == '/auth') {
        // this.router.navigate(['/']);
        console.log('Signed In');
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
