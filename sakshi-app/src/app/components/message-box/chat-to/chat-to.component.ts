import { Component, Input } from '@angular/core';
import { Chat } from '../../../_models/Chat';

@Component({
  selector: 'app-chat-to',
  standalone: true,
  imports: [],
  templateUrl: './chat-to.component.html',
  styleUrl: './chat-to.component.scss',
})
export class ChatToComponent {
  @Input('chat') chat!: Chat;
  @Input('icon') icon: string = 'person';
}
