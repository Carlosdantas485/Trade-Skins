import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of, tap, map } from 'rxjs';
import { Skin } from '../models/skin.model';

// Interface for the raw Steam inventory item
interface SteamInventoryItem {
  id: string;
  classid: string;
  instanceid: string;
  amount: string;
  pos: number;
  name: string;
  market_name: string;
  market_hash_name: string;
  name_color: string;
  background_color: string;
  type: string;
  tradable: number;
  marketable: number;
  commodity: number;
  market_tradable_restriction: number;
  market_marketable_restriction: number;
  descriptions: Array<{ value: string; color?: string }>;
  actions: Array<{ link: string; name: string }>;
  market_actions: Array<{ link: string; name: string }>;
  tags: Array<{
    category: string;
    internal_name: string;
    localized_category_name: string;
    localized_tag_name: string;
    color?: string;
  }>;
  app_data?: {
    def_index: string;
    quality: string;
    slot: string;
    item_class: string;
    item_type_name: string;
    item_name: string;
    item_quality: string;
    item_rarity: string;
    item_weapon: string;
    item_weapon_type: string;
    item_weapon_damage_type: string;
    item_weapon_armor_ratio: string;
    item_weapon_range_modifier: string;
    item_weapon_cycle_time: string;
    item_weapon_penetration: string;
    item_weapon_damage: string;
    item_weapon_spread: string;
    item_weapon_recoil: string;
    item_weapon_clip_size: string;
    item_weapon_movement_speed: string;
    item_weapon_team: string;
    item_weapon_team_id: string;
    item_weapon_team_name: string;
    [key: string]: string | undefined; // For dynamic team properties
  };
  fraudwarnings?: string[];
  icon_url: string;
  icon_url_large: string;
  icon_drag_url: string;
  market_fee_app: number;
  market_fee: string;
  market_buy_country_restriction: string;
  market_sell_restriction: number;
  market_fee_text: string;
  market_url: string;
  owner_descriptions: string;
  owner_actions: Array<{ link: string; name: string }>;
  appid: number;
  currency: number;
  is_currency: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  private readonly http = inject(HttpClient);
  private readonly API_URL = 'http://localhost:3001';
  private userInventory: Skin[] = [];

  /**
   * Maps a Steam inventory item to our Skin model
   */
  private mapSteamItemToSkin(item: SteamInventoryItem): Skin {
    // Extract wear (float) from descriptions if available
    let floatValue: string | undefined;
    const wearDescription = item.descriptions?.find(desc => 
      desc.value && (desc.value.includes('Exterior:') || desc.value.includes('Float:'))
    );
    
    if (wearDescription) {
      const floatMatch = wearDescription.value.match(/\d+\.\d+/);
      if (floatMatch) {
        floatValue = floatMatch[0];
      }
    }

    // Extract condition from tags
    const conditionTag = item.tags?.find(tag => 
      tag.category === 'Exterior' || tag.localized_category_name === 'Exterior'
    );
    
    // Determine if the item is StatTrak™
    const isStatTrak = item.market_name?.includes('StatTrak™') || 
                      item.name?.includes('StatTrak™') ||
                      !!item.tags?.some(tag => tag.localized_tag_name === 'StatTrak™');

    // Get the image URL - use the large version if available
    const imageUrl = item.icon_url_large || item.icon_url || '';
    
    // Create the skin object
    const skin: Skin = {
      id: item.id || `${item.classid}_${item.instanceid || '0'}`,
      name: item.market_name || item.name || 'Unknown Item',
      description: item.descriptions?.[0]?.value || '',
      price: null, // Will be set by the market data
      imagem: this.fixSteamImageUrl(imageUrl),
      rarity: this.getRarityFromItem(item),
      disponivel: true,
      estoque: 1,
      a_venda: false,
      criado_em: new Date().toISOString(),
      plataforma: 'Steam',
      condicao: conditionTag?.localized_tag_name || 'Field-Tested',
      stattrak: isStatTrak,
      float: floatValue
    };

    return skin;
  }

  /**
   * Fixes Steam image URLs by ensuring they use the correct domain
   */
  private fixSteamImageUrl(url: string): string {
    if (!url) return '';
    // If the URL is already a full URL, return it as is
    if (url.startsWith('http')) return url;
    // Otherwise, construct the full URL
    return `https://steamcommunity-a.akamaihd.net/economy/image/${url}`;
  }

  /**
   * Determines the rarity of an item based on its tags
   */
  private getRarityFromItem(item: SteamInventoryItem): string {
    const rarityTag = item.tags?.find(tag => 
      ['Rarity', 'Grade', 'Weapon'].includes(tag.category) ||
      ['Consumer Grade', 'Industrial Grade', 'Mil-Spec', 'Restricted', 
       'Classified', 'Covert', 'Contraband', 'Extraordinary'].includes(tag.localized_tag_name)
    );

    return rarityTag?.localized_tag_name || 'Common';
  }

  /**
   * Fetches the current user's inventory and maps it to our Skin model
   */
  getUserInventory(steamId?: string): Observable<Skin[]> {
    // If no steamId is provided, try to get it from the current user session
    if (!steamId) {
      const user = JSON.parse(localStorage.getItem('neoskins_user') || 'null');
      if (user && user.steamid) {
        steamId = user.steamid;
      } else {
        console.error('[Inventory] No SteamID provided and user not logged in');
        return of([]);
      }
    }

    console.log(`[Inventory] Fetching inventory for SteamID: ${steamId}`);
    
    return this.http.get<SteamInventoryItem[]>(`${this.API_URL}/api/inventory/${steamId}`).pipe(
      map(items => {
        if (!Array.isArray(items)) {
          console.error('[Inventory] Invalid inventory data received:', items);
          return [];
        }
        
        console.log(`[Inventory] Received ${items.length} items from Steam API`);
        const mappedItems = items.map(item => this.mapSteamItemToSkin(item));
        console.log('[Inventory] Mapped items:', mappedItems);
        return mappedItems;
      }),
      tap(inventory => {
        this.userInventory = inventory;
        console.log(`[Inventory] Successfully loaded ${inventory.length} items`);
      }),
      catchError(error => {
        console.error('[Inventory] Error fetching inventory:', error);
        return of([]);
      })
    );
  }

  /**
   * Gets the cached user inventory
   */
  getCachedInventory(): Skin[] {
    return this.userInventory;
  }

  /**
   * Clears the cached inventory
   */
  clearCache(): void {
    this.userInventory = [];
  }
}
