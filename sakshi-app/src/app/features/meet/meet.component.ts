import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import {ChatService} from "@/_services/chat.service";
import {Chat, PromptResponse} from "@/_models/Chat";
import {TextToSpeechService} from "@/speech-module/text-to-speech.service";
import {SessionService} from "@/_services/session.service";

import { MeetAvatar } from '@/features/meet/meet-avatar/avatar.component';
import { AuthService } from '@/_services/auth.service';
import { Subscription } from 'rxjs';
import { User } from '@/_models/User';

const MatImports = [
  MatButtonModule,
  MatMenuModule,
  MatSnackBarModule,
  MatBadgeModule,
  MatIconModule,
  MatGridListModule,
  MatTooltipModule,
];

@Component({
  selector: 'app-meet',
  standalone: true,
  imports: [...MatImports, CommonModule, MeetAvatar],
  templateUrl: './meet.component.html',
  styleUrl: './meet.component.scss',
})
export class MeetComponent implements OnInit, OnDestroy {
  authSub!: Subscription;
  currentUser!: User;
  isRecording: boolean = false;
  transcription: string = '';
  timeLeft: number = 30;
  protected initializeAssistantModal = true;
  private recognitionInstance: any = null;
  private recordTimer: any = null;
  private autoRestart: boolean = true;
  private previous_prompt: string = '';
  private audioUnlocked = false;

  constructor(private authSrv: AuthService, private snackBar: MatSnackBar,private chatSrv: ChatService, private tts: TextToSpeechService, private sessionService: SessionService) {}

  ngOnInit(): void {
    this.initializeAssistantModal = true;
    this.authSub = this.authSrv.currentUser$.subscribe({
      next: (u) => {
        if (u) this.currentUser = u;
      },
    });
  }

  ngOnDestroy(): void {
    this.stopRecording();
    this.authSub.unsubscribe();
  }

  getFirstPromptSpoken(): void {
    this.sessionService.firstPrompt$.subscribe((first_prompt) => {
      if (first_prompt != null && first_prompt != 'NA' && first_prompt != '') {
        this.synthesizeTTS(first_prompt.toString());
      } else {
        const responses = this.chatSrv.responses;
        const response = responses[responses.length - 1];

        this.synthesizeTTS(response.therapist_response);

      }
    });
  }

  toggleMic(): void {
    this.isRecording ? this.stopRecording() : this.onMicClick();
  }

  initializeAssistant(): void {
    this.initializeAssistantModal = false;
    setTimeout(() => {}, 2000);
    this.audioUnlocked = true;
    this.unlockAudioPlayback();
    this.getFirstPromptSpoken();
  }


  startRecording(): void {
    const SpeechRecognition =
      (window as any).webkitSpeechRecognition ||
      (window as any).SpeechRecognition;

    if (!SpeechRecognition) {
      this.snackBar.open('❌ SpeechRecognition not supported', 'Close', {
        duration: 3000,
      });
      return;
    }

    const recognition = new SpeechRecognition();
    this.recognitionInstance = recognition;

    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.continuous = true;

    this.isRecording = true;
    this.transcription = '';
    this.timeLeft = 30;

    this.snackBar.open('🎙️ Recording started', 'Close', { duration: 2500 });

    // Timer countdown
    this.recordTimer = setInterval(() => {
      this.timeLeft--;
      if (this.timeLeft <= 0) {
        this.stopRecording();
      }
    }, 1000);

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript + ' ';
        }
      }
      this.transcription += finalTranscript.trim() + ' ';
      console.log('Transcript:', this.transcription);
    };

    recognition.onerror = (event: any) => {
      console.error('Recognition error:', event.error);
      this.snackBar.open(`⚠️ Error: ${event.error}`, 'Dismiss', {
        duration: 4000,
      });
      this.stopRecording(false); // avoid restart
    };

    recognition.onend = () => {
      console.log('Speech recognition ended.');
      if (this.isRecording && this.autoRestart) {
        recognition.start(); // auto-restart
      }
    };

    recognition.start();
  }

  stopRecording(manual: boolean = true): void {
    if (this.recognitionInstance) {
      this.recognitionInstance.stop();
      this.recognitionInstance = null;
    }

    if (this.recordTimer) {
      clearInterval(this.recordTimer);
      this.recordTimer = null;
    }

    if (this.isRecording) {
      this.snackBar.open('🛑 Recording stopped', 'Close', { duration: 2500 });
    }

    this.isRecording = false;
    this.timeLeft = 30;

    this.chatSrv.getTherapistResponse(this.transcription, this.previous_prompt).subscribe({
      next: (response: PromptResponse) => {
        this.synthesizeTTS(response.follow_up_question);
      },
      error: (err) => {
        console.error('Error fetching therapist response:', err);
      },
      complete: () => {
        this.previous_prompt = this.transcription;
        this.transcription = '';
      }
    });
  }

  private synthesizeTTS(request_text: string) {
    this.tts.synthesizeSpeech(request_text).subscribe({
      next: (audioBlob: Blob) => {
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        audio.play()
          .then(() => console.log("Audio is playing"))
          .catch(e => console.error('Error playing audio:', e));
      },
      error: (err) => {
        console.error('Error synthesizing speech:', err);
      },
      complete: () => {
        console.log('Audio playback completed');
        // TODO: Add transcription logic here
      }
    });
  }

  onMicClick(): void {
    if (!this.audioUnlocked) {
      this.unlockAudioPlayback();
      this.audioUnlocked = true;
    }

    this.startRecording(); // your existing mic logic
  }

  private unlockAudioPlayback(): void {
    const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
    const context = new AudioContextClass();

    if (context.state === 'suspended') {
      context.resume().then(() => {
        console.log("Audio context unlocked");
      });
    }

    // Play a 0-length silent sound to trigger browser unlock
    const source = context.createBufferSource();
    source.buffer = context.createBuffer(1, 1, 22050); // 1-frame silent buffer
    source.connect(context.destination);
    source.start(0);
  }



}
