import { Component, OnInit, signal, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-vendeur-background',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="vendeur-bg-container">
      <!-- Deep Cinematic Nebula Layers -->
      @if (showNebula) {
        <div class="nebula nebula-gold-1"></div>
        <div class="nebula nebula-gold-2"></div>
        <div class="nebula nebula-gold-3"></div>
      }
      
      <!-- CSS Particle Layers (Conditional) -->
      @if (showParticles) {
        <div class="particles layer-1" [style.box-shadow]="layer1Shadows()"></div>
        <div class="particles layer-2" [style.box-shadow]="layer2Shadows()"></div>
        <div class="particles layer-3" [style.box-shadow]="layer3Shadows()"></div>
      }
      
      <!-- Scanline Overlays -->
      <div class="scanlines"></div>
    </div>
  `,
  styles: [`
    .vendeur-bg-container {
      position: fixed;
      inset: 0;
      z-index: -1;
      background: #000;
      overflow: hidden;
      pointer-events: none;
    }

    /* Cinematic Nebula */
    .nebula {
      position: absolute;
      border-radius: 50%;
      filter: blur(180px);
      opacity: 0.35;
      pointer-events: none;
    }
    .nebula-gold-1 { width: 800px; height: 800px; background: radial-gradient(circle, #fbbf24 0%, transparent 70%); top: -20%; left: -10%; animation: float-slow 30s infinite alternate; }
    .nebula-gold-2 { width: 600px; height: 600px; background: radial-gradient(circle, #f59e0b 0%, transparent 70%); bottom: -10%; right: -10%; animation: float-slow 40s infinite alternate-reverse; }
    .nebula-gold-3 { width: 500px; height: 500px; background: radial-gradient(circle, #d97706 0%, transparent 70%); top: 40%; left: 30%; animation: float-slow 50s infinite linear; }


    /* CSS Particles Base */
    .particles {
      position: absolute;
      top: 0;
      left: 0;
      width: 2px;
      height: 2px;
      background: transparent;
      border-radius: 50%;
      pointer-events: none;
    }

    .layer-1 { animation: rise 60s linear infinite; }
    .layer-2 { animation: rise 90s linear infinite; width: 1px; height: 1px; }
    .layer-3 { animation: rise 120s linear infinite; width: 2px; height: 2px; opacity: 0.5; }

    @keyframes rise {
      from { transform: translateY(0); }
      to { transform: translateY(-2000px); }
    }

    /* Technical Overlay */
    .scanlines {
      position: absolute;
      inset: 0;
      background: linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.1) 51%, transparent 52%);
      background-size: 100% 4px;
      opacity: 0.2;
      pointer-events: none;
    }

    @keyframes float-slow {
      0% { transform: translate(0, 0) scale(1); }
      50% { transform: translate(100px, 50px) scale(1.1); }
      100% { transform: translate(-50px, 100px) scale(0.9); }
    }

  `]
})
export class VendeurBackgroundComponent implements OnInit {
  @Input() showParticles = false;
  @Input() showNebula = true;

  layer1Shadows = signal('');
  layer2Shadows = signal('');
  layer3Shadows = signal('');

  ngOnInit() {
    console.log('Initializing Flagship Vendeur Background...');
    if (this.showParticles) {
      this.layer1Shadows.set(this.generateShadows(400, 1));
      this.layer2Shadows.set(this.generateShadows(300, 2));
      this.layer3Shadows.set(this.generateShadows(200, 3));
    }
  }

  private generateShadows(count: number, blur: number): string {
    let shadows = [];
    for (let i = 0; i < count; i++) {
      const x = Math.floor(Math.random() * 2500);
      const y = Math.floor(Math.random() * 2500);
      shadows.push(`${x}px ${y}px ${blur}px #fbbf24`);
    }
    return shadows.join(', ');
  }
}
