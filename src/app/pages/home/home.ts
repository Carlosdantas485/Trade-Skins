import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SkinCard } from '../../component/skin-card/skin-card';
import { Skin, SkinService } from '../../services/skin';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, SkinCard],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class HomeComponent implements OnInit {
  skins: Skin[] = [];

  constructor(private skinService: SkinService) {}

  ngOnInit(): void {
    this.skinService.getSkins().subscribe((skins) => {
      this.skins = skins;
    });
  }
}
