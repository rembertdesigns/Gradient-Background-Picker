// Enhanced Gradient Generator JavaScript with Animation Controls and Advanced Color Picker
class GradientGenerator {
    constructor() {
        this.colorStops = [
            { color: '#667eea', position: 0 },
            { color: '#764ba2', position: 100 }
        ];
        this.gradientType = 'linear';
        this.gradientAngle = 90;
        this.radialPosition = 'center';
        
        // Animation properties
        this.animationType = 'none';
        this.animationSpeed = 1;
        this.animationDirection = 'normal';
        this.isPlaying = false;
        
        // Advanced color picker properties
        this.currentEditingColorIndex = null;
        this.recentColors = JSON.parse(localStorage.getItem('gradientRecentColors') || '[]');
        this.currentPickerColor = { h: 0, s: 0, l: 0 };
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupAnimationControls();
        this.setupColorPickerControls();
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

    setupAnimationControls() {
        // Animation type buttons
        document.querySelectorAll('[data-type]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('[data-type]').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.animationType = e.target.dataset.type;
                this.updateAnimation();
            });
        });

        // Animation speed slider
        document.getElementById('animationSpeed').addEventListener('input', (e) => {
            this.animationSpeed = parseFloat(e.target.value);
            document.getElementById('speedValue').textContent = `${e.target.value}x`;
            this.updateAnimation();
        });

        // Direction buttons
        document.querySelectorAll('[data-direction]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('[data-direction]').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.animationDirection = e.target.dataset.direction;
                this.updateAnimation();
            });
        });

        // Play/Pause button
        document.getElementById('playPauseBtn').addEventListener('click', () => {
            this.togglePlayPause();
        });

        // Set default animation type to "none" as active
        document.querySelector('[data-type="none"]').classList.add('active');
    }

    setupColorPickerControls() {
        // Color picker modal controls
        document.addEventListener('click', (e) => {
            if (e.target.closest('.color-stop input[type="color"]')) {
                const colorInput = e.target;
                const index = parseInt(colorInput.dataset.index);
                this.openAdvancedColorPicker(index, colorInput.value);
            }
        });

        // Modal close buttons
        document.getElementById('closeColorPicker').addEventListener('click', () => {
            this.closeColorPickerModal();
        });

        document.getElementById('cancelColorPicker').addEventListener('click', () => {
            this.closeColorPickerModal();
        });

        // Click outside modal to close
        document.getElementById('colorPickerModal').addEventListener('click', (e) => {
            if (e.target.id === 'colorPickerModal') {
                this.closeColorPickerModal();
            }
        });

        // Apply color button
        document.getElementById('applyColorBtn').addEventListener('click', () => {
            this.applySelectedColor();
        });

        // Color harmony buttons
        document.querySelectorAll('.harmony-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.harmony-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.generateColorHarmony(e.target.dataset.harmony);
            });
        });

        // HSL sliders
        document.getElementById('hueSlider').addEventListener('input', (e) => {
            this.currentPickerColor.h = parseInt(e.target.value);
            document.getElementById('hueValue').textContent = `${e.target.value}°`;
            this.updateColorFromHSL();
        });

        document.getElementById('satSlider').addEventListener('input', (e) => {
            this.currentPickerColor.s = parseInt(e.target.value);
            document.getElementById('satValue').textContent = `${e.target.value}%`;
            this.updateColorFromHSL();
        });

        document.getElementById('lightSlider').addEventListener('input', (e) => {
            this.currentPickerColor.l = parseInt(e.target.value);
            document.getElementById('lightValue').textContent = `${e.target.value}%`;
            this.updateColorFromHSL();
        });

        // Color input fields
        document.getElementById('hexInput').addEventListener('input', (e) => {
            this.updateColorFromHex(e.target.value);
        });

        ['redInput', 'greenInput', 'blueInput'].forEach(id => {
            document.getElementById(id).addEventListener('input', () => {
                this.updateColorFromRGB();
            });
        });

        ['hueInput', 'satInput', 'lightInput'].forEach(id => {
            document.getElementById(id).addEventListener('input', () => {
                this.updateColorFromHSLInputs();
            });
        });

        // Eyedropper tool
        document.getElementById('eyedropperBtn').addEventListener('click', () => {
            this.activateEyedropper();
        });

        // Clear recent colors
        document.getElementById('clearRecentColors').addEventListener('click', () => {
            this.clearRecentColors();
        });

        // Load recent colors
        this.renderRecentColors();
    }

    openAdvancedColorPicker(colorIndex, currentColor) {
        this.currentEditingColorIndex = colorIndex;
        document.getElementById('colorPickerModal').classList.add('show');
        
        // Set initial color
        this.setPickerColor(currentColor);
        
        // Focus on hex input
        setTimeout(() => {
            document.getElementById('hexInput').focus();
        }, 100);
    }

    closeColorPickerModal() {
        document.getElementById('colorPickerModal').classList.remove('show');
        this.currentEditingColorIndex = null;
    }

    setPickerColor(hex) {
        // Convert hex to HSL
        const hsl = this.hexToHSL(hex);
        this.currentPickerColor = hsl;
        
        // Update all inputs
        document.getElementById('hexInput').value = hex;
        
        const rgb = this.hexToRGB(hex);
        document.getElementById('redInput').value = rgb.r;
        document.getElementById('greenInput').value = rgb.g;
        document.getElementById('blueInput').value = rgb.b;
        
        document.getElementById('hueInput').value = Math.round(hsl.h);
        document.getElementById('satInput').value = Math.round(hsl.s);
        document.getElementById('lightInput').value = Math.round(hsl.l);
        
        // Update sliders
        document.getElementById('hueSlider').value = hsl.h;
        document.getElementById('satSlider').value = hsl.s;
        document.getElementById('lightSlider').value = hsl.l;
        
        // Update slider labels
        document.getElementById('hueValue').textContent = `${Math.round(hsl.h)}°`;
        document.getElementById('satValue').textContent = `${Math.round(hsl.s)}%`;
        document.getElementById('lightValue').textContent = `${Math.round(hsl.l)}%`;
        
        // Update preview
        document.getElementById('colorPreview').style.background = hex;
        
        // Update slider backgrounds
        this.updateSliderBackgrounds();
    }

    updateColorFromHSL() {
        const hex = this.HSLToHex(this.currentPickerColor.h, this.currentPickerColor.s, this.currentPickerColor.l);
        const rgb = this.hexToRGB(hex);
        
        // Update inputs
        document.getElementById('hexInput').value = hex;
        document.getElementById('redInput').value = rgb.r;
        document.getElementById('greenInput').value = rgb.g;
        document.getElementById('blueInput').value = rgb.b;
        document.getElementById('hueInput').value = Math.round(this.currentPickerColor.h);
        document.getElementById('satInput').value = Math.round(this.currentPickerColor.s);
        document.getElementById('lightInput').value = Math.round(this.currentPickerColor.l);
        
        // Update preview
        document.getElementById('colorPreview').style.background = hex;
        
        // Update slider backgrounds
        this.updateSliderBackgrounds();
    }

    updateColorFromHex(hex) {
        if (hex.match(/^#[0-9A-Fa-f]{6}$/)) {
            const hsl = this.hexToHSL(hex);
            const rgb = this.hexToRGB(hex);
            
            this.currentPickerColor = hsl;
            
            // Update RGB inputs
            document.getElementById('redInput').value = rgb.r;
            document.getElementById('greenInput').value = rgb.g;
            document.getElementById('blueInput').value = rgb.b;
            
            // Update HSL inputs and sliders
            document.getElementById('hueInput').value = Math.round(hsl.h);
            document.getElementById('satInput').value = Math.round(hsl.s);
            document.getElementById('lightInput').value = Math.round(hsl.l);
            
            document.getElementById('hueSlider').value = hsl.h;
            document.getElementById('satSlider').value = hsl.s;
            document.getElementById('lightSlider').value = hsl.l;
            
            document.getElementById('hueValue').textContent = `${Math.round(hsl.h)}°`;
            document.getElementById('satValue').textContent = `${Math.round(hsl.s)}%`;
            document.getElementById('lightValue').textContent = `${Math.round(hsl.l)}%`;
            
            // Update preview
            document.getElementById('colorPreview').style.background = hex;
            
            // Update slider backgrounds
            this.updateSliderBackgrounds();
        }
    }

    updateColorFromRGB() {
        const r = parseInt(document.getElementById('redInput').value) || 0;
        const g = parseInt(document.getElementById('greenInput').value) || 0;
        const b = parseInt(document.getElementById('blueInput').value) || 0;
        
        const hex = this.RGBToHex(r, g, b);
        this.updateColorFromHex(hex);
    }

    updateColorFromHSLInputs() {
        const h = parseInt(document.getElementById('hueInput').value) || 0;
        const s = parseInt(document.getElementById('satInput').value) || 0;
        const l = parseInt(document.getElementById('lightInput').value) || 0;
        
        this.currentPickerColor = { h, s, l };
        
        // Update sliders
        document.getElementById('hueSlider').value = h;
        document.getElementById('satSlider').value = s;
        document.getElementById('lightSlider').value = l;
        
        document.getElementById('hueValue').textContent = `${h}°`;
        document.getElementById('satValue').textContent = `${s}%`;
        document.getElementById('lightValue').textContent = `${l}%`;
        
        this.updateColorFromHSL();
    }

    updateSliderBackgrounds() {
        const { h, s, l } = this.currentPickerColor;
        
        // Update saturation slider background
        const satSlider = document.getElementById('satSlider');
        satSlider.style.background = `linear-gradient(to right, hsl(${h}, 0%, ${l}%), hsl(${h}, 100%, ${l}%))`;
        
        // Update lightness slider background
        const lightSlider = document.getElementById('lightSlider');
        lightSlider.style.background = `linear-gradient(to right, hsl(${h}, ${s}%, 0%), hsl(${h}, ${s}%, 50%), hsl(${h}, ${s}%, 100%))`;
    }

    generateColorHarmony(harmonyType) {
        const { h, s, l } = this.currentPickerColor;
        let colors = [];
        
        switch (harmonyType) {
            case 'complementary':
                colors = [
                    this.HSLToHex(h, s, l),
                    this.HSLToHex((h + 180) % 360, s, l)
                ];
                break;
            case 'triadic':
                colors = [
                    this.HSLToHex(h, s, l),
                    this.HSLToHex((h + 120) % 360, s, l),
                    this.HSLToHex((h + 240) % 360, s, l)
                ];
                break;
            case 'analogous':
                colors = [
                    this.HSLToHex((h - 30 + 360) % 360, s, l),
                    this.HSLToHex(h, s, l),
                    this.HSLToHex((h + 30) % 360, s, l),
                    this.HSLToHex((h + 60) % 360, s, l)
                ];
                break;
            case 'monochromatic':
                colors = [
                    this.HSLToHex(h, s, Math.max(0, l - 30)),
                    this.HSLToHex(h, s, Math.max(0, l - 15)),
                    this.HSLToHex(h, s, l),
                    this.HSLToHex(h, s, Math.min(100, l + 15)),
                    this.HSLToHex(h, s, Math.min(100, l + 30))
                ];
                break;
        }
        
        this.renderHarmonyColors(colors);
    }

    renderHarmonyColors(colors) {
        const harmonyPreview = document.getElementById('harmonyPreview');
        harmonyPreview.innerHTML = '';
        
        colors.forEach(color => {
            const colorDiv = document.createElement('div');
            colorDiv.className = 'harmony-color';
            colorDiv.style.background = color;
            colorDiv.setAttribute('data-hex', color);
            colorDiv.addEventListener('click', () => {
                this.setPickerColor(color);
            });
            harmonyPreview.appendChild(colorDiv);
        });
    }

    applySelectedColor() {
        if (this.currentEditingColorIndex !== null) {
            const hex = document.getElementById('hexInput').value;
            this.colorStops[this.currentEditingColorIndex].color = hex;
            
            // Add to recent colors
            this.addToRecentColors(hex);
            
            // Update the gradient
            this.renderColorStops();
            this.updateGradient();
            
            // Close modal
            this.closeColorPickerModal();
            
            this.showToast('Color applied successfully!');
        }
    }

    addToRecentColors(color) {
        // Remove if already exists
        this.recentColors = this.recentColors.filter(c => c !== color);
        
        // Add to beginning
        this.recentColors.unshift(color);
        
        // Keep only last 20 colors
        this.recentColors = this.recentColors.slice(0, 20);
        
        // Save to localStorage
        localStorage.setItem('gradientRecentColors', JSON.stringify(this.recentColors));
        
        // Re-render recent colors
        this.renderRecentColors();
    }

    renderRecentColors() {
        const recentColorsGrid = document.getElementById('recentColorsGrid');
        recentColorsGrid.innerHTML = '';
        
        this.recentColors.forEach(color => {
            const colorDiv = document.createElement('div');
            colorDiv.className = 'recent-color';
            colorDiv.style.background = color;
            colorDiv.title = color;
            colorDiv.addEventListener('click', () => {
                this.setPickerColor(color);
            });
            recentColorsGrid.appendChild(colorDiv);
        });
    }

    clearRecentColors() {
        this.recentColors = [];
        localStorage.removeItem('gradientRecentColors');
        this.renderRecentColors();
        this.showToast('Recent colors cleared!');
    }

    activateEyedropper() {
        const btn = document.getElementById('eyedropperBtn');
        
        if ('EyeDropper' in window) {
            const eyeDropper = new EyeDropper();
            btn.classList.add('active');
            btn.textContent = 'Click anywhere to pick...';
            
            eyeDropper.open().then(result => {
                this.setPickerColor(result.sRGBHex);
                this.showToast('Color picked successfully!');
            }).catch(() => {
                this.showToast('Eyedropper cancelled', 'error');
            }).finally(() => {
                btn.classList.remove('active');
                btn.innerHTML = '<span class="eyedropper-icon">💧</span> Pick Color from Screen';
            });
        } else {
            this.showToast('Eyedropper not supported in this browser', 'error');
        }
    }

    // Color conversion utilities
    hexToRGB(hex) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return { r, g, b };
    }

    RGBToHex(r, g, b) {
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }

    hexToHSL(hex) {
        const { r, g, b } = this.hexToRGB(hex);
        return this.RGBToHSL(r, g, b);
    }

    RGBToHSL(r, g, b) {
        r /= 255;
        g /= 255;
        b /= 255;

        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;

        if (max === min) {
            h = s = 0;
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }

        return {
            h: h * 360,
            s: s * 100,
            l: l * 100
        };
    }

    HSLToHex(h, s, l) {
        h /= 360;
        s /= 100;
        l /= 100;

        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1/6) return p + (q - p) * 6 * t;
            if (t < 1/2) return q;
            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        };

        let r, g, b;

        if (s === 0) {
            r = g = b = l;
        } else {
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }

        const toHex = (c) => {
            const hex = Math.round(c * 255).toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        };

        return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    }

    updateAnimation() {
        const preview = document.getElementById('gradientPreview');
        const body = document.body;
        
        // Remove all animation classes
        preview.classList.remove('rotate-animation', 'shift-animation', 'pulse-animation', 'animated');
        body.classList.remove('rotate-animation', 'shift-animation', 'pulse-animation', 'animated');
        
        if (this.animationType !== 'none' && this.isPlaying) {
            // Set CSS variables for animation
            const duration = `${3 / this.animationSpeed}s`;
            document.documentElement.style.setProperty('--animation-duration', duration);
            document.documentElement.style.setProperty('--animation-direction', this.animationDirection);
            
            // Add appropriate animation class
            const animationClass = `${this.animationType}-animation`;
            preview.classList.add(animationClass, 'animated');
            body.classList.add(animationClass, 'animated');
            
            // For shift animation, we need to modify the background
            if (this.animationType === 'shift') {
                const gradientCSS = this.generateGradientCSS();
                preview.style.background = gradientCSS;
                body.style.background = gradientCSS;
                preview.style.backgroundSize = '300% 300%';
                body.style.backgroundSize = '300% 300%';
            }
        }
        
        this.updatePlayPauseButton();
    }

    togglePlayPause() {
        this.isPlaying = !this.isPlaying;
        this.updateAnimation();
        this.showToast(this.isPlaying ? 'Animation started!' : 'Animation paused!');
    }

    updatePlayPauseButton() {
        const btn = document.getElementById('playPauseBtn');
        const icon = document.getElementById('playPauseIcon');
        const text = document.getElementById('playPauseText');
        
        if (this.isPlaying && this.animationType !== 'none') {
            btn.classList.remove('paused');
            icon.textContent = '⏸️';
            text.textContent = 'Pause';
        } else {
            btn.classList.add('paused');
            icon.textContent = '▶️';
            text.textContent = 'Play';
        }
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

        // Color input event listener - Note: Advanced picker is handled in setupColorPickerControls
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
        
        // Reapply animation if active
        this.updateAnimation();
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
        // CSS Output with animation
        let cssOutput = `background: ${gradientCSS};`;
        if (this.animationType !== 'none') {
            const duration = `${3 / this.animationSpeed}s`;
            cssOutput += `\nanimation: ${this.animationType}Gradient ${duration} ${this.animationType === 'shift' ? 'ease-in-out' : 'linear'} infinite ${this.animationDirection};`;
            
            if (this.animationType === 'shift') {
                cssOutput += `\nbackground-size: 300% 300%;`;
            }
        }
        document.getElementById('cssOutput').value = cssOutput;

        // Tailwind Output (simplified conversion)
        const tailwindClasses = this.generateTailwindClasses();
        document.getElementById('tailwindOutput').value = tailwindClasses;

        // React Output
        const reactStyle = this.animationType !== 'none' 
            ? `background: '${gradientCSS}', backgroundSize: '300% 300%', animation: '${this.animationType}Gradient ${3 / this.animationSpeed}s ${this.animationType === 'shift' ? 'ease-in-out' : 'linear'} infinite ${this.animationDirection}'`
            : `background: '${gradientCSS}'`;
            
        document.getElementById('reactOutput').value = 
            `<div style={{${reactStyle}}}>\n  Your content here\n</div>`;

        // SCSS Output
        document.getElementById('scssOutput').value = 
            `$gradient-primary: ${gradientCSS};\n$animation-duration: ${3 / this.animationSpeed}s;\n\n.gradient-bg {\n  background: $gradient-primary;\n  ${this.animationType !== 'none' ? `animation: ${this.animationType}Gradient $animation-duration ${this.animationType === 'shift' ? 'ease-in-out' : 'linear'} infinite ${this.animationDirection};` : ''}\n}`;
    }

    generateTailwindClasses() {
        // This is a simplified conversion - real Tailwind would need more complex logic
        const direction = this.gradientAngle === 90 ? 'to-r' : 
                         this.gradientAngle === 180 ? 'to-b' : 
                         this.gradientAngle === 270 ? 'to-l' : 'to-t';
        
        if (this.colorStops.length === 2) {
            const fromColor = this.convertHexToTailwind(this.colorStops[0].color);
            const toColor = this.convertHexToTailwind(this.colorStops[1].color);
            let classes = `bg-gradient-${direction} from-${fromColor} to-${toColor}`;
            
            if (this.animationType !== 'none') {
                classes += `\n/* Add custom animation classes for ${this.animationType} effect */`;
            }
            
            return classes;
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

        // Random animation
        const animationTypes = ['none', 'rotate', 'shift', 'pulse'];
        this.animationType = animationTypes[Math.floor(Math.random() * animationTypes.length)];
        this.isPlaying = this.animationType !== 'none';

        // Update UI
        document.getElementById('gradientType').value = this.gradientType;
        document.getElementById('gradientAngle').value = this.gradientAngle;
        document.getElementById('angleValue').textContent = `${this.gradientAngle}deg`;
        
        // Update animation UI
        document.querySelectorAll('[data-type]').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-type="${this.animationType}"]`).classList.add('active');

        this.toggleControls();
        this.renderColorStops();
        this.updateGradient();
        this.showToast('Random animated gradient generated!');
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
        params.set('animationType', this.animationType);
        params.set('animationSpeed', this.animationSpeed);
        params.set('animationDirection', this.animationDirection);

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

                // Load animation settings
                if (params.has('animationType')) {
                    this.animationType = params.get('animationType');
                    document.querySelectorAll('[data-type]').forEach(btn => btn.classList.remove('active'));
                    document.querySelector(`[data-type="${this.animationType}"]`).classList.add('active');
                }

                if (params.has('animationSpeed')) {
                    this.animationSpeed = parseFloat(params.get('animationSpeed'));
                    document.getElementById('animationSpeed').value = this.animationSpeed;
                    document.getElementById('speedValue').textContent = `${this.animationSpeed}x`;
                }

                if (params.has('animationDirection')) {
                    this.animationDirection = params.get('animationDirection');
                    document.querySelectorAll('[data-direction]').forEach(btn => btn.classList.remove('active'));
                    document.querySelector(`[data-direction="${this.animationDirection}"]`).classList.add('active');
                }

                this.isPlaying = this.animationType !== 'none';
                
                this.toggleControls();
                this.renderColorStops();
                this.updateGradient();
                this.showToast('Animated gradient loaded from URL!');
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