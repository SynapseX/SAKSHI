import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';

import { MeetAvatar } from '@/features/meet/meet-avatar/avatar.component';

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
  isRecording: boolean = false;
  transcription: string = '';
  timeLeft: number = 30;
  private recognitionInstance: any = null;
  private recordTimer: any = null;
  private autoRestart: boolean = true;

  constructor(private snackBar: MatSnackBar) {}

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.stopRecording();
  }

  toggleMic(): void {
    this.isRecording ? this.stopRecording() : this.startRecording();
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
  }
}
