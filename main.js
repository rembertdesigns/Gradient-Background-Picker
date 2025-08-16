// Enhanced Gradient Generator JavaScript
class GradientGenerator {
  constructor() {
      this.colorStops = [
          { color: '#667eea', position: 0 },
          { color: '#764ba2', position: 100 }
      ];
      this.gradientType = 'linear';
      this.gradientAngle = 90;
      this.radialPosition = 'center';
      
      this.init();
  }

  init() {
      this.setupEventListeners();
      this.loadPresets();
      this.renderColorStops();
      this.updateGradient();
      this.loadFromURL();
  }

  setupEventListeners() {
      // Gradient type controls
      document.getElementById('gradientType').addEventListener('change', (e) => {
          this.gradientType = e.target.value;
          this.toggleControls();
          this.updateGradient();
      });

      document.getElementById('gradientAngle').addEventListener('input', (e) => {
          this.gradientAngle = e.target.value;
          document.getElementById('angleValue').textContent = `${e.target.value}deg`;
          this.updateGradient();
      });

      document.getElementById('radialPosition').addEventListener('change', (e) => {
          this.radialPosition = e.target.value;
          this.updateGradient();
      });

      // Add color stop button
      document.getElementById('addColorStop').addEventListener('click', () => {
          this.addColorStop();
      });

      // Tab switching
      document.querySelectorAll('.tab-btn').forEach(btn => {
          btn.addEventListener('click', (e) => {
              this.switchTab(e.target.dataset.tab);
          });
      });

      // Copy buttons
      document.querySelectorAll('.copy-btn').forEach(btn => {
          btn.addEventListener('click', (e) => {
              this.copyToClipboard(e.target.dataset.target);
          });
      });

      // Download buttons
      document.getElementById('downloadPNG').addEventListener('click', () => {
          this.downloadImage('png');
      });

      document.getElementById('downloadSVG').addEventListener('click', () => {
          this.downloadImage('svg');
      });

      // Random gradient
      document.getElementById('randomGradient').addEventListener('click', () => {
          this.generateRandomGradient();
      });

      // Share functionality
      document.getElementById('generateShare').addEventListener('click', () => {
          this.generateShareLink();
      });
  }

  toggleControls() {
      const angleControl = document.getElementById('angleControl');
      const radialControl = document.getElementById('radialControl');
      
      if (this.gradientType === 'linear') {
          angleControl.style.display = 'block';
          radialControl.style.display = 'none';
      } else if (this.gradientType === 'radial') {
          angleControl.style.display = 'none';
          radialControl.style.display = 'block';
      } else {
          angleControl.style.display = 'none';
          radialControl.style.display = 'none';
      }
  }

  addColorStop(color = '#ff0000', position = 50) {
      // Find appropriate position if not specified
      if (position === 50 && this.colorStops.length > 0) {
          const positions = this.colorStops.map(stop => stop.position).sort((a, b) => a - b);
          for (let i = 0; i < positions.length - 1; i++) {
              const gap = positions[i + 1] - positions[i];
              if (gap > 20) {
                  position = positions[i] + gap / 2;
                  break;
              }
          }
      }

      this.colorStops.push({ color, position });
      this.colorStops.sort((a, b) => a.position - b.position);
      this.renderColorStops();
      this.updateGradient();
  }

  removeColorStop(index) {
      if (this.colorStops.length > 2) {
          this.colorStops.splice(index, 1);
          this.renderColorStops();
          this.updateGradient();
      } else {
          this.showToast('You need at least 2 color stops!', 'error');
      }
  }

  renderColorStops() {
      const container = document.getElementById('colorStopsContainer');
      container.innerHTML = '';

      this.colorStops.forEach((stop, index) => {
          const stopElement = this.createColorStopElement(stop, index);
          container.appendChild(stopElement);
      });
  }

