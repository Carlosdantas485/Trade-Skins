import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SkinCard } from '../../component/skin-card/skin-card';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, SkinCard],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class HomeComponent {

}
