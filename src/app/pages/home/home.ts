import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SkinCard } from '../../component/skin-card/skin-card';
import { Skin } from '../../models/skin.model';
import { InventoryService } from '../../services/inventory.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, SkinCard],
  styles: [`
    .loading-state, .error-state, .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      text-align: center;
    }
    
    .spinner {
      border: 4px solid rgba(0, 0, 0, 0.1);
      width: 36px;
      height: 36px;
      border-radius: 50%;
      border-left-color: #09f;
      animation: spin 1s linear infinite;
      margin-bottom: 1rem;
    }
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    .retry-button, .browse-button {
      margin-top: 1rem;
      padding: 0.5rem 1rem;
      background-color: #09f;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      transition: background-color 0.2s;
    }
    
    .retry-button:hover, .browse-button:hover {
      background-color: #0077cc;
    }
    
    .error-state {
      color: #ff4444;
    }
    
    .empty-state {
      color: #666;
    }
  `],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class HomeComponent implements OnInit {
  userInventory: Skin[] = [];
  filteredInventory: Skin[] = [];
  isLoading = true;
  error: string | null = null;
  searchQuery = '';

  constructor(
    private inventoryService: InventoryService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    console.log('[Home] Initializing home component');
    console.log('[Home] Is user logged in?', this.authService.isLoggedIn());
    
    // Check if we have a user in local storage
    const user = JSON.parse(localStorage.getItem('neoskins_user') || 'null');
    console.log('[Home] User from localStorage:', user);
    
    this.loadUserInventory();
  }

  loadUserInventory(): void {
    console.log('[Home] Loading user inventory...');
    this.isLoading = true;
    this.error = null;
    
    if (!this.authService.isLoggedIn()) {
      const errorMsg = 'Usuário não está logado. Redirecionando para login...';
      console.warn('[Home]', errorMsg);
      this.error = 'Você precisa estar logado para ver seu inventário';
      this.isLoading = false;
      // Optional: Redirect to login page
      // this.router.navigate(['/login']);
      return;
    }

    // Get user data from auth service or local storage
    const userData = JSON.parse(localStorage.getItem('neoskins_user') || 'null');
    console.log('[Home] User data from storage:', userData);

    if (!userData?.steamid) {
      const errorMsg = 'SteamID não encontrado na sessão';
      console.error('[Home]', errorMsg);
      this.error = 'Erro ao carregar inventário. Por favor, faça login novamente.';
      this.isLoading = false;
      return;
    }

    console.log(`[Home] Fetching inventory for SteamID: ${userData.steamid}`);
    
    this.inventoryService.getUserInventory(userData.steamid).subscribe({
      next: (inventory) => {
        console.log('[Home] Inventory loaded successfully:', inventory);
        this.userInventory = inventory;
        this.filteredInventory = [...inventory];
        this.isLoading = false;
      },
      error: (error) => {
        const errorMsg = 'Erro ao carregar o inventário';
        console.error('[Home]', errorMsg, error);
        this.error = 'Falha ao carregar o inventário. Tente novamente mais tarde.';
        this.isLoading = false;
      },
      complete: () => {
        console.log('[Home] Inventory fetch completed');
      }
    });
  }

  onSearch(event: Event): void {
    const query = (event.target as HTMLInputElement).value.toLowerCase();
    this.searchQuery = query;
    
    if (!query) {
      this.filteredInventory = [...this.userInventory];
      return;
    }

    this.filteredInventory = this.userInventory.filter(skin => 
      skin.name.toLowerCase().includes(query) ||
      (skin.description?.toLowerCase().includes(query) ?? false)
    );
  }

  onSkinSelect(skin: Skin): void {
    // Handle skin selection (e.g., show details, add to trade, etc.)
    console.log('Selected skin:', skin);
  }
}
