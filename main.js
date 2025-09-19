// Enhanced Gradient Generator JavaScript with Animation Controls, Advanced Color Picker, and Gradient Library
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
        
        // Pattern and Effects properties - ADD THESE NEW PROPERTIES
        this.currentPattern = 'none';
        this.patternIntensity = 50;
        this.patternScale = 1;
        this.blendMode = 'normal';
        this.blendOpacity = 100;
        
        // Mesh gradient properties - ADD THESE NEW PROPERTIES
        this.meshMode = false;
        this.meshGridSize = '3x3';
        this.meshColors = this.generateMeshGrid(3, 3);
        
        // Texture properties - ADD THESE NEW PROPERTIES
        this.textureType = 'none';
        this.textureIntensity = 30;
        this.customTexture = null;
        
        // Mask properties - ADD THESE NEW PROPERTIES
        this.maskType = 'none';
        this.maskSize = 80;
        this.maskBlur = 0;
        this.customMaskPath = '';
        
        // Advanced color picker properties
        this.currentEditingColorIndex = null;
        this.recentColors = JSON.parse(localStorage.getItem('gradientRecentColors') || '[]');
        this.currentPickerColor = { h: 0, s: 0, l: 0 };
        
        // Gradient library properties
        this.favoriteGradients = JSON.parse(localStorage.getItem('gradientFavorites') || '[]');
        this.gradientCollections = JSON.parse(localStorage.getItem('gradientCollections') || '{}');
        this.currentCollection = null;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupAnimationControls();
        // ADD THESE NEW SETUP METHODS TO EXISTING INIT
        this.setupPatternControls();
        this.setupMeshControls();
        this.setupTextureControls();
        this.setupMaskControls();
        this.setupColorPickerControls();
        this.setupLibraryControls();
        this.loadPresets();
        this.renderColorStops();
        this.updateGradient();
        this.loadFromURL();
    }

    setupPatternControls() {
        // Preview tab switching
        document.querySelectorAll('.preview-tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchPreviewTab(e.target.dataset.previewTab);
            });
        });

        // Pattern selection
        document.querySelectorAll('.pattern-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.pattern-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentPattern = e.target.dataset.pattern;
                this.updatePatternOverlay();
            });
        });

        // Pattern intensity slider
        document.getElementById('patternIntensity').addEventListener('input', (e) => {
            this.patternIntensity = parseInt(e.target.value);
            document.getElementById('intensityValue').textContent = `${e.target.value}%`;
            this.updatePatternOverlay();
        });

        // Pattern scale slider
        document.getElementById('patternScale').addEventListener('input', (e) => {
            this.patternScale = parseFloat(e.target.value);
            document.getElementById('scaleValue').textContent = `${e.target.value}x`;
            this.updatePatternOverlay();
        });

        // Blend mode controls
        document.getElementById('blendMode').addEventListener('change', (e) => {
            this.blendMode = e.target.value;
            this.updatePatternOverlay();
        });

        document.getElementById('blendOpacity').addEventListener('input', (e) => {
            this.blendOpacity = parseInt(e.target.value);
            document.getElementById('blendOpacityValue').textContent = `${e.target.value}%`;
            this.updatePatternOverlay();
        });
    }

    setupMeshControls() {
        // Mesh mode toggle
        document.getElementById('meshModeToggle').addEventListener('change', (e) => {
            this.meshMode = e.target.checked;
            document.getElementById('meshControls').style.display = this.meshMode ? 'block' : 'none';
            if (this.meshMode) {
                this.generateMeshGrid();
                this.renderMeshGrid();
            }
            this.updateGradient();
        });

        // Mesh grid size
        document.getElementById('meshGridSize').addEventListener('change', (e) => {
            this.meshGridSize = e.target.value;
            this.generateMeshGrid();
            this.renderMeshGrid();
            this.updateGradient();
        });

        // Randomize mesh colors
        document.getElementById('randomizeMesh').addEventListener('click', () => {
            this.generateMeshGrid();
            this.renderMeshGrid();
            this.updateGradient();
            this.showToast('Mesh colors randomized!');
        });

        // Reset mesh
        document.getElementById('resetMesh').addEventListener('click', () => {
            this.resetMeshGrid();
            this.renderMeshGrid();
            this.updateGradient();
            this.showToast('Mesh grid reset!');
        });
    }

    setupTextureControls() {
        // Texture type selection
        document.getElementById('textureType').addEventListener('change', (e) => {
            this.textureType = e.target.value;
            this.updateTextureOverlay();
        });

        // Texture intensity
        document.getElementById('textureIntensity').addEventListener('input', (e) => {
            this.textureIntensity = parseInt(e.target.value);
            document.getElementById('textureIntensityValue').textContent = `${e.target.value}%`;
            this.updateTextureOverlay();
        });

        // Custom texture upload
        document.getElementById('uploadTextureBtn').addEventListener('click', () => {
            document.getElementById('customTexture').click();
        });

        document.getElementById('customTexture').addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file && file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    this.customTexture = event.target.result;
                    this.textureType = 'custom';
                    document.getElementById('textureType').value = 'custom';
                    this.updateTextureOverlay();
                    document.getElementById('clearTextureBtn').style.display = 'inline-block';
                    this.showToast('Custom texture uploaded!');
                };
                reader.readAsDataURL(file);
            }
        });

        // Clear custom texture
        document.getElementById('clearTextureBtn').addEventListener('click', () => {
            this.customTexture = null;
            this.textureType = 'none';
            document.getElementById('textureType').value = 'none';
            document.getElementById('customTexture').value = '';
            document.getElementById('clearTextureBtn').style.display = 'none';
            this.updateTextureOverlay();
            this.showToast('Custom texture cleared!');
        });

        // Texture preview clicks
        document.querySelectorAll('.texture-preview-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const textureType = e.target.dataset.texture;
                this.textureType = textureType;
                document.getElementById('textureType').value = textureType;
                this.updateTextureOverlay();
            });
        });
    }

    setupMaskControls() {
        // Mask type selection
        document.getElementById('maskType').addEventListener('change', (e) => {
            this.maskType = e.target.value;
            document.getElementById('customMaskGroup').style.display = 
                this.maskType === 'custom' ? 'block' : 'none';
            this.updateMaskOverlay();
        });

        // Mask size
        document.getElementById('maskSize').addEventListener('input', (e) => {
            this.maskSize = parseInt(e.target.value);
            document.getElementById('maskSizeValue').textContent = `${e.target.value}%`;
            this.updateMaskOverlay();
        });

        // Mask blur
        document.getElementById('maskBlur').addEventListener('input', (e) => {
            this.maskBlur = parseInt(e.target.value);
            document.getElementById('maskBlurValue').textContent = `${e.target.value}px`;
            this.updateMaskOverlay();
        });

        // Custom mask path
        document.getElementById('customMaskPath').addEventListener('input', (e) => {
            this.customMaskPath = e.target.value;
            if (this.maskType === 'custom') {
                this.updateMaskOverlay();
            }
        });

        // Mask presets
        document.querySelectorAll('.mask-preset').forEach(preset => {
            preset.addEventListener('click', (e) => {
                const maskType = e.target.dataset.mask;
                this.maskType = maskType;
                document.getElementById('maskType').value = maskType;
                document.getElementById('customMaskGroup').style.display = 'none';
                this.updateMaskOverlay();
                
                // Update active state
                document.querySelectorAll('.mask-preset').forEach(p => p.classList.remove('active'));
                e.target.classList.add('active');
            });
        });
    }

