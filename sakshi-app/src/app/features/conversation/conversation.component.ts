import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, Validators } from '@angular/forms';

import { Chat } from '../../_models/Chat';
import { ChatService } from '../../_services/chat.service';
import { MessageBoxComponent } from '../../components/message-box/message-box.component';

import { FormGroup, FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-conversation',
  standalone: true,
  imports: [MessageBoxComponent, ReactiveFormsModule],
  templateUrl: './conversation.component.html',
  styleUrl: './conversation.component.scss',
})
export class ConversationComponent implements OnInit {
  recentChats: Chat[] = [];
  promptForm!: FormGroup;

  constructor(private chatSrv: ChatService, private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initForm();
  }

  initForm() {
    this.promptForm = this.fb.group({
      message: ['', [Validators.required, Validators.minLength(4)]],
    });
  }

  promptSubmit() {
    if (this.promptForm.valid) {
      const previous_prompt = this.chatSrv.latestChat().message;
      const current_prompt = this.promptForm.value.message;
      this.chatSrv.addChat({
        chatType: 'to',
        name: 'You',
        message: this.promptForm.value.message,
        time: new Date().toLocaleTimeString(),
      });
      this.promptForm.reset();
      this.chatSrv.addTherapistResponseToChat(current_prompt, previous_prompt);
    }
  }
}
