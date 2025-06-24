import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private renderer: Renderer2;
  private currentTheme: 'dark' | 'light' = 'dark';

  constructor(rendererFactory: RendererFactory2) {
    this.renderer = rendererFactory.createRenderer(null, null);
    this.initializeTheme();
  }

  private initializeTheme() {
    const savedTheme = localStorage.getItem('theme') as 'dark' | 'light';
    if (savedTheme) {
      this.setTheme(savedTheme);
    } else {
      this.setTheme('dark'); // Default theme
    }
  }

  setTheme(theme: 'dark' | 'light') {
    const oldTheme = this.currentTheme;
    this.currentTheme = theme;

    this.renderer.removeClass(document.body, `theme-${oldTheme}`);
    this.renderer.addClass(document.body, `theme-${theme}`);
    localStorage.setItem('theme', theme);
  }

  toggleTheme() {
    this.setTheme(this.currentTheme === 'dark' ? 'light' : 'dark');
  }

  getCurrentTheme() {
    return this.currentTheme;
  }
}