// ADD NEW METHOD: Switch Preview Tab
switchPreviewTab(tabName) {
    // Remove active class from all tabs
    document.querySelectorAll('.preview-tab-btn').forEach(btn => btn.classList.remove('active'));
    // Add active class to selected tab
    document.querySelector(`[data-preview-tab="${tabName}"]`).classList.add('active');
    
    const preview = document.getElementById('patternOverlayPreview');
    
    // Apply different preview styles based on tab
    switch(tabName) {
        case 'gradient':
            preview.style.background = this.generateGradientCSS();
            preview.style.backgroundBlendMode = 'normal';
            break;
        case 'pattern':
            this.updatePatternOverlay();
            break;
        case 'mesh':
            if (this.meshMode) {
                preview.style.background = this.generateMeshGradientCSS();
            } else {
                preview.style.background = this.generateGradientCSS();
            }
            break;
        case 'texture':
            this.updateTextureOverlay();
            break;
    }
}

// ADD NEW METHOD: Update Pattern Overlay
updatePatternOverlay() {
    const preview = document.getElementById('patternOverlayPreview');
    const gradientCSS = this.generateGradientCSS();
    
    if (this.currentPattern === 'none') {
        preview.style.background = gradientCSS;
        preview.style.backgroundBlendMode = 'normal';
        return;
    }

    const patternCanvas = this.generatePatternCanvas();
    const patternDataUrl = patternCanvas.toDataURL();
    
    preview.style.background = `${gradientCSS}, url(${patternDataUrl})`;
    preview.style.backgroundBlendMode = this.blendMode;
    preview.style.opacity = this.blendOpacity / 100;
    preview.style.backgroundSize = `100% 100%, ${100 * this.patternScale}px ${100 * this.patternScale}px`;
}

// ADD NEW METHOD: Generate Pattern Canvas
generatePatternCanvas() {
    const canvas = document.getElementById('patternCanvas') || document.createElement('canvas');
    if (!canvas.id) {
        canvas.id = 'patternCanvas';
        canvas.style.display = 'none';
        document.body.appendChild(canvas);
    }
    
    const ctx = canvas.getContext('2d');
    canvas.width = 100;
    canvas.height = 100;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const opacity = this.patternIntensity / 100;
    
    switch(this.currentPattern) {
        case 'noise':
            this.generateNoisePattern(ctx, canvas.width, canvas.height, opacity);
            break;
        case 'stripes':
            this.generateStripesPattern(ctx, canvas.width, canvas.height, opacity);
            break;
        case 'dots':
            this.generateDotsPattern(ctx, canvas.width, canvas.height, opacity);
            break;
        case 'waves':
            this.generateWavesPattern(ctx, canvas.width, canvas.height, opacity);
            break;
    }
    
    return canvas;
}

