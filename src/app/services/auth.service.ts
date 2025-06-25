import { Injectable, signal, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, map, of, tap, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { SteamUser } from '../models/user.model';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = 'http://localhost:3001';
  private readonly USER_KEY = 'neoskins_user';
  
  // Using BehaviorSubject for reactive state management
  private currentUserSubject = new BehaviorSubject<SteamUser | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();
  
  // Signals for state management
  currentUser = signal<SteamUser | null>(null);
  isLoggedIn = signal(false);

  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  constructor() {
    // Check for existing session on service initialization
    const savedUser = localStorage.getItem(this.USER_KEY);
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        this.setUser(user);
      } catch (e) {
        this.clearUser();
      }
    }
  }
  
  // Expose current user value
  get currentUserValue(): SteamUser | null {
    return this.currentUserSubject.value;
  }

  /**
   * Initiate Steam login
   */
  loginWithSteam(): void {
    try {
      // Store the current URL to redirect back after login
      const currentPath = window.location.pathname;
      const currentSearch = window.location.search;
      const redirectUrl = currentPath === '/login' ? '/' : currentPath + currentSearch;
      
      localStorage.setItem('redirectUrl', redirectUrl);
      console.log('[Auth] Initiating Steam login, redirect URL:', redirectUrl);
      
      // Redirect to backend Steam auth endpoint
      window.location.href = `${this.API_URL}/auth/steam`;
    } catch (error) {
      console.error('[Auth] Error during login initiation:', error);
      this.showError('Failed to initiate login. Please try again.');
    }
  }

  /**
   * Check if user is authenticated
   */
  checkAuthStatus(): Observable<boolean> {
    return this.http.get<SteamUser>(`${this.API_URL}/api/user`).pipe(
      tap({
        next: (user) => {
          if (user) {
            console.log('[Auth] User authenticated:', user.username);
            this.setUser(user);
            this.redirectAfterLogin();
          } else {
            console.log('[Auth] No user session found');
            this.clearUser();
          }
        },
        error: (error) => {
          console.error('[Auth] Error checking auth status:', error);
          this.clearUser();
        }
      }),
      map(user => !!user),
      catchError((error: HttpErrorResponse) => {
        console.error('[Auth] Auth check failed:', error);
        if (error.status === 401) {
          // Session expired or invalid
          this.clearUser();
        }
        return of(false);
      })
    );
  }

  /**
   * Logout the current user
   */
  logout(): Observable<void> {
    return this.http.get(`${this.API_URL}/logout`, { responseType: 'text' }).pipe(
      tap(() => {
        console.log('[Auth] User logged out successfully');
        this.clearUser();
        this.router.navigate(['/']);
      }),
      map(() => {}), // Convert to void
      catchError((error: HttpErrorResponse) => {
        console.error('[Auth] Logout failed:', error);
        this.showError('Failed to log out. Please try again.');
        this.clearUser();
        this.router.navigate(['/']);
        return of(undefined);
      })
    );
  }

  /**
   * Get current user data
   */
  getCurrentUser(): SteamUser | null {
    return this.currentUserValue;
  }

  /**
   * Redirect user after successful login
   */
  private redirectAfterLogin(): void {
    try {
      const redirectUrl = localStorage.getItem('redirectUrl') || '/';
      localStorage.removeItem('redirectUrl');
      console.log('[Auth] Redirecting after login to:', redirectUrl);
      this.router.navigateByUrl(redirectUrl).catch(() => {
        // Fallback to home if navigation fails
        this.router.navigate(['/']);
      });
    } catch (error) {
      console.error('[Auth] Error during redirect:', error);
      this.router.navigate(['/']);
    }
  }

  /**
   * Show error message to user
   */
  private showError(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }

  /**
   * Set user data in service and local storage
   */
  private setUser(user: SteamUser): void {
    try {
      if (!user || !user.steamid) {
        throw new Error('Invalid user data');
      }

      // Ensure avatar URLs are complete
      const userWithAvatar: SteamUser = {
        ...user,
        avatar: {
          small: user.avatar?.small || `https://avatars.steamstatic.com/steamcommunity/public/images/avatars/fe/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb.jpg`,
          medium: user.avatar?.medium || `https://avatars.steamstatic.com/steamcommunity/public/images/avatars/fe/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_medium.jpg`,
          full: user.avatar?.full || `https://avatars.steamstatic.com/steamcommunity/public/images/avatars/fe/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_full.jpg`
        },
        profile: user.profile || `https://steamcommunity.com/profiles/${user.steamid}`,
        displayName: user.displayName || user.username || 'Steam User',
        // Ensure required fields
        username: user.username || `user_${user.steamid}`,
        steamid: user.steamid,
        _json: user._json || {}
      };

      console.log('[Auth] Setting user:', userWithAvatar.username);
      this.currentUser.set(userWithAvatar);
      this.currentUserSubject.next(userWithAvatar);
      this.isLoggedIn.set(true);
      localStorage.setItem(this.USER_KEY, JSON.stringify(userWithAvatar));
    } catch (error) {
      console.error('[Auth] Error setting user:', error);
      this.clearUser();
      throw error;
    }
  }

  /**
   * Clear user data
   * @public
   */
  clearUser(): void {
    console.log('[Auth] Clearing user data');
    this.currentUser.set(null);
    this.currentUserSubject.next(null);
    this.isLoggedIn.set(false);
    
    try {
      localStorage.removeItem(this.USER_KEY);
      // Clear any other auth-related data
      localStorage.removeItem('steam_auth_state');
    } catch (error) {
      console.error('[Auth] Error clearing user data from localStorage:', error);
    }
  }
}
