import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface Session {
  title: string;
  subtitle: string;
  scheduled_start_datetime: Date;
  session_duration: number;
  status: 'completed' | 'paused' | 'active';
}

@Component({
  selector: 'app-sessions',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sessions.component.html',
  styleUrl: './sessions.component.scss',
})
export class SessionsComponent implements OnInit {
  session1: Session = {
    title: 'Project Brainstorm',
    subtitle: 'Discussing the next phase of the project',
    scheduled_start_datetime: new Date('2025-05-26T10:00:00'),
    session_duration: 90,
    status: 'active',
  };

  session2: Session = {
    title: 'Client Meeting',
    subtitle: 'Presentation of the final proposal',
    scheduled_start_datetime: new Date('2025-05-27T14:30:00'),
    session_duration: 60,
    status: 'completed',
  };

  session3: Session = {
    title: 'Code Review',
    subtitle: 'Reviewing the latest feature implementation',
    scheduled_start_datetime: new Date('2025-05-28T09:00:00'),
    session_duration: 120,
    status: 'paused',
  };

  constructor() {}

  ngOnInit(): void {}
}