// ADD NEW METHOD: Generate Noise Pattern
generateNoisePattern(ctx, width, height, opacity) {
    const imageData = ctx.createImageData(width, height);
    const data = imageData.data;
    
    for (let i = 0; i < data.length; i += 4) {
        const noise = Math.random() * 255;
        data[i] = noise;     // Red
        data[i + 1] = noise; // Green
        data[i + 2] = noise; // Blue
        data[i + 3] = opacity * 255; // Alpha
    }
    
    ctx.putImageData(imageData, 0, 0);
}

// ADD NEW METHOD: Generate Stripes Pattern
generateStripesPattern(ctx, width, height, opacity) {
    ctx.fillStyle = `rgba(0, 0, 0, ${opacity})`;
    const stripeWidth = 10;
    
    for (let x = 0; x < width; x += stripeWidth * 2) {
        ctx.fillRect(x, 0, stripeWidth, height);
    }
}

// ADD NEW METHOD: Generate Dots Pattern
generateDotsPattern(ctx, width, height, opacity) {
    ctx.fillStyle = `rgba(0, 0, 0, ${opacity})`;
    const dotSize = 3;
    const spacing = 15;
    
    for (let x = spacing/2; x < width; x += spacing) {
        for (let y = spacing/2; y < height; y += spacing) {
            ctx.beginPath();
            ctx.arc(x, y, dotSize, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

// ADD NEW METHOD: Generate Waves Pattern
generateWavesPattern(ctx, width, height, opacity) {
    ctx.strokeStyle = `rgba(0, 0, 0, ${opacity})`;
    ctx.lineWidth = 2;
    
    for (let y = 0; y < height; y += 20) {
        ctx.beginPath();
        for (let x = 0; x < width; x++) {
            const waveY = y + Math.sin(x * 0.1) * 10;
            if (x === 0) ctx.moveTo(x, waveY);
            else ctx.lineTo(x, waveY);
        }
        ctx.stroke();
    }
}

// ADD NEW METHOD: Update Texture Overlay
updateTextureOverlay() {
    const preview = document.getElementById('patternOverlayPreview');
    const gradientCSS = this.generateGradientCSS();
    
    if (this.textureType === 'none') {
        preview.style.background = gradientCSS;
        return;
    }
    
    let textureUrl;
    if (this.textureType === 'custom' && this.customTexture) {
        textureUrl = this.customTexture;
    } else {
        textureUrl = this.generateTextureDataUrl();
    }
    
    preview.style.background = `${gradientCSS}, url(${textureUrl})`;
    preview.style.backgroundBlendMode = 'multiply';
    preview.style.opacity = this.textureIntensity / 100;
    preview.style.backgroundSize = '100% 100%, 100px 100px';
}

// ADD NEW METHOD: Generate Texture Data URL
generateTextureDataUrl() {
    const canvas = document.getElementById('textureCanvas') || document.createElement('canvas');
    if (!canvas.id) {
        canvas.id = 'textureCanvas';
        canvas.style.display = 'none';
        document.body.appendChild(canvas);
    }
    
    const ctx = canvas.getContext('2d');
    canvas.width = 100;
    canvas.height = 100;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    switch(this.textureType) {
        case 'paper':
            this.generatePaperTexture(ctx, canvas.width, canvas.height);
            break;
        case 'canvas':
            this.generateCanvasTexture(ctx, canvas.width, canvas.height);
            break;
        case 'fabric':
            this.generateFabricTexture(ctx, canvas.width, canvas.height);
            break;
        case 'metal':
            this.generateMetalTexture(ctx, canvas.width, canvas.height);
            break;
        case 'glass':
            this.generateGlassTexture(ctx, canvas.width, canvas.height);
            break;
        case 'concrete':
            this.generateConcreteTexture(ctx, canvas.width, canvas.height);
            break;
        case 'wood':
            this.generateWoodTexture(ctx, canvas.width, canvas.height);
            break;
    }
    
    return canvas.toDataURL();
}

// ADD NEW METHOD: Generate Paper Texture
generatePaperTexture(ctx, width, height) {
    // Base paper color
    ctx.fillStyle = '#f8f8f8';
    ctx.fillRect(0, 0, width, height);
    
    // Add noise for paper texture
    const imageData = ctx.createImageData(width, height);
    const data = imageData.data;
    
    for (let i = 0; i < data.length; i += 4) {
        const noise = (Math.random() - 0.5) * 30;
        data[i] = 248 + noise;     // Red
        data[i + 1] = 248 + noise; // Green
        data[i + 2] = 248 + noise; // Blue
        data[i + 3] = 255;         // Alpha
    }
    
    ctx.putImageData(imageData, 0, 0);
}

// ADD NEW METHOD: Generate Canvas Texture
generateCanvasTexture(ctx, width, height) {
    ctx.fillStyle = '#f5f5f5';
    ctx.fillRect(0, 0, width, height);
    
    // Create canvas weave pattern
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 0.5;
    
    for (let i = 0; i < width; i += 2) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, height);
        ctx.stroke();
    }
    
    for (let i = 0; i < height; i += 2) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(width, i);
        ctx.stroke();
    }
}

// ADD NEW METHOD: Generate Fabric Texture
generateFabricTexture(ctx, width, height) {
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, width, height);
    
    // Create fabric weave
    for (let x = 0; x < width; x += 4) {
        for (let y = 0; y < height; y += 4) {
            ctx.fillStyle = Math.random() > 0.5 ? '#e8e8e8' : '#f8f8f8';
            ctx.fillRect(x, y, 2, 2);
        }
    }
}

