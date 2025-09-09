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
        this.setupColorPickerControls();
        this.setupLibraryControls();
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

    setupLibraryControls() {
        // Library tab switching
        document.querySelectorAll('.library-tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchLibraryTab(e.target.dataset.libraryTab);
            });
        });

        // Save favorite button
        document.getElementById('saveFavoriteBtn').addEventListener('click', () => {
            this.openSaveFavoriteModal();
        });

        // Save favorite modal controls
        document.getElementById('closeSaveFavorite').addEventListener('click', () => {
            this.closeSaveFavoriteModal();
        });

        document.getElementById('cancelSaveFavorite').addEventListener('click', () => {
            this.closeSaveFavoriteModal();
        });

        document.getElementById('saveGradientBtn').addEventListener('click', () => {
            this.saveCurrentGradient();
        });

        // Collection controls
        document.getElementById('createCollectionBtn').addEventListener('click', () => {
            this.createNewCollection();
        });

        document.getElementById('clearFavoritesBtn').addEventListener('click', () => {
            this.clearAllFavorites();
        });

        // Search functionality
        document.getElementById('favoritesSearch').addEventListener('input', (e) => {
            this.searchFavorites(e.target.value);
        });

        // Import/Export
        document.getElementById('importBtn').addEventListener('click', () => {
            document.getElementById('importFile').click();
        });

        document.getElementById('importFile').addEventListener('change', (e) => {
            this.importGradients(e.target.files[0]);
        });

        document.getElementById('exportBtn').addEventListener('click', () => {
            this.exportAllGradients();
        });

        // Collection modal controls
        document.getElementById('closeCollectionModal').addEventListener('click', () => {
            this.closeCollectionModal();
        });

        document.getElementById('addCurrentToCollection').addEventListener('click', () => {
            this.addCurrentGradientToCollection();
        });

        document.getElementById('renameCollectionBtn').addEventListener('click', () => {
            this.renameCurrentCollection();
        });

        document.getElementById('deleteCollectionBtn').addEventListener('click', () => {
            this.deleteCurrentCollection();
        });

        // Initialize library display
        this.renderFavorites();
        this.renderCollections();
        this.updateCollectionSelect();
    }

    // Animation Controls
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

    // Advanced Color Picker Methods
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

    // Gradient Library Methods
    switchLibraryTab(tabName) {
        // Remove active class from all tabs and content
        document.querySelectorAll('.library-tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.library-tab-content').forEach(content => content.classList.remove('active'));

        // Add active class to selected tab and content
        document.querySelector(`[data-library-tab="${tabName}"]`).classList.add('active');
        document.getElementById(`${tabName}Tab`).classList.add('active');

        // Load content based on tab
        if (tabName === 'favorites') {
            this.renderFavorites();
        } else if (tabName === 'collections') {
            this.renderCollections();
        }
    }

    openSaveFavoriteModal() {
        document.getElementById('saveFavoriteModal').classList.add('show');
        
        // Update preview
        const gradientCSS = this.generateGradientCSS();
        document.getElementById('savePreviewGradient').style.background = gradientCSS;
        
        // Generate default name
        const defaultName = this.generateGradientName();
        document.getElementById('gradientNameInput').value = defaultName;
        
        // Focus on name input
        setTimeout(() => {
            document.getElementById('gradientNameInput').focus();
            document.getElementById('gradientNameInput').select();
        }, 100);
    }

    closeSaveFavoriteModal() {
        document.getElementById('saveFavoriteModal').classList.remove('show');
        
        // Clear form
        document.getElementById('gradientNameInput').value = '';
        document.getElementById('gradientTagsInput').value = '';
        document.getElementById('collectionSelect').value = '';
    }

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
        
        return `${colorName} ${typeNames[this.gradientType]} ${timestamp}`;
    }

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

    renderFavorites() {
        const favoritesGrid = document.getElementById('favoritesGrid');
        const emptyFavorites = document.getElementById('emptyFavorites');
        
        if (this.favoriteGradients.length === 0) {
            favoritesGrid.style.display = 'none';
            emptyFavorites.style.display = 'block';
            return;
        }
        
        favoritesGrid.style.display = 'grid';
        emptyFavorites.style.display = 'none';
        favoritesGrid.innerHTML = '';
        
        this.favoriteGradients.forEach(gradient => {
            const favoriteElement = this.createFavoriteElement(gradient);
            favoritesGrid.appendChild(favoriteElement);
        });
    }

    createFavoriteElement(gradient) {
        const favoriteDiv = document.createElement('div');
        favoriteDiv.className = 'favorite-item';
        
        const gradientCSS = this.generateGradientCSSFromData(gradient);
        const formattedDate = new Date(gradient.createdAt).toLocaleDateString();
        const tagsText = gradient.tags.length > 0 ? gradient.tags.join(', ') : 'No tags';
        
        favoriteDiv.innerHTML = `
            <div class="favorite-preview" style="background: ${gradientCSS}"></div>
            <div class="favorite-info">
                <div class="favorite-name">${gradient.name}</div>
                <div class="favorite-tags">${tagsText}</div>
                <div class="favorite-date">${formattedDate}</div>
            </div>
            <div class="favorite-actions">
                <button class="favorite-action-btn edit-favorite-btn" data-id="${gradient.id}" title="Edit">✏️</button>
                <button class="favorite-action-btn delete-favorite-btn" data-id="${gradient.id}" title="Delete">🗑️</button>
            </div>
        `;
        
        // Add event listeners
        favoriteDiv.addEventListener('click', (e) => {
            if (!e.target.closest('.favorite-actions')) {
                this.loadGradient(gradient);
            }
        });
        
        favoriteDiv.querySelector('.edit-favorite-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            this.editFavorite(gradient.id);