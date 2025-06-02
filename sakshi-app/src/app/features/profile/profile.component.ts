import { Component, OnDestroy, OnInit } from '@angular/core';
import { ProfileFieldComponent } from './profile-field/profile-field.component';
import { AuthService } from '@/_services/auth.service';
import { User } from '@/_models/User';
import { Subscription } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [ProfileFieldComponent, MatIconModule, MatButtonModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent implements OnInit, OnDestroy {
  authSub!: Subscription;
  user: User | null = null;
  userDetails: any = null;

  constructor(private authSrv: AuthService) {}

  ngOnInit(): void {
    this.authSub = this.authSrv.currentUser$.subscribe({
      next: (u) => {
        if (u) {
          this.user = u;
          this.authSrv.getDBUser(u.email || '').subscribe({
            next: (_u: any) => {
              console.log(_u);

              if (_u) this.userDetails = _u.user;
            },
          });
        }
      },
    });
  }

  ngOnDestroy(): void {
    this.authSub.unsubscribe();
  }
}
