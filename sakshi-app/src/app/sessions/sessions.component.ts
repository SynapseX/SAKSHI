import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { SessionService } from '../_services/session.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sessions',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './sessions.component.html',
  styleUrl: './sessions.component.scss',
})
export class SessionsComponent implements OnInit {
  sessionForm!: FormGroup;
  minutes = [15, 30, 60];

  activeSessions: Object[] = [];

  constructor(private fb: FormBuilder, private sessSrv: SessionService) {}

  ngOnInit(): void {
    this.initSessionForm();

    this.sessSrv.listActiveSessions('assssasasasasasa').subscribe({
      next: (res) => {
        this.activeSessions.push(res);
      },
    });
  }

  initSessionForm() {
    this.sessionForm = this.fb.group({
      sessionName: [''],
      sessionTime: [new Date().toUTCString()],
      sessionDuration: ['', Validators.required],
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
        console.log(res);
      },
    });
  }
}