// ADD NEW METHOD: Generate Metal Texture
generateMetalTexture(ctx, width, height) {
    // Create metallic gradient
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#c0c0c0');
    gradient.addColorStop(0.5, '#e0e0e0');
    gradient.addColorStop(1, '#a0a0a0');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    // Add metallic shine lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1;
    
    for (let i = 0; i < width; i += 10) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i + height/2, height);
        ctx.stroke();
    }
}

// ADD NEW METHOD: Generate Glass Texture
generateGlassTexture(ctx, width, height) {
    const gradient = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, width/2);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
    gradient.addColorStop(0.7, 'rgba(255, 255, 255, 0.1)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0.05)');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
}

// ADD NEW METHOD: Generate Concrete Texture
generateConcreteTexture(ctx, width, height) {
    ctx.fillStyle = '#d0d0d0';
    ctx.fillRect(0, 0, width, height);
    
    // Add random concrete spots
    for (let i = 0; i < 50; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const size = Math.random() * 3 + 1;
        const opacity = Math.random() * 0.3 + 0.1;
        
        ctx.fillStyle = `rgba(160, 160, 160, ${opacity})`;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
    }
}

// ADD NEW METHOD: Generate Wood Texture
generateWoodTexture(ctx, width, height) {
    // Create wood grain
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, '#deb887');
    gradient.addColorStop(0.5, '#d2b48c');
    gradient.addColorStop(1, '#cd853f');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    // Add wood grain lines
    ctx.strokeStyle = 'rgba(139, 69, 19, 0.3)';
    ctx.lineWidth = 0.5;
    
    for (let y = 0; y < height; y += Math.random() * 8 + 4) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        for (let x = 0; x < width; x++) {
            const waveY = y + Math.sin(x * 0.1) * 2;
            ctx.lineTo(x, waveY);
        }
        ctx.stroke();
    }
}

// ADD NEW METHOD: Update Mask Overlay
updateMaskOverlay() {
    const preview = document.getElementById('patternOverlayPreview');
    
    if (this.maskType === 'none') {
        preview.style.clipPath = 'none';
        preview.style.filter = 'none';
        return;
    }
    
    let clipPath = '';
    const size = this.maskSize;
    
    switch(this.maskType) {
        case 'circle':
            clipPath = `circle(${size/2}% at 50% 50%)`;
            break;
        case 'ellipse':
            clipPath = `ellipse(${size/2}% ${size/2.5}% at 50% 50%)`;
            break;
        case 'polygon':
            clipPath = `polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)`;
            break;
        case 'heart':
            clipPath = `path('M12,21.35l-1.45-1.32C5.4,15.36,2,12.28,2,8.5 C2,5.42,4.42,3,7.5,3c1.74,0,3.41,0.81,4.5,2.09C13.09,3.81,14.76,3,16.5,3 C19.58,3,22,5.42,22,8.5c0,3.78-3.4,6.86-8.55,11.54L12,21.35z')`;
            break;
        case 'star':
            clipPath = `polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)`;
            break;
        case 'custom':
            if (this.customMaskPath) {
                clipPath = `path('${this.customMaskPath}')`;
            }
            break;
    }
    
    preview.style.clipPath = clipPath;
    
    if (this.maskBlur > 0) {
        preview.style.filter = `blur(${this.maskBlur}px)`;
    } else {
        preview.style.filter = 'none';
    }
}

// ADD NEW METHOD: Generate Mesh Grid
generateMeshGrid(rows = null, cols = null) {
    if (rows === null || cols === null) {
        const [r, c] = this.meshGridSize.split('x').map(Number);
        rows = r;
        cols = c;
    }
    
    this.meshColors = [];
    for (let i = 0; i < rows; i++) {
        this.meshColors[i] = [];
        for (let j = 0; j < cols; j++) {
            this.meshColors[i][j] = this.generateRandomColor();
        }
    }
    return this.meshColors;
}

// ADD NEW METHOD: Reset Mesh Grid
resetMeshGrid() {
    const [rows, cols] = this.meshGridSize.split('x').map(Number);
    this.meshColors = [];
    for (let i = 0; i < rows; i++) {
        this.meshColors[i] = [];
        for (let j = 0; j < cols; j++) {
            this.meshColors[i][j] = i === 0 && j === 0 ? '#667eea' : 
                                   i === 0 && j === cols-1 ? '#764ba2' : 
                                   i === rows-1 && j === 0 ? '#11998e' : 
                                   i === rows-1 && j === cols-1 ? '#38ef7d' : '#ffffff';
        }
    }
}

