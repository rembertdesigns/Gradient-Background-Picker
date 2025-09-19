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