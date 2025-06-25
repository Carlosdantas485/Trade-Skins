import { Component, OnInit } from '@angular/core';
import { Skin } from '../../models/skin.model';
import { SkinService } from '../../services/skin';
import { CommonModule } from '@angular/common';
import { SkinCard } from '../../component/skin-card/skin-card';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-marketplace',
  standalone: true,
  imports: [CommonModule, SkinCard],
  templateUrl: './marketplace.html',
  styleUrl: './marketplace.scss'
})
export class Marketplace implements OnInit {
  // A lista agora pode conter skins ou ser indefinida para os loaders
  skins: (Skin | undefined)[] = [];
  private allSkins: Skin[] = [];

  constructor(
    private skinService: SkinService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    // 1. Exibe 4 loaders inicialmente
    this.skins = new Array(4);

    // 2. Busca os dados das skins
    this.skinService.getSkins().subscribe(fetchedSkins => {
      this.allSkins = fetchedSkins;

      // 3. Ouve as mudanças nos parâmetros da URL para filtrar
      this.route.queryParams.subscribe(params => {
        const searchTerm = params['search']?.toLowerCase();
        this.filterSkins(searchTerm);
      });
    });
  }

  private filterSkins(searchTerm: string | undefined): void {
    if (searchTerm) {
      this.skins = this.allSkins.filter(skin =>
        skin.name.toLowerCase().includes(searchTerm)
      );
    } else {
      // Se não houver busca, mostra todas as skins
      this.skins = [...this.allSkins];
    }
  }
}
