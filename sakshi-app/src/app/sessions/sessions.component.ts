import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { SessionService } from '../_services/session.service';
import { CommonModule } from '@angular/common';
import { SessComponent } from './sess/sess.component';
import { Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { EmptyBoxComponent } from '../components/empty-box/empty-box.component';
import {Router} from "@angular/router";
import {ConversationComponent} from "../conversation/conversation.component";

@Component({
  selector: 'app-sessions',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SessComponent,
    EmptyBoxComponent,
  ],
  templateUrl: './sessions.component.html',
  styleUrl: './sessions.component.scss',
})
export class SessionsComponent implements OnInit, OnDestroy {
  sub!: Subscription;

  sessionForm!: FormGroup;
  minutes = [15, 30, 60];

  activeSessions: Object[] = [];

  constructor(
    private fb: FormBuilder,
    private sessSrv: SessionService,
    private tstSrv: ToastrService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initSessionForm();

    this.sessSrv.listActiveSessions('assssasasasasasa').subscribe({
      next: (sessions: any) => {
        this.sessSrv.activeSessionsSource.next(sessions.active_sessions);
      },
    });

    this.sub = this.sessSrv.activeSessions$.subscribe({
      next: (sessions) => {
        this.activeSessions = sessions;
      },
    });
  }

  initSessionForm() {
    this.sessionForm = this.fb.group({
      sessionName: [''],
      sessionTime: [new Date().toUTCString()],
      sessionDuration: [30, Validators.required],
      treatmentGoals: ['', Validators.required],
      clientExpectations: ['', Validators.required],
      sessionNotes: [''],
      terminationPlan: ['', Validators.required],
      reviewOfProgress: [''],
      thankYouNote: [''],
    });
  }

  submitSessionForm() {
    this.sessSrv.createSession(this.sessionForm.value).subscribe({
      next: (res) => {
        this.tstSrv.success(res.message);
        localStorage.setItem('session_id', res.session.session_id);
        let base_location = window.location.origin;
        this.router.navigate(['/chat']);
        },
    });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