// ADD NEW METHOD: Render Mesh Grid
renderMeshGrid() {
    const meshGrid = document.getElementById('meshGrid');
    const [rows, cols] = this.meshGridSize.split('x').map(Number);
    
    meshGrid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    meshGrid.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
    meshGrid.innerHTML = '';
    
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            const point = document.createElement('div');
            point.className = 'mesh-point';
            point.style.background = this.meshColors[i][j];
            point.style.borderRadius = '50%';
            point.style.cursor = 'pointer';
            point.style.border = '2px solid white';
            point.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
            point.style.transition = 'all 0.2s ease';
            
            point.addEventListener('click', () => {
                this.openMeshColorPicker(i, j);
            });
            
            point.addEventListener('mouseenter', () => {
                point.style.transform = 'scale(1.2)';
            });
            
            point.addEventListener('mouseleave', () => {
                point.style.transform = 'scale(1)';
            });
            
            meshGrid.appendChild(point);
        }
    }
}

// ADD NEW METHOD: Open Mesh Color Picker
openMeshColorPicker(row, col) {
    const input = document.createElement('input');
    input.type = 'color';
    input.value = this.meshColors[row][col];
    input.style.display = 'none';
    document.body.appendChild(input);
    
    input.addEventListener('change', (e) => {
        this.meshColors[row][col] = e.target.value;
        this.renderMeshGrid();
        this.updateGradient();
        document.body.removeChild(input);
    });
    
    input.click();
}

// ADD NEW METHOD: Generate Mesh Gradient CSS
generateMeshGradientCSS() {
    if (!this.meshMode || !this.meshColors.length) {
        return this.generateGradientCSS();
    }
    
    const [rows, cols] = this.meshGridSize.split('x').map(Number);
    
    // Create a complex radial gradient mimicking mesh gradient
    let gradients = [];
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            const x = (j / (cols - 1)) * 100;
            const y = (i / (rows - 1)) * 100;
            const size = Math.min(100 / cols, 100 / rows) * 2;
            gradients.push(`radial-gradient(circle at ${x}% ${y}%, ${this.meshColors[i][j]} 0%, transparent ${size}%)`);
        }
    }
    
    return gradients.join(', ');
}

// UPDATE THIS EXISTING METHOD: Add support for new elements
updateAnimation() {
    const preview = document.getElementById('gradientPreview');
    const patternPreview = document.getElementById('patternOverlayPreview');
    const body = document.body;
    
    // Remove all animation classes
    [preview, patternPreview, body].forEach(element => {
        if (element) {
            element.classList.remove('rotate-animation', 'shift-animation', 'pulse-animation', 'animated');
        }
    });
    
    if (this.animationType !== 'none' && this.isPlaying) {
        // Set CSS variables for animation
        const duration = `${3 / this.animationSpeed}s`;
        document.documentElement.style.setProperty('--animation-duration', duration);
        document.documentElement.style.setProperty('--animation-direction', this.animationDirection);
        
        // Add appropriate animation class
        const animationClass = `${this.animationType}-animation`;
        [preview, patternPreview, body].forEach(element => {
            if (element) {
                element.classList.add(animationClass, 'animated');
            }
        });
        
        // For shift animation, we need to modify the background
        if (this.animationType === 'shift') {
            const gradientCSS = this.meshMode ? this.generateMeshGradientCSS() : this.generateGradientCSS();
            [preview, patternPreview, body].forEach(element => {
                if (element) {
                    element.style.background = gradientCSS;
                    element.style.backgroundSize = '300% 300%';
                }
            });
        }
    }
    
    this.updatePlayPauseButton();
}

// UPDATE THIS EXISTING METHOD: Add support for mesh mode and pattern preview
updateGradient() {
    const gradientCSS = this.meshMode ? this.generateMeshGradientCSS() : this.generateGradientCSS();
    const preview = document.getElementById('gradientPreview');
    const patternPreview = document.getElementById('patternOverlayPreview');
    const body = document.body;
    
    // Update preview
    preview.style.background = gradientCSS;
    
    // Update body background
    body.style.background = gradientCSS;
    
    // Update demo elements
    document.documentElement.style.setProperty('--current-gradient', gradientCSS);
    
    // Update pattern preview if active
    if (patternPreview && document.querySelector('.preview-tab-btn.active')?.dataset.previewTab !== 'gradient') {
        this.switchPreviewTab(document.querySelector('.preview-tab-btn.active').dataset.previewTab);
    }
    
    // Update export outputs
    this.updateExportOutputs(gradientCSS);
    
    // Reapply animation if active
    this.updateAnimation();
}

