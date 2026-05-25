import { Component } from '@angular/core';

@Component({
  selector: 'app-ambient-background',
  standalone: true,
  template: `
    <div class="fixed inset-0 overflow-hidden bg-black -z-10">
      <div class="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-amber-500/20 blur-[120px] mix-blend-screen animate-pulse" style="animation-duration: 8s;"></div>
      <div class="absolute top-[20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-yellow-600/10 blur-[150px] mix-blend-screen animate-pulse" style="animation-duration: 12s; animation-delay: 2s;"></div>
      <div class="absolute bottom-[-20%] left-[20%] w-[60%] h-[60%] rounded-full bg-amber-900/30 blur-[150px] mix-blend-screen animate-pulse" style="animation-duration: 10s; animation-delay: 4s;"></div>
      
      <!-- Subtle noise texture overlay -->
      <div class="absolute inset-0 opacity-[0.03] pointer-events-none" style="background-image: url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E');"></div>
    </div>
  `
})
export class AmbientBackgroundComponent {}
