import { Component, Input } from '@angular/core';
import { Skin } from '../../models/skin.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-skin-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './skin-card.html',
  styleUrl: './skin-card.scss'
})
export class SkinCard {
  @Input() skin: Skin | undefined;

  get floatIndicatorStyle() {
    if (!this.skin || !this.skin.float) {
      return {};
    }
    const floatValue = parseFloat(this.skin.float);
    const clampedFloat = Math.max(0, Math.min(1, floatValue));
    return {
      'left': `${clampedFloat * 100}%`
    };
  }
}