// UPDATE THIS EXISTING METHOD: Add enhanced features to export
updateExportOutputs(gradientCSS) {
    // CSS Output with animation and effects
    let cssOutput = `background: ${gradientCSS};`;
    
    if (this.animationType !== 'none') {
        const duration = `${3 / this.animationSpeed}s`;
        cssOutput += `\nanimation: ${this.animationType}Gradient ${duration} ${this.animationType === 'shift' ? 'ease-in-out' : 'linear'} infinite ${this.animationDirection};`;
        
        if (this.animationType === 'shift') {
            cssOutput += `\nbackground-size: 300% 300%;`;
        }
    }
    
    // Add pattern effects to advanced CSS
    let advancedCSS = cssOutput;
    if (this.currentPattern !== 'none') {
        advancedCSS += `\n/* Pattern overlay effects */`;
        advancedCSS += `\nbackground-blend-mode: ${this.blendMode};`;
        advancedCSS += `\nopacity: ${this.blendOpacity / 100};`;
    }
    
    if (this.textureType !== 'none') {
        advancedCSS += `\n/* Texture overlay */`;
        advancedCSS += `\nfilter: contrast(1.1) brightness(0.95);`;
    }
    
    if (this.maskType !== 'none') {
        advancedCSS += `\n/* Mask effects */`;
        advancedCSS += `\nclip-path: /* Add your mask path */;`;
        if (this.maskBlur > 0) {
            advancedCSS += `\nfilter: blur(${this.maskBlur}px);`;
        }
    }
    
    document.getElementById('cssOutput').value = cssOutput;
    document.getElementById('advancedOutput').value = advancedCSS;

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
        `$gradient-primary: ${gradientCSS};\n$animation-duration: ${3 / this.animationSpeed}s;\n$pattern: '${this.currentPattern}';\n$texture: '${this.textureType}';\n\n.gradient-bg {\n  background: $gradient-primary;\n  ${this.animationType !== 'none' ? `animation: ${this.animationType}Gradient $animation-duration ${this.animationType === 'shift' ? 'ease-in-out' : 'linear'} infinite ${this.animationDirection};` : ''}\n}`;
}

// UPDATE THIS EXISTING METHOD: Add enhanced features to Tailwind output
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
        
        if (this.currentPattern !== 'none') {
            classes += `\n/* Pattern: ${this.currentPattern} */`;
        }
        
        if (this.meshMode) {
            classes += `\n/* Mesh gradient mode enabled */`;
        }
        
        return classes;
    }
    
    return `/* Custom gradient - use arbitrary values */\nbg-[${this.generateGradientCSS()}]`;
}

// UPDATE THIS EXISTING METHOD: Add enhanced properties to gradient name generation
generateGradientName() {
    const colorNames = {
        '#ff': 'Red', '#00ff': 'Green', '#0000ff': 'Blue',
        '#ffff': 'Yellow', '#ff00ff': 'Magenta', '#00ffff': 'Cyan',
        '#ffa500': 'Orange', '#800080': 'Purple', '#ffc0cb': 'Pink'
    };
    
    const mainColor = this.colorStops[0].color;
    const colorName = colorNames[mainColor.toLowerCase()] || 'Custom';
    
    const typeNames = {
        'linear': 'Linear',
        'radial': 'Radial',
        'conic': 'Conic'
    };
    
    const timestamp = new Date().toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit', 
        hour12: false 
    });
    
    const meshSuffix = this.meshMode ? ' Mesh' : '';
    
    return `${colorName} ${typeNames[this.gradientType]}${meshSuffix} ${timestamp}`;
}

// UPDATE THIS EXISTING METHOD: Add enhanced properties to gradient saving
saveCurrentGradient() {
    const name = document.getElementById('gradientNameInput').value.trim();
    const tagsInput = document.getElementById('gradientTagsInput').value.trim();
    const collectionId = document.getElementById('collectionSelect').value;
    
    if (!name) {
        this.showToast('Please enter a gradient name', 'error');
        return;
    }
    
    const tags = tagsInput ? tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag) : [];
    
    const gradient = {
        id: Date.now().toString(),
        name: name,
        tags: tags,
        colorStops: [...this.colorStops],
        gradientType: this.gradientType,
        gradientAngle: this.gradientAngle,
        radialPosition: this.radialPosition,
        animationType: this.animationType,
        animationSpeed: this.animationSpeed,
        animationDirection: this.animationDirection,
        // Enhanced properties
        currentPattern: this.currentPattern,
        patternIntensity: this.patternIntensity,
        patternScale: this.patternScale,
        blendMode: this.blendMode,
        blendOpacity: this.blendOpacity,
        meshMode: this.meshMode,
        meshGridSize: this.meshGridSize,
        meshColors: this.meshColors,
        textureType: this.textureType,
        textureIntensity: this.textureIntensity,
        maskType: this.maskType,
        maskSize: this.maskSize,
        maskBlur: this.maskBlur,
        customMaskPath: this.customMaskPath,
        createdAt: new Date().toISOString(),
        collectionId: collectionId || null
    };
    
    this.favoriteGradients.push(gradient);
    this.saveFavorites();
    
    // Add to collection if specified
    if (collectionId && this.gradientCollections[collectionId]) {
        if (!this.gradientCollections[collectionId].gradients.includes(gradient.id)) {
            this.gradientCollections[collectionId].gradients.push(gradient.id);
            this.saveCollections();
        }
    }
    
    this.renderFavorites();
    this.renderCollections();
    this.closeSaveFavoriteModal();
    this.showToast('Gradient saved successfully!');
}