  createColorStopElement(stop, index) {
      const stopDiv = document.createElement('div');
      stopDiv.className = 'color-stop';
      stopDiv.innerHTML = `
          <input type="color" value="${stop.color}" data-index="${index}">
          <input type="range" min="0" max="100" value="${stop.position}" data-index="${index}">
          <span class="position-value">${stop.position}%</span>
          <button class="remove-stop" data-index="${index}">×</button>
      `;

      // Color input event listener
      const colorInput = stopDiv.querySelector('input[type="color"]');
      colorInput.addEventListener('input', (e) => {
          this.colorStops[index].color = e.target.value;
          this.updateGradient();
      });

      // Position input event listener
      const positionInput = stopDiv.querySelector('input[type="range"]');
      positionInput.addEventListener('input', (e) => {
          this.colorStops[index].position = parseInt(e.target.value);
          stopDiv.querySelector('.position-value').textContent = `${e.target.value}%`;
          this.updateGradient();
      });

      // Remove button event listener
      const removeBtn = stopDiv.querySelector('.remove-stop');
      removeBtn.addEventListener('click', () => {
          this.removeColorStop(index);
      });

      return stopDiv;
  }

  updateGradient() {
      const gradientCSS = this.generateGradientCSS();
      const preview = document.getElementById('gradientPreview');
      const body = document.body;
      
      // Update preview
      preview.style.background = gradientCSS;
      
      // Update body background
      body.style.background = gradientCSS;
      
      // Update demo elements
      document.documentElement.style.setProperty('--current-gradient', gradientCSS);
      
      // Update export outputs
      this.updateExportOutputs(gradientCSS);
  }

  generateGradientCSS() {
      const stops = this.colorStops
          .sort((a, b) => a.position - b.position)
          .map(stop => `${stop.color} ${stop.position}%`)
          .join(', ');

      switch (this.gradientType) {
          case 'linear':
              return `linear-gradient(${this.gradientAngle}deg, ${stops})`;
          case 'radial':
              return `radial-gradient(circle at ${this.radialPosition}, ${stops})`;
          case 'conic':
              return `conic-gradient(from 0deg, ${stops})`;
          default:
              return `linear-gradient(${this.gradientAngle}deg, ${stops})`;
      }
  }

  updateExportOutputs(gradientCSS) {
      // CSS Output
      document.getElementById('cssOutput').value = `background: ${gradientCSS};`;

      // Tailwind Output (simplified conversion)
      const tailwindClasses = this.generateTailwindClasses();
      document.getElementById('tailwindOutput').value = tailwindClasses;

      // React Output
      document.getElementById('reactOutput').value = 
          `<div style={{background: '${gradientCSS}'}}>\n  Your content here\n</div>`;

      // SCSS Output
      document.getElementById('scssOutput').value = 
          `$gradient-primary: ${gradientCSS};\n\n.gradient-bg {\n  background: $gradient-primary;\n}`;
  }

  generateTailwindClasses() {
      // This is a simplified conversion - real Tailwind would need more complex logic
      const direction = this.gradientAngle === 90 ? 'to-r' : 
                       this.gradientAngle === 180 ? 'to-b' : 
                       this.gradientAngle === 270 ? 'to-l' : 'to-t';
      
      if (this.colorStops.length === 2) {
          const fromColor = this.convertHexToTailwind(this.colorStops[0].color);
          const toColor = this.convertHexToTailwind(this.colorStops[1].color);
          return `bg-gradient-${direction} from-${fromColor} to-${toColor}`;
      }
      
      return `/* Custom gradient - use arbitrary values */\nbg-[${this.generateGradientCSS()}]`;
  }

  convertHexToTailwind(hex) {
      // Simplified hex to Tailwind color conversion
      const colorMap = {
          '#ef4444': 'red-500',
          '#f97316': 'orange-500',
          '#eab308': 'yellow-500',
          '#22c55e': 'green-500',
          '#06b6d4': 'cyan-500',
          '#3b82f6': 'blue-500',
          '#8b5cf6': 'violet-500',
          '#ec4899': 'pink-500'
      };
      
      return colorMap[hex.toLowerCase()] || `[${hex}]`;
  }

