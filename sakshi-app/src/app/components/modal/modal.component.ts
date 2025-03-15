import { CommonModule } from '@angular/common';
import { Component, Input, Output } from '@angular/core';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.scss',
})
export class ModalComponent {
  @Input() isOpen = false;
  @Input() actionText: string = 'Okay';
  @Input() cancelText: string = 'Cancel';

  @Output() onCancel = new Subject<boolean>();
  @Output() onAction = new Subject<boolean>();
}
