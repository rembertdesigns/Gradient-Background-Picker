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