// UPDATE THIS EXISTING METHOD: Add support for mesh gradients in CSS generation
generateGradientCSSFromData(gradientData) {
    if (gradientData.meshMode && gradientData.meshColors) {
        // Generate mesh gradient representation
        const [rows, cols] = (gradientData.meshGridSize || '3x3').split('x').map(Number);
        let gradients = [];
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                const x = (j / (cols - 1)) * 100;
                const y = (i / (rows - 1)) * 100;
                const size = Math.min(100 / cols, 100 / rows) * 2;
                gradients.push(`radial-gradient(circle at ${x}% ${y}%, ${gradientData.meshColors[i][j]} 0%, transparent ${size}%)`);
            }
        }
        return gradients.join(', ');
    }
    
    const stops = gradientData.colorStops
        .sort((a, b) => a.position - b.position)
        .map(stop => `${stop.color} ${stop.position}%`)
        .join(', ');

    switch (gradientData.gradientType) {
        case 'linear':
            return `linear-gradient(${gradientData.gradientAngle}deg, ${stops})`;
        case 'radial':
            return `radial-gradient(circle at ${gradientData.radialPosition}, ${stops})`;
        case 'conic':
            return `conic-gradient(from 0deg, ${stops})`;
        default:
            return `linear-gradient(${gradientData.gradientAngle}deg, ${stops})`;
    }
}

// UPDATE THIS EXISTING METHOD: Add enhanced properties loading
loadGradient(gradientData) {
    // Load gradient properties
    this.colorStops = [...gradientData.colorStops];
    this.gradientType = gradientData.gradientType;
    this.gradientAngle = gradientData.gradientAngle;
    this.radialPosition = gradientData.radialPosition;
    this.animationType = gradientData.animationType || 'none';
    this.animationSpeed = gradientData.animationSpeed || 1;
    this.animationDirection = gradientData.animationDirection || 'normal';
    this.isPlaying = this.animationType !== 'none';
    
    // Load enhanced properties
    this.currentPattern = gradientData.currentPattern || 'none';
    this.patternIntensity = gradientData.patternIntensity || 50;
    this.patternScale = gradientData.patternScale || 1;
    this.blendMode = gradientData.blendMode || 'normal';
    this.blendOpacity = gradientData.blendOpacity || 100;
    this.meshMode = gradientData.meshMode || false;
    this.meshGridSize = gradientData.meshGridSize || '3x3';
    this.meshColors = gradientData.meshColors || this.generateMeshGrid(3, 3);
    this.textureType = gradientData.textureType || 'none';
    this.textureIntensity = gradientData.textureIntensity || 30;
    this.maskType = gradientData.maskType || 'none';
    this.maskSize = gradientData.maskSize || 80;
    this.maskBlur = gradientData.maskBlur || 0;
    this.customMaskPath = gradientData.customMaskPath || '';
    
    // Update UI
    document.getElementById('gradientType').value = this.gradientType;
    document.getElementById('gradientAngle').value = this.gradientAngle;
    document.getElementById('angleValue').textContent = `${this.gradientAngle}deg`;
    document.getElementById('radialPosition').value = this.radialPosition;
    
    // Update animation UI
    document.querySelectorAll('[data-type]').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[data-type="${this.animationType}"]`).classList.add('active');
    
    document.getElementById('animationSpeed').value = this.animationSpeed;
    document.getElementById('speedValue').textContent = `${this.animationSpeed}x`;
    
    document.querySelectorAll('[data-direction]').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[data-direction="${this.animationDirection}"]`).classList.add('active');
    
    // Update pattern UI
    document.querySelectorAll('.pattern-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[data-pattern="${this.currentPattern}"]`)?.classList.add('active');
    
    document.getElementById('patternIntensity').value = this.patternIntensity;
    document.getElementById('intensityValue').textContent = `${this.patternIntensity}%`;
    document.getElementById('patternScale').value = this.patternScale;
    document.getElementById('scaleValue').textContent = `${this.patternScale}x`;
    document.getElementById('blendMode').value = this.blendMode;
    document.getElementById('blendOpacity').value = this.blendOpacity;
    document.getElementById('blendOpacityValue').textContent = `${this.blendOpacity}%`;
    
    // Update mesh UI
    document.getElementById('meshModeToggle').checked = this.meshMode;
    document.getElementById('meshControls').style.display = this.meshMode ? 'block' : 'none';
    document.getElementById('meshGridSize').value = this.meshGridSize;
    if (this.meshMode) {
        this.renderMeshGrid();
    }
    
    // Update texture UI
    document.getElementById('textureType').value = this.textureType;
    document.getElementById('textureIntensity').value = this.textureIntensity;
    document.getElementById('textureIntensityValue').textContent = `${this.textureIntensity}%`;
    
    // Update mask UI
    document.getElementById('maskType').value = this.maskType;
    document.getElementById('maskSize').value = this.maskSize;
    document.getElementById('maskSizeValue').textContent = `${this.maskSize}%`;
    document.getElementById('maskBlur').value = this.maskBlur;
    document.getElementById('maskBlurValue').textContent = `${this.maskBlur}px`;
    document.getElementById('customMaskPath').value = this.customMaskPath;
    document.getElementById('customMaskGroup').style.display = 
        this.maskType === 'custom' ? 'block' : 'none';
    
    // Update controls and render
    this.toggleControls();
    this.renderColorStops();
    this.updateGradient();
    this.updatePatternOverlay();
    this.updateTextureOverlay();
    this.updateMaskOverlay();
    
    this.showToast(`Loaded "${gradientData.name}"!`);
}

