import { Component, OnInit, Inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-callback',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule],
  template: `
    <div class="callback-container">
      <mat-spinner [diameter]="40"></mat-spinner>
      <p>Processing authentication...</p>
    </div>
  `,
  styles: [`
    .callback-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100vh;
      text-align: center;
    }
  `]
})
export class CallbackComponent implements OnInit {
  constructor(
    @Inject(ActivatedRoute) private route: ActivatedRoute,
    @Inject(Router) private router: Router,
    @Inject(AuthService) private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['success'] === 'true') {
        // Authentication was successful, check auth status
        this.authService.checkAuthStatus().subscribe((isAuthenticated: boolean) => {
          if (isAuthenticated) {
            // Redirect to the dashboard or home page
            this.router.navigate(['/']);
          } else {
            // If not authenticated, redirect to login with error
            this.router.navigate(['/login'], { queryParams: { error: 'authentication_failed' } });
          }
        });
      } else {
        // Authentication failed, redirect to login with error
        this.router.navigate(['/login'], { queryParams: { error: 'authentication_failed' } });
      }
    });
  }
}
