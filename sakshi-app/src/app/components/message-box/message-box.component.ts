import {
  AfterViewChecked,
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Chat } from '../../_models/Chat';
import { ChatToComponent } from './chat-to/chat-to.component';
import { ChatFromComponent } from './chat-from/chat-from.component';
import { ChatService } from '../../_services/chat.service';

@Component({
  selector: 'app-message-box',
  standalone: true,
  imports: [ChatToComponent, ChatFromComponent],
  templateUrl: './message-box.component.html',
  styleUrl: './message-box.component.scss',
})
export class MessageBoxComponent implements OnInit, AfterViewInit {
  @ViewChild('scrollRef') private myScrollContainer!: ElementRef;

  recentChats: Chat[] = [];

  constructor(private chatSrv: ChatService) {}

  ngOnInit(): void {
    // this.scrollToBottom();
    this.chatSrv.getChats();
    this.chatSrv.currentChats$.subscribe({
      next: (chats) => {
        this.recentChats = chats;
      },
      complete: () => {
        this.scrollToBottom();
      },
    });
  }

  ngAfterViewInit() {
    this.scrollToBottom();
  }

  scrollToBottom(): void {
    try {
      this.myScrollContainer.nativeElement.scrollTop =
        this.myScrollContainer.nativeElement.scrollHeight;
    } catch (err) {}
  }
}
