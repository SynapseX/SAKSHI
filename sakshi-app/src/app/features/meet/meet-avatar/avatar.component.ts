import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  standalone: true,
  selector: 'app-meet-avatar',
  imports: [CommonModule],
  templateUrl: './avatar.component.html',
  styleUrls: ['./avatar.component.scss'],
})
export class MeetAvatar {
  @Input() imageUrl: string =
    'https://img.freepik.com/premium-photo/speech-therapist-digital-avatar-generative-ai_934475-9023.jpg';

  @Input() isTalking: boolean = false;
  @Input() size: number = 22;

  get sizeStyle() {
    return {
      width: this.size * 4 + `px`,
      height: this.size * 4 + `px`,
    };
  }
}
