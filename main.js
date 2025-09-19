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