import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';

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
  imports: [...MatImports, CommonModule],
  templateUrl: './meet.component.html',
  styleUrl: './meet.component.scss',
})
export class MeetComponent {
  isRecording = false;
  recorder: MediaRecorder | null = null;
  recordedChunks: Blob[] = [];
  timeLeft = 30;
  totalTime = 30;
  circumference = 2 * Math.PI * 45;
  dashOffset = 0;
  recordInterval: any;
  audioUrl: string | null = null; // URL to play audio
  blob: Blob | null = null;       // Save blob for later upload

  toggleMic() {
    if (!this.isRecording) {
      navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
        // Record in 'audio/webm' format, which is supported by most browsers
        this.recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
        this.recordedChunks = [];

        this.recorder.ondataavailable = (e) => {
          if (e.data.size > 0) this.recordedChunks.push(e.data);
        };

        this.recorder.onstop = () => {
          const blob = new Blob(this.recordedChunks, { type: 'audio/webm' });
          this.uploadAudio(blob);
          stream.getTracks().forEach(track => track.stop()); // stop mic
        };

        this.recorder.start();
        this.isRecording = true;
        this.timeLeft = this.totalTime;
        this.startCountdown();
      });
    } else {
      this.stopMic();
    }
  }

  startCountdown() {
    this.recordInterval = setInterval(() => {
      this.timeLeft--;
      const percent = this.timeLeft / this.totalTime;
      this.dashOffset = this.circumference * (1 - percent);

      if (this.timeLeft <= 0) {
        this.stopMic();
      }
    }, 1000);
  }

  stopMic() {
    if (this.recorder && this.recorder.state !== 'inactive') {
      this.recorder.stop();
    }
    clearInterval(this.recordInterval);
    this.isRecording = false;
    this.dashOffset = 0;
  }

  uploadAudio(blob: Blob) {
    this.stopRecording();
    const formData = new FormData();
    formData.append('audio', blob, 'recording.webm');  // Upload as webm

    fetch('http://localhost:3000/speech-to-text', {
      method: 'POST',
      body: formData
    }).then(response => response.json())
      .then(data => {
        console.log('Uploaded successfully:', data);
      }).catch(err => {
      console.error('Upload error:', err);
    });
  }

  stopRecording() {
    // Store the blob and create a URL for audio playback
    this.blob = new Blob(this.recordedChunks, { type: 'audio/webm' });
    this.audioUrl = URL.createObjectURL(this.blob);
  }
}
