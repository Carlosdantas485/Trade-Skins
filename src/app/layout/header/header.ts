import { Component, OnDestroy, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';

import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';
import { SteamUser } from '../../models/user.model';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatSnackBarModule,
    RouterModule,
    FormsModule
  ],
  templateUrl: './header.html',
  styleUrls: ['./header.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
  searchQuery = '';
  private readonly destroy$ = new Subject<void>();
  private readonly loading = signal<boolean>(false);
  private readonly errorMessage = signal<string | null>(null);
  isDarkMode = false;
  
  // Inject services
  private readonly authService = inject(AuthService);
  private readonly themeService = inject(ThemeService);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);
  
  // Expose auth state
  currentUser = this.authService.currentUser;
  isLoggedIn = this.authService.isLoggedIn;
  isLoading = this.loading;

  // Computed properties for template
  get userAvatar(): string {
    return this.currentUser()?.avatar?.medium || 'assets/images/default-avatar.png';
  }

  get displayName(): string {
    return this.currentUser()?.displayName || 'Guest';
  }

  // Expose user data for template
  get user(): SteamUser | null {
    return this.currentUser();
  }

  constructor() {}

  ngOnInit(): void {
      // Subscribe to theme changes
    // TODO: Uncomment and implement when ThemeService is updated
    // this.themeService.isDarkMode$.subscribe((isDark: boolean) => {
    //   this.isDarkMode = isDark;
    // });

    // Check auth status on init
    this.checkAuthStatus();
    
    // Subscribe to auth state changes
    this.authService.currentUser$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(user => {
      if (user) {
        this.errorMessage.set(null);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Check authentication status
   */
  checkAuthStatus(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.authService.checkAuthStatus().pipe(
      takeUntil(this.destroy$),
      finalize(() => this.loading.set(false))
    ).subscribe({
      next: (isAuthenticated: boolean) => {
        if (!isAuthenticated) {
          // Clear user data via logout since clearUser is private
          this.logout();
        }
      },
      error: (error: any) => {
        console.error('Auth status check failed:', error);
        this.errorMessage.set('Failed to check authentication status');
        this.logout();
      }
    });
  }

  /**
   * Handle login with Steam
   */
  login(): void {
    if (this.loading()) {
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);
    
    try {
      this.authService.loginWithSteam();
    } catch (error) {
      console.error('Login error:', error);
      this.loading.set(false);
      this.errorMessage.set('Failed to initiate login');
      this.snackBar.open('Failed to initiate login. Please try again.', 'Close', {
        duration: 5000
      });
    }
  }

  /**
   * Handle user logout
   */
  logout(): void {
    if (this.loading()) {
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);
    
    this.authService.logout()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.loading.set(false);
          // Ensure we're on the home page after logout
          if (this.router.url !== '/') {
            this.router.navigate(['/']);
          }
        })
      )
      .subscribe({
        next: () => {
          this.snackBar.open('Successfully logged out', 'Close', {
            duration: 3000,
            horizontalPosition: 'right',
            verticalPosition: 'top',
            panelClass: ['success-snackbar']
          });
        },
        error: (error: any) => {
          console.error('Logout error:', error);
          this.errorMessage.set('Failed to log out');
          this.snackBar.open('Failed to log out. Please try again.', 'Close', {
            duration: 5000,
            horizontalPosition: 'right',
            verticalPosition: 'top',
            panelClass: ['error-snackbar']
          });
        }
      });
  }

  /**
   * Navigate to user's Steam profile
   */
  navigateToProfile(): void {
    const user = this.currentUser();
    if (user?.profile) {
      window.open(user.profile, '_blank', 'noopener,noreferrer');
    }
  }

  /**
   * Toggle theme between light and dark
   */
  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  /**
   * Handle search form submission
   */
  onSearch(): void {
    const query = this.searchQuery.trim();
    if (!query) {
      return;
    }
    this.router.navigate(['/search'], { 
      queryParams: { q: query },
      queryParamsHandling: 'merge'
    });
    this.searchQuery = '';
  }

  // Alias for template compatibility
  search(): void {
    this.onSearch();
  }

}

// Add missing of operator for error handling
import { of } from 'rxjs';
