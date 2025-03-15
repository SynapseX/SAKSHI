import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-server-error',
  standalone: true,
  imports: [],
  templateUrl: './server-error.component.html',
  styleUrl: './server-error.component.scss',
})
export class ServerErrorComponent {
  error: any;
  isHidden = false;

  constructor(private router: Router) {
    const navigation = router.getCurrentNavigation();
    this.error = navigation?.extras.state?.['error'];
    console.log(this.error);
  }

  toggleSeeMore() {
    this.isHidden = !this.isHidden;
  }
}
