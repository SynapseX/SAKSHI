import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-profile-field',
  standalone: true,
  imports: [],
  templateUrl: './profile-field.component.html',
})
export class ProfileFieldComponent {
  @Input() field_title: string = '';
}
