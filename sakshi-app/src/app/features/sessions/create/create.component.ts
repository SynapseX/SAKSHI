import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';

import { ToastrService } from 'ngx-toastr';
import { SessionService } from '@/_services/session.service';
import { ModalComponent } from '@/components/modal/modal.component';

@Component({
  selector: 'app-create',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatInputModule,
    MatSelectModule,
    MatTooltipModule,
    MatFormFieldModule,
    MatButtonModule,
    MatIconModule,
    RouterModule,
    ModalComponent,
  ],
  templateUrl: './create.component.html',
})
export class CreateComponent implements OnInit {
  sessionForm!: FormGroup;
  minutes = [1, 5, 15, 30, 60];
  modalState = false;

  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private tstSrv: ToastrService,
    private sessSrv: SessionService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initSessionForm();
  }

  initSessionForm() {
    this.sessionForm = this.fb.group({
      sessionName: [''],
      sessionTime: [new Date().toUTCString()],
      sessionDuration: [30, Validators.required],
      treatmentGoals: ['', Validators.required],
      clientExpectations: ['', Validators.required],
      terminationPlan: ['', Validators.required],
      reviewOfProgress: [''],
      thankYouNote: [''],
      sessionNotes: [''],
    });
  }

  submitSessionForm() {
    if (this.sessionForm.invalid) {
      this.openModal();
      return;
    }
    this.isLoading = true;

    this.sessSrv.createSession(this.sessionForm.value).subscribe({
      next: (res) => {
        this.tstSrv.success(res.message);
        localStorage.setItem('session_id', res.session.session_id);
        this.sessionForm.reset();
      },
      error: (err) => {
        console.log(err);
      },
      complete: () => {
        this.isLoading = false;
        this.router.navigate(['/chat']);
      },
    });
  }

  openModal() {
    this.modalState = true;
  }
  closeModal() {
    this.modalState = false;
  }
}
