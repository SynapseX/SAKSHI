import { Component } from '@angular/core';

import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatSnackBarModule } from '@angular/material/snack-bar';
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
  imports: [...MatImports, MeetAvatar],
  templateUrl: './meet.component.html',
  styleUrl: './meet.component.scss',
})
export class MeetComponent {}
