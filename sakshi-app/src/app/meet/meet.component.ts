import { Component } from '@angular/core';

import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-meet',
  standalone: true,
  imports: [MatButtonModule],
  templateUrl: './meet.component.html',
  styleUrl: './meet.component.scss',
})
export class MeetComponent {}