// UPDATE THIS EXISTING METHOD: Add enhanced features to random generation
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

    // Random pattern
    const patterns = ['none', 'noise', 'stripes', 'dots', 'waves'];
    this.currentPattern = patterns[Math.floor(Math.random() * patterns.length)];
    this.patternIntensity = Math.floor(Math.random() * 50) + 25;

    // Random mesh mode
    this.meshMode = Math.random() > 0.7;
    if (this.meshMode) {
        this.generateMeshGrid();
        this.renderMeshGrid();
    }

    // Update UI
    document.getElementById('gradientType').value = this.gradientType;
    document.getElementById('gradientAngle').value = this.gradientAngle;
    document.getElementById('angleValue').textContent = `${this.gradientAngle}deg`;
    
    // Update animation UI
    document.querySelectorAll('[data-type]').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[data-type="${this.animationType}"]`).classList.add('active');

    // Update pattern UI
    document.querySelectorAll('.pattern-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[data-pattern="${this.currentPattern}"]`)?.classList.add('active');
    document.getElementById('patternIntensity').value = this.patternIntensity;
    document.getElementById('intensityValue').textContent = `${this.patternIntensity}%`;

    // Update mesh UI
    document.getElementById('meshModeToggle').checked = this.meshMode;
    document.getElementById('meshControls').style.display = this.meshMode ? 'block' : 'none';

    this.toggleControls();
    this.renderColorStops();
    this.updateGradient();
    this.updatePatternOverlay();
    this.showToast('Random enhanced gradient generated!');
}

// UPDATE THIS EXISTING METHOD: Add mesh support to canvas gradient creation
createCanvasGradient(ctx, width, height) {
    let gradient;
    
    if (this.meshMode) {
        // For mesh gradients, create a complex radial gradient
        const [rows, cols] = this.meshGridSize.split('x').map(Number);
        gradient = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, Math.min(width, height)/2);
        
        // Add color stops from mesh
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                const position = (i * cols + j) / (rows * cols);
                gradient.addColorStop(position, this.meshColors[i][j]);
            }
        }
    } else {
        switch (this.gradientType) {
            case 'linear':
                const angle = (this.gradientAngle - 90) * Math.PI / 180;
                const x1 = width / 2 + Math.cos(angle) * width / 2;
                const y1 = height / 2 + Math.sin(angle) * height / 2;
                const x2 = width / 2 - Math.cos(angle) * width / 2;
                const y2 = height / 2 - Math.sin(angle) * height / 2;
                gradient = ctx.createLinearGradient(x1, y1, x2, y2);
                break;
            case 'radial':
                gradient = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, Math.min(width, height)/2);
                break;
            case 'conic':
                // Canvas doesn't support conic gradients natively, fallback to radial
                gradient = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, Math.min(width, height)/2);
                break;
            default:
                gradient = ctx.createLinearGradient(0, 0, width, 0);
        }
        
        this.colorStops.forEach(stop => {
            gradient.addColorStop(stop.position / 100, stop.color);
        });
    }
    
    return gradient;
}

// UPDATE THIS EXISTING METHOD: Add mesh support to SVG download
downloadSVG() {
    const stops = this.colorStops
        .sort((a, b) => a.position - b.position)
        .map(stop => `<stop offset="${stop.position}%" stop-color="${stop.color}" />`)
        .join('\n        ');

    let gradientDef;
    if (this.meshMode) {
        // For mesh gradients, create multiple radial gradients
        const [rows, cols] = this.meshGridSize.split('x').map(Number);
        let meshGradients = '';
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                const x = (j / (cols - 1)) * 100;
                const y = (i / (rows - 1)) * 100;
                meshGradients += `<radialGradient id="mesh${i}${j}" cx="${x}%" cy="${y}%" r="30%">
    <stop offset="0%" stop-color="${this.meshColors[i][j]}" />
    <stop offset="100%" stop-color="${this.meshColors[i][j]}" stop-opacity="0" />
</radialGradient>\n    `;
            }
        }
        gradientDef = meshGradients;
    } else {
        switch (this.gradientType) {
            case 'linear':
                const x1 = Math.cos((this.gradientAngle - 90) * Math.PI / 180) * 50 + 50;
                const y1 = Math.sin((this.gradientAngle - 90) * Math.PI / 180) * 50 + 50;
                const x2 = 100 - x1;
                const y2 = 100 - y1;
                gradientDef = `<linearGradient id="gradient" x1="${x1}%" y1="${y1}%" x2="${x2}%" y2="${y2}%">
    ${stops}
</linearGradient>`;
                break;
            case 'radial':
                gradientDef = `<radialGradient id="gradient" cx="50%" cy="50%" r="50%">
    ${stops}
</radialGradient>`;
                break;
            case 'conic':
                // SVG doesn't support conic gradients natively, fallback to radial
                gradientDef = `<radialGradient id="gradient" cx="50%" cy="50%" r="50%">
    ${stops}
</radialGradient>`;
                break;
        }
    }

    const svgContent = `<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
<defs>
    ${gradientDef}
</defs>
<rect width="100%" height="100%" fill="url(#gradient)" />
</svg>`;

    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = 'enhanced-gradient.svg';
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
    this.showToast('Enhanced SVG downloaded!');
}