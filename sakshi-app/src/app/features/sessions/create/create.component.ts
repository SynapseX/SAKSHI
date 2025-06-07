import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatStepperModule } from '@angular/material/stepper';

import { ToastrService } from 'ngx-toastr';
import { SessionService } from '@/_services/session.service';
import { ModalComponent } from '@/components/modal/modal.component';
import { minutes } from '@/_utils';
import { AuthService } from '@/_services/auth.service';

const MatImports = [
  MatInputModule,
  MatSelectModule,
  MatTooltipModule,
  MatFormFieldModule,
  MatButtonModule,
  MatIconModule,
  MatStepperModule,
];

@Component({
  selector: 'app-create',
  standalone: true,
  imports: [...MatImports, ReactiveFormsModule, RouterModule, ModalComponent],
  templateUrl: './create.component.html',
})
export class CreateComponent implements OnInit {
  step1Form!: FormGroup;
  step2Form!: FormGroup;
  minutes = minutes;
  modalState = false;

  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private tstSrv: ToastrService,
    private sessSrv: SessionService,
    private router: Router,
    private authSrv: AuthService,
  ) {}

  ngOnInit(): void {
    [this.step1Form, this.step2Form] = this.initSessionForm();
  }

  initSessionForm() {
    const step_1_form = this.fb.group({
      name: [this.authSrv.getUser()?.displayName || '', Validators.required],
      sessionTime: [new Date().toUTCString()],
      sessionDuration: [30, Validators.required],
      treatmentGoals: ['', Validators.required],
      clientExpectations: ['', Validators.required],
    });
    const step_2_form = this.fb.group({
      terminationPlan: ['', Validators.required],
      reviewOfProgress: [''],
      thankYouNote: [''],
      sessionNotes: [''],
    });

    return [step_1_form, step_2_form];
  }

  submitSessionForm() {
    if (this.step1Form.invalid || this.step2Form.invalid) {
      this.openModal();
      return;
    }
    this.isLoading = true;

    const sessionFormData = {
      ...this.step1Form.value,
      ...this.step2Form.value,
    };

    this.sessSrv.createSession(sessionFormData).subscribe({
      next: (res) => {
        this.tstSrv.success('New Session Created');
        localStorage.setItem('session_id', res.session.session_id);
        this.resetSessionForm();
        this.isLoading = false;
        // TODO: recheck this again for proper meet redirect
        this.router.navigate(['/meet']);
      },
      error: (err) => {
        this.isLoading = false;
        console.log(err);
      },
    });
  }

  resetSessionForm(section: '1' | '2' | '' = '') {
    const val = this.initSessionForm();
    if (section === '1') this.step1Form.reset(val[0].value);
    else if (section === '2') this.step2Form.reset(val[1].value);
    else {
      this.step1Form.reset(val[0].value);
      this.step2Form.reset(val[1].value);
    }
  }

  openModal() {
    this.modalState = true;
  }
  closeModal() {
    this.modalState = false;
  }
}
