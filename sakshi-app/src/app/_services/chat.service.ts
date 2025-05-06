import { ElementRef, Injectable } from '@angular/core';
import {Chat, ChatResponse, PromptResponse} from '../_models/Chat';
import {BehaviorSubject, Observable} from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { SessionService } from './session.service';
import { ConfigService } from './config.service';
import {AuthService} from "@/_services/auth.service";

const therapist_responses = [
  'Hi, how are you feeling today? What made you decide to come in, and what would you like us to explore during this session?',
  "Hello, how have you been today? Can you share what led you here and what you'd like to focus on during our conversation?",
  'Good day, how are you doing? What brings you in today, and what topics are you hoping to address in our session?',
  "Hi there, how's everything going? What motivated you to reach out today, and what are your main concerns for our time together?",
  "Hello, how are you today? Could you tell me what prompted you to seek help and which areas you'd like to focus on during our meeting?",
];

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  currentChatsSource = new BehaviorSubject<Chat[]>([]);
  currentChats$ = this.currentChatsSource.asObservable();
  private scrollRef!: ElementRef;
  private apiUrl = this.cfgSrv.get('API_BASE_URL');
  responses: ChatResponse[] = [
    {
      timestamp: '2025-03-15T08:00:32.827782',
      therapist_response:
        therapist_responses[
          Math.floor(Math.random() * therapist_responses.length)
          ],
    },
  ];


  constructor(
    private httpClient: HttpClient,
    private sessionService: SessionService,
    private authSrv: AuthService,
    private cfgSrv: ConfigService
  ) {}

  getChats() {
    const c: Chat[] = [];

    this.sessionService.firstPrompt$.subscribe((first_prompt) => {
      if (first_prompt != null && first_prompt != 'NA') {
        const c_from: Chat = {
          chatType: 'from',
          message: first_prompt.toString(),
          time: this.responses[0].timestamp,
          name: 'SAKSHI',
        };
        c.push(c_from);
      } else {
        for (const c_ of this.responses) {
          const c_from: Chat = {
            chatType: 'from',
            message: c_.therapist_response,
            time: c_.timestamp,
            name: 'SAKSHI',
          };
          c.push(c_from);
        }
      }
    });

    this.currentChatsSource.next(c);
  }

  latestChat() {
    return this.currentChatsSource.value[
      this.currentChatsSource.value.length - 1
    ];
  }
  addChat(chat: Chat) {
    this.currentChatsSource.next([...this.currentChatsSource.value, chat]);
    this.scrollToBottom();
  }

  addTherapistResponseToChat(user_message: string, previous_prompt: string) {
    this.getTherapistResponse(user_message, previous_prompt).subscribe({
      next: (response: PromptResponse) => {
        const chat: Chat = {
          chatType: 'from',
          message: response.follow_up_question,
          time: response.timestamp,
          name: 'THERAPIST',
        };
        this.addChat(chat);
      },
      error: (err) => {
        console.error('Error fetching therapist response:', err);
      },
    });

  }
  getTherapistResponse(user_message: string, previous_prompt: string): Observable<PromptResponse> {
    return this.httpClient.post<PromptResponse>(`${this.apiUrl}/prompt`, {
      // user_id: localStorage.getItem('user_id'),TODO: uncomment this line
      user_id: this.authSrv.getUser()?.uid,
      prompt: user_message,
      session_id: localStorage.getItem('session_id'),
      previous_prompt: previous_prompt,
    });
  }

  scrollToBottom(): void {
    try {
      setTimeout(() => {
        const atBottom =
          this.scrollRef.nativeElement.scrollHeight -
            this.scrollRef.nativeElement.scrollTop ===
          this.scrollRef.nativeElement.clientHeight;
        if (!atBottom) {
          this.scrollRef.nativeElement.scrollTop =
            this.scrollRef.nativeElement.scrollHeight;
        }
      }, 100); // Adjust the timeout duration as needed
    } catch (err) {}
  }

  setScrollRef(myScrollContainer: ElementRef) {
    this.scrollRef = myScrollContainer;
  }
}
