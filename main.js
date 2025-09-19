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