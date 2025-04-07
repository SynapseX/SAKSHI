import { Component } from '@angular/core';

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
  imports: [...MatImports],
  templateUrl: './meet.component.html',
  styleUrl: './meet.component.scss',
})
export class MeetComponent {}
