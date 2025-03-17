import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-empty-box',
  standalone: true,
  imports: [],
  templateUrl: './empty-box.component.html',
})
export class EmptyBoxComponent {
  @Input() icon: string = 'info';
  @Input() msg: string = '';
}
