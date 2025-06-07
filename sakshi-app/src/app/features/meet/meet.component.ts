import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ISessionOutput } from '@/_models/Session';
import { EmptyBoxComponent } from '@/components/empty-box/empty-box.component';
import { MatIconModule } from '@angular/material/icon';
import { MeetAvatar } from './meet-avatar/avatar.component';
import { Subscription } from 'rxjs';
import { User } from '@/_models/User';
import { MatMenuModule } from '@angular/material/menu';
import { AuthService } from '@/_services/auth.service';
import { MatButtonModule } from '@angular/material/button';
import { formatTime, formatTwoDigits } from '@/_utils';

const MatImports = [MatIconModule, MatMenuModule, MatButtonModule];

@Component({
  selector: 'app-meet',
  standalone: true,
  imports: [...MatImports, EmptyBoxComponent, MeetAvatar],
  templateUrl: './meet.component.html',
  styleUrl: './meet.component.scss',
})
export class MeetComponent implements OnInit, OnDestroy {
  authSub!: Subscription;
  intervalId!: NodeJS.Timeout;

  currentUser!: User;
  session!: ISessionOutput;

  currentTime: string = '';

  isRecording: boolean = false;
  transcription: string = '';
  timeLeft: number = 30;

  constructor(private route: ActivatedRoute, private router: Router, private authSrv: AuthService) {}

  ngOnInit(): void {
    this.route.data.subscribe({
      next: (s) => {
        if (!s['session']) this.router.navigate(['/sessions']);
        else this.session = s['session'];
      },
    });

    this.authSub = this.authSrv.currentUser$.subscribe({
      next: (u) => {
        if (u) this.currentUser = u;
      },
    });

    this.updateTime();

    this.intervalId = setInterval(() => {
      this.updateTime();
    }, 1000);
  }

  loadDefaultImage(e: any) {
    e.target.src = 'https://png.pngtree.com/element_our/png/20181206/users-vector-icon-png_260862.jpg';
  }

  toggleMic(): void {
    this.isRecording = !this.isRecording;
  }

  private updateTime(): void {
    this.currentTime = formatTime(new Date());
  }

  ngOnDestroy(): void {
    this.authSub.unsubscribe();
    clearInterval(this.intervalId);
  }
}
