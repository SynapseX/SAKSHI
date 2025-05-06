import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'audio-frequency-visualizer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './audio-frequency-visualizer.component.html',
  styleUrl: './audio-frequency-visualizer.component.scss',
})
export class AudioFrequencyVisualizerComponent implements OnInit, OnDestroy {
  @ViewChild('audioCanvas', { static: true })
  audioCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('startButton', { static: true })
  startButton!: ElementRef<HTMLButtonElement>;

  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private bufferLength = 0;
  private dataArray: Uint8Array | null = null;
  private audioSource: MediaStreamAudioSourceNode | null = null;
  private isPlaying = false;
  private animationFrameId: number | null = null;

  private canvasContext: CanvasRenderingContext2D | null = null;

  constructor() {}

  ngOnInit(): void {
    this.audioContext = new (window.AudioContext || window.AudioContext)();
    this.canvasContext = this.audioCanvas.nativeElement.getContext('2d');
    this.resizeCanvas(); // Initial canvas setup

    window.addEventListener('resize', () => {
      this.resizeCanvas();
      this.draw(); // Redraw after resize
    });
  }

  ngOnDestroy(): void {
    this.stopVisualization();
    window.removeEventListener('resize', this.resizeCanvas);
  }

  private initAnalyser(): void {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || window.AudioContext)();
    }
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 2048;
    this.bufferLength = this.analyser.frequencyBinCount;
    this.dataArray = new Uint8Array(this.bufferLength);
  }

  private resizeCanvas(): void {
    this.audioCanvas.nativeElement.width =
      this.audioCanvas.nativeElement.parentElement!.clientWidth;
    this.audioCanvas.nativeElement.height = 300;
  }

  private draw(): void {
    if (
      !this.isPlaying ||
      !this.analyser ||
      !this.canvasContext ||
      !this.dataArray
    )
      return;
    this.animationFrameId = requestAnimationFrame(() => this.draw());

    this.analyser.getByteFrequencyData(this.dataArray);
    this.canvasContext.clearRect(
      0,
      0,
      this.audioCanvas.nativeElement.width,
      this.audioCanvas.nativeElement.height
    );
    // Use a gradient for a more modern look
    const gradient = this.canvasContext.createLinearGradient(
      0,
      this.audioCanvas.nativeElement.height,
      0,
      0
    );
    gradient.addColorStop(0, 'rgba(79, 70, 229, 0.8)'); // Tailwind's indigo-500 with opacity
    gradient.addColorStop(0.5, 'rgba(129, 140, 248, 0.8)'); // Tailwind's indigo-300 with opacity
    gradient.addColorStop(1, 'rgba(192, 202, 255, 0.8)'); // Tailwind's indigo-100 with opacity
    this.canvasContext.fillStyle = gradient;

    const barWidth =
      (this.audioCanvas.nativeElement.width / this.bufferLength) * 2.5;
    let x = 0;

    for (let i = 0; i < this.bufferLength; i++) {
      // Increased scaling and added a minimum height
      const barHeight = Math.max(this.dataArray[i] / 1.2, 5); //Adjust to increase bar height and add min height
      this.canvasContext.fillRect(
        x,
        this.audioCanvas.nativeElement.height - barHeight / 2,
        barWidth,
        barHeight
      );
      x += barWidth + 1;
    }
  }

  toggleVisualization(): void {
    if (!this.isPlaying) {
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((stream) => {
          this.initAnalyser();
          this.audioSource = this.audioContext!.createMediaStreamSource(stream);
          this.audioSource.connect(this.analyser!);
          this.analyser!.connect(this.audioContext!.destination);
          this.isPlaying = true;
          this.startButton.nativeElement.textContent = 'Stop Visualizer';
          this.startButton.nativeElement.classList.remove(
            'bg-indigo-500',
            'hover:bg-indigo-600'
          );
          this.startButton.nativeElement.classList.add(
            'bg-red-500',
            'hover:bg-red-600'
          );
          this.draw();
        })
        .catch((err) => {
          console.error('Error getting microphone access:', err);
          alert(
            'Please allow microphone access to use the visualizer. Error: ' +
              err.message
          );
        });
    } else {
      this.stopVisualization();
    }
  }

  private stopVisualization(): void {
    if (this.audioSource && this.audioSource.mediaStream) {
      this.audioSource.mediaStream.getTracks().forEach((track) => {
        track.stop();
      });
    }
    this.isPlaying = false;
    this.startButton.nativeElement.textContent = 'Start Visualizer';
    this.startButton.nativeElement.classList.remove(
      'bg-red-500',
      'hover:bg-red-600'
    );
    this.startButton.nativeElement.classList.add(
      'bg-indigo-500',
      'hover:bg-indigo-600'
    );
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    if (this.canvasContext) {
      this.canvasContext.clearRect(
        0,
        0,
        this.audioCanvas.nativeElement.width,
        this.audioCanvas.nativeElement.height
      );
    }
    if (this.analyser) {
      this.analyser.disconnect();
    }
  }
}