  loadPresets() {
      const presets = [
          { name: 'Sunset', gradient: 'linear-gradient(45deg, #ff9a56 0%, #ff6b95 100%)' },
          { name: 'Ocean', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
          { name: 'Forest', gradient: 'linear-gradient(90deg, #11998e 0%, #38ef7d 100%)' },
          { name: 'Fire', gradient: 'linear-gradient(45deg, #ff416c 0%, #ff4b2b 100%)' },
          { name: 'Purple', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
          { name: 'Mint', gradient: 'linear-gradient(90deg, #00b09b 0%, #96c93d 100%)' },
          { name: 'Rose', gradient: 'linear-gradient(45deg, #f093fb 0%, #f5576c 100%)' },
          { name: 'Sky', gradient: 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)' },
          { name: 'Peach', gradient: 'linear-gradient(90deg, #ffeaa7 0%, #fab1a0 100%)' },
          { name: 'Dark', gradient: 'linear-gradient(45deg, #2d3436 0%, #636e72 100%)' },
          { name: 'Galaxy', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)' },
          { name: 'Tropical', gradient: 'linear-gradient(90deg, #ff9a56 0%, #ff6b95 50%, #c44569 100%)' }
      ];

      const presetsGrid = document.getElementById('presetsGrid');
      presetsGrid.innerHTML = '';

      presets.forEach(preset => {
          const presetElement = document.createElement('div');
          presetElement.className = 'preset-item';
          presetElement.style.background = preset.gradient;
          presetElement.setAttribute('data-name', preset.name);
          presetElement.addEventListener('click', () => this.applyPreset(preset.gradient));
          presetsGrid.appendChild(presetElement);
      });
  }

  applyPreset(gradientCSS) {
      // Parse the gradient to extract color stops
      const colorMatches = gradientCSS.match(/#[0-9a-fA-F]{6}/g);
      const percentageMatches = gradientCSS.match(/(\d+)%/g);
      
      if (colorMatches) {
          this.colorStops = [];
          colorMatches.forEach((color, index) => {
              let position = 0;
              if (percentageMatches && percentageMatches[index]) {
                  position = parseInt(percentageMatches[index]);
              } else {
                  // Distribute evenly if no percentages found
                  position = (index / (colorMatches.length - 1)) * 100;
              }
              this.colorStops.push({ color, position });
          });
          
          this.renderColorStops();
          this.updateGradient();
          this.showToast('Preset applied successfully!');
      }
  }

  generateRandomGradient() {
      const numColors = Math.floor(Math.random() * 3) + 2; // 2-4 colors
      this.colorStops = [];

      for (let i = 0; i < numColors; i++) {
          const color = this.generateRandomColor();
          const position = i === 0 ? 0 : i === numColors - 1 ? 100 : Math.floor(Math.random() * 80) + 10;
          this.colorStops.push({ color, position });
      }

      // Sort by position
      this.colorStops.sort((a, b) => a.position - b.position);
      
      // Adjust positions to be evenly distributed if they're too close
      this.colorStops.forEach((stop, index) => {
          if (index > 0 && index < this.colorStops.length - 1) {
              stop.position = Math.floor((index / (this.colorStops.length - 1)) * 100);
          }
      });

      // Random gradient type and angle
      const types = ['linear', 'radial', 'conic'];
      this.gradientType = types[Math.floor(Math.random() * types.length)];
      this.gradientAngle = Math.floor(Math.random() * 360);

      // Update UI
      document.getElementById('gradientType').value = this.gradientType;
      document.getElementById('gradientAngle').value = this.gradientAngle;
      document.getElementById('angleValue').textContent = `${this.gradientAngle}deg`;

      this.toggleControls();
      this.renderColorStops();
      this.updateGradient();
      this.showToast('Random gradient generated!');
  }

  generateRandomColor() {
      const letters = '0123456789ABCDEF';
      let color = '#';
      for (let i = 0; i < 6; i++) {
          color += letters[Math.floor(Math.random() * 16)];
      }
      return color;
  }

  switchTab(tabName) {
      // Remove active class from all tabs and content
      document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

      // Add active class to selected tab and content
      document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
      document.getElementById(`${tabName}Tab`).classList.add('active');
  }

  copyToClipboard(targetId) {
      const textarea = document.getElementById(targetId);
      textarea.select();
      textarea.setSelectionRange(0, 99999); // For mobile devices

      try {
          document.execCommand('copy');
          this.showToast('Copied to clipboard!');
      } catch (err) {
          // Fallback for modern browsers
          navigator.clipboard.writeText(textarea.value).then(() => {
              this.showToast('Copied to clipboard!');
          }).catch(() => {
              this.showToast('Failed to copy. Please select and copy manually.', 'error');
          });
      }
  }

  downloadImage(format) {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = 800;
      canvas.height = 600;

      // Create gradient
      let gradient;
      if (this.gradientType === 'linear') {
          const angle = (this.gradientAngle * Math.PI) / 180;
          const x1 = 400 + Math.cos(angle) * 400;
          const y1 = 300 + Math.sin(angle) * 300;
          const x2 = 400 - Math.cos(angle) * 400;
          const y2 = 300 - Math.sin(angle) * 300;
          gradient = ctx.createLinearGradient(x1, y1, x2, y2);
      } else {
          gradient = ctx.createRadialGradient(400, 300, 0, 400, 300, 400);
      }

      // Add color stops
      this.colorStops.forEach(stop => {
          gradient.addColorStop(stop.position / 100, stop.color);
      });

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 800, 600);

      if (format === 'png') {
          // Download PNG
          const link = document.createElement('a');
          link.download = `gradient-${Date.now()}.png`;
          link.href = canvas.toDataURL();
          link.click();
      } else {
          // Download SVG
          const svgData = this.generateSVG();
          const blob = new Blob([svgData], { type: 'image/svg+xml' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.download = `gradient-${Date.now()}.svg`;
          link.href = url;
          link.click();
          URL.revokeObjectURL(url);
      }

      this.showToast(`${format.toUpperCase()} downloaded!`);
  }

  generateSVG() {
      const stops = this.colorStops
          .map(stop => `<stop offset="${stop.position}%" stop-color="${stop.color}"/>`)
          .join('\n    ');

      let gradientElement;
      if (this.gradientType === 'linear') {
          const angle = this.gradientAngle;
          const x1 = angle === 90 ? '0%' : angle === 270 ? '100%' : '50%';
          const y1 = angle === 0 ? '0%' : angle === 180 ? '100%' : '50%';
          const x2 = angle === 90 ? '100%' : angle === 270 ? '0%' : '50%';
          const y2 = angle === 0 ? '100%' : angle === 180 ? '0%' : '50%';
          
          gradientElement = `
  <linearGradient id="grad" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">
    ${stops}
  </linearGradient>`;
      } else {
          gradientElement = `
  <radialGradient id="grad" cx="50%" cy="50%" r="50%">
    ${stops}
  </radialGradient>`;
      }

      return `<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
<defs>
  ${gradientElement}
</defs>
<rect width="100%" height="100%" fill="url(#grad)"/>
</svg>`;
  }

  generateShareLink() {
      const params = new URLSearchParams();
      params.set('type', this.gradientType);
      params.set('angle', this.gradientAngle);
      params.set('position', this.radialPosition);
      params.set('stops', JSON.stringify(this.colorStops));

      const shareUrl = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
      document.getElementById('shareUrl').value = shareUrl;
      
      // Copy to clipboard automatically
      navigator.clipboard.writeText(shareUrl).then(() => {
          this.showToast('Share link generated and copied!');
      }).catch(() => {
          this.showToast('Share link generated!');
      });
  }

  loadFromURL() {
      const params = new URLSearchParams(window.location.search);
      
      if (params.has('stops')) {
          try {
              const stops = JSON.parse(params.get('stops'));
              this.colorStops = stops;
              
              if (params.has('type')) {
                  this.gradientType = params.get('type');
                  document.getElementById('gradientType').value = this.gradientType;
              }
              
              if (params.has('angle')) {
                  this.gradientAngle = parseInt(params.get('angle'));
                  document.getElementById('gradientAngle').value = this.gradientAngle;
                  document.getElementById('angleValue').textContent = `${this.gradientAngle}deg`;
              }
              
              if (params.has('position')) {
                  this.radialPosition = params.get('position');
                  document.getElementById('radialPosition').value = this.radialPosition;
              }
              
              this.toggleControls();
              this.renderColorStops();
              this.updateGradient();
              this.showToast('Gradient loaded from URL!');
          } catch (e) {
              console.error('Error loading gradient from URL:', e);
          }
      }
  }

  showToast(message, type = 'success') {
      const toast = document.getElementById('toast');
      toast.textContent = message;
      toast.className = `toast ${type}`;
      toast.classList.add('show');

      setTimeout(() => {
          toast.classList.remove('show');
      }, 3000);
  }
}

// Initialize the gradient generator when the page loads
document.addEventListener('DOMContentLoaded', () => {
  new GradientGenerator();
});

// Export for potential future use
window.GradientGenerator = GradientGenerator;