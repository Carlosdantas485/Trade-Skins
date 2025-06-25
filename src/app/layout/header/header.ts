import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../services/theme.service';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms'; // Para ngModel


@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, MatToolbarModule, MatButtonModule, MatIconModule, FormsModule],
  templateUrl: './header.html',
  styleUrls: ['./header.scss']
})
export class HeaderComponent {
  searchQuery: string = '';

  constructor(private themeService: ThemeService, private router: Router) {}

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  isDarkTheme(): boolean {
    return this.themeService.getCurrentTheme() === 'dark';
  }

  get isDarkMode(): boolean {
    return this.themeService.getCurrentTheme() === 'dark';
  }

  search(): void {
    const query = this.searchQuery.trim();
    if (query) {
      this.router.navigate(['/marketplace'], { queryParams: { search: query } });
    } else {
      // Se a busca estiver vazia, navega para o marketplace para mostrar todos os itens.
      this.router.navigate(['/marketplace']);
    }
  }
}
