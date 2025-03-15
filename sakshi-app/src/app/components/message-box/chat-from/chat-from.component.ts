import { Component, Input } from '@angular/core';
import { Chat } from '../../../_models/Chat';

@Component({
  selector: 'app-chat-from',
  standalone: true,
  imports: [],
  templateUrl: './chat-from.component.html',
  styleUrl: './chat-from.component.scss',
})
export class ChatFromComponent {
  @Input('chat') chat!: Chat;
  @Input('icon') icon: string = 'support_agent';
}
