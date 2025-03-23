import { Component, OnInit } from '@angular/core';
import {Router, RouterModule} from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';

import { SessionService } from '../../_services/session.service';
import { ToastrService } from 'ngx-toastr';
import { ModalComponent } from '../../components/modal/modal.component';

@Component({
  selector: 'app-create',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatInputModule,
    MatSelectModule,
    MatFormFieldModule,
    MatButtonModule,
    RouterModule,
    ModalComponent,
  ],
  templateUrl: './create.component.html',
  styleUrl: './create.component.scss',
})
export class CreateComponent implements OnInit {
  sessionForm!: FormGroup;
  minutes = [15, 30, 60];

  modalState = false;

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
      sessionNotes: [''],
      terminationPlan: ['', Validators.required],
      reviewOfProgress: [''],
      thankYouNote: [''],
    });
  }

  submitSessionForm() {
    if (this.sessionForm.invalid) {
      this.openModal();
      return;
    }

    this.sessSrv.createSession(this.sessionForm.value).subscribe({
      next: (res) => {
        this.tstSrv.success(res.message);
        localStorage.setItem('session_id', res.session.session_id);
        let base_location = window.location.origin;
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
