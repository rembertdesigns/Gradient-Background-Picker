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
        });
        
        favoriteDiv.querySelector('.delete-favorite-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            this.deleteFavorite(gradient.id);
        });
        
        return favoriteDiv;
    }

    generateGradientCSSFromData(gradientData) {
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
        
        // Update controls and render
        this.toggleControls();
        this.renderColorStops();
        this.updateGradient();
        
        this.showToast(`Loaded "${gradientData.name}"!`);
    }

    editFavorite(gradientId) {
        const gradient = this.favoriteGradients.find(g => g.id === gradientId);
        if (!gradient) return;
        
        // Load the gradient first
        this.loadGradient(gradient);
        
        // Open save modal with existing data
        this.openSaveFavoriteModal();
        document.getElementById('gradientNameInput').value = gradient.name;
        document.getElementById('gradientTagsInput').value = gradient.tags.join(', ');
        document.getElementById('collectionSelect').value = gradient.collectionId || '';
        
        // Remove the original when saving
        const originalSaveMethod = this.saveCurrentGradient.bind(this);
        this.saveCurrentGradient = () => {
            this.deleteFavorite(gradientId);
            originalSaveMethod();
            this.saveCurrentGradient = originalSaveMethod;
        };
    }

    deleteFavorite(gradientId) {
        if (confirm('Are you sure you want to delete this gradient?')) {
            this.favoriteGradients = this.favoriteGradients.filter(g => g.id !== gradientId);
            
            // Remove from collections
            Object.keys(this.gradientCollections).forEach(collectionId => {
                this.gradientCollections[collectionId].gradients = 
                    this.gradientCollections[collectionId].gradients.filter(id => id !== gradientId);
            });
            
            this.saveFavorites();
            this.saveCollections();
            this.renderFavorites();
            this.renderCollections();
            this.showToast('Gradient deleted!');
        }
    }

    clearAllFavorites() {
        if (confirm('Are you sure you want to delete ALL favorite gradients? This cannot be undone.')) {
            this.favoriteGradients = [];
            this.gradientCollections = {};
            this.saveFavorites();
            this.saveCollections();
            this.renderFavorites();
            this.renderCollections();
            this.updateCollectionSelect();
            this.showToast('All favorites cleared!');
        }
    }

    searchFavorites(query) {
        const favoritesGrid = document.getElementById('favoritesGrid');
        const favorites = favoritesGrid.querySelectorAll('.favorite-item');
        
        favorites.forEach(favorite => {
            const name = favorite.querySelector('.favorite-name').textContent.toLowerCase();
            const tags = favorite.querySelector('.favorite-tags').textContent.toLowerCase();
            const searchText = `${name} ${tags}`;
            
            if (searchText.includes(query.toLowerCase())) {
                favorite.style.display = 'block';
            } else {
                favorite.style.display = 'none';
            }
        });
    }

    // Collection Management
    createNewCollection() {
        const name = document.getElementById('collectionNameInput').value.trim();
        if (!name) {
            this.showToast('Please enter a collection name', 'error');
            return;
        }
        
        const collectionId = Date.now().toString();
        this.gradientCollections[collectionId] = {
            id: collectionId,
            name: name,
            gradients: [],
            createdAt: new Date().toISOString()
        };
        
        this.saveCollections();
        this.renderCollections();
        this.updateCollectionSelect();
        
        document.getElementById('collectionNameInput').value = '';
        this.showToast(`Collection "${name}" created!`);
    }

    renderCollections() {
        const collectionsGrid = document.getElementById('collectionsGrid');
        const emptyCollections = document.getElementById('emptyCollections');
        
        const collections = Object.values(this.gradientCollections);
        
        if (collections.length === 0) {
            collectionsGrid.style.display = 'none';
            emptyCollections.style.display = 'block';
            return;
        }
        
        collectionsGrid.style.display = 'grid';
        emptyCollections.style.display = 'none';
        collectionsGrid.innerHTML = '';
        
        collections.forEach(collection => {
            const collectionElement = this.createCollectionElement(collection);
            collectionsGrid.appendChild(collectionElement);
        });
    }

    createCollectionElement(collection) {
        const collectionDiv = document.createElement('div');
        collectionDiv.className = 'collection-item';
        
        const gradientCount = collection.gradients.length;
        const formattedDate = new Date(collection.createdAt).toLocaleDateString();
        
        // Get preview gradients (up to 4)
        const previewGradients = collection.gradients.slice(0, 4).map(gradientId => {
            const gradient = this.favoriteGradients.find(g => g.id === gradientId);
            return gradient ? this.generateGradientCSSFromData(gradient) : '#f3f4f6';
        });
        
        // Fill remaining slots with placeholder
        while (previewGradients.length < 4) {
            previewGradients.push('#f3f4f6');
        }
        
        collectionDiv.innerHTML = `
            <div class="collection-header">
                <div class="collection-name">${collection.name}</div>
                <div class="collection-count">${gradientCount}</div>
            </div>
            <div class="collection-preview">
                ${previewGradients.map(bg => `<div class="collection-preview-item" style="background: ${bg}"></div>`).join('')}
            </div>
            <div class="collection-date">${formattedDate}</div>
        `;
        
        collectionDiv.addEventListener('click', () => {
            this.openCollectionModal(collection);
        });
        
        return collectionDiv;
    }

    openCollectionModal(collection) {
        this.currentCollection = collection;
        document.getElementById('collectionModal').classList.add('show');
        document.getElementById('collectionModalTitle').textContent = `📁 ${collection.name}`;
        
        this.renderCollectionGradients(collection);
    }

    closeCollectionModal() {
        document.getElementById('collectionModal').classList.remove('show');
        this.currentCollection = null;
    }

    renderCollectionGradients(collection) {
        const collectionGradients = document.getElementById('collectionGradients');
        collectionGradients.innerHTML = '';
        
        if (collection.gradients.length === 0) {
            collectionGradients.innerHTML = '<p style="text-align: center; color: #6b7280; padding: 20px;">No gradients in this collection yet.</p>';
            return;
        }
        
        collection.gradients.forEach(gradientId => {
            const gradient = this.favoriteGradients.find(g => g.id === gradientId);
            if (gradient) {
                const gradientElement = this.createFavoriteElement(gradient);
                collectionGradients.appendChild(gradientElement);
            }
        });
    }

    addCurrentGradientToCollection() {
        if (!this.currentCollection) return;
        
        // First save the current gradient
        const gradient = {
            id: Date.now().toString(),
            name: this.generateGradientName(),
            tags: [],
            colorStops: [...this.colorStops],
            gradientType: this.gradientType,
            gradientAngle: this.gradientAngle,
            radialPosition: this.radialPosition,
            animationType: this.animationType,
            animationSpeed: this.animationSpeed,
            animationDirection: this.animationDirection,
            createdAt: new Date().toISOString(),
            collectionId: this.currentCollection.id
        };
        
        this.favoriteGradients.push(gradient);
        this.currentCollection.gradients.push(gradient.id);
        
        this.saveFavorites();
        this.saveCollections();
        
        this.renderCollectionGradients(this.currentCollection);
        this.renderCollections();
        this.showToast('Gradient added to collection!');
    }

    renameCurrentCollection() {
        if (!this.currentCollection) return;
        
        const newName = prompt('Enter new collection name:', this.currentCollection.name);
        if (newName && newName.trim() !== this.currentCollection.name) {
            this.currentCollection.name = newName.trim();
            this.saveCollections();
            this.renderCollections();
            this.updateCollectionSelect();
            document.getElementById('collectionModalTitle').textContent = `📁 ${newName}`;
            this.showToast('Collection renamed!');
        }
    }

    deleteCurrentCollection() {
        if (!this.currentCollection) return;
        
        if (confirm(`Are you sure you want to delete the "${this.currentCollection.name}" collection? Gradients will not be deleted, only the collection.`)) {
            // Remove collection reference from gradients
            this.favoriteGradients.forEach(gradient => {
                if (gradient.collectionId === this.currentCollection.id) {
                    gradient.collectionId = null;
                }
            });
            
            delete this.gradientCollections[this.currentCollection.id];
            
            this.saveFavorites();
            this.saveCollections();
            this.renderCollections();
            this.updateCollectionSelect();
            this.closeCollectionModal();
            this.showToast('Collection deleted!');
        }
    }

    updateCollectionSelect() {
        const select = document.getElementById('collectionSelect');
        const currentValue = select.value;
        
        select.innerHTML = '<option value="">No Collection</option>';
        
        Object.values(this.gradientCollections).forEach(collection => {
            const option = document.createElement('option');
            option.value = collection.id;
            option.textContent = collection.name;
            select.appendChild(option);
        });
        
        // Restore previous selection if it still exists
        if (currentValue && this.gradientCollections[currentValue]) {
            select.value = currentValue;
        }
    }

    // Import/Export functionality
    exportAllGradients() {
        const exportData = {
            favorites: this.favoriteGradients,
            collections: this.gradientCollections,
            exportedAt: new Date().toISOString(),
            version: '1.0'
        };
        
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        
        const timestamp = new Date().toISOString().slice(0, 10);
        link.download = `gradient-library-${timestamp}.json`;
        link.href = url;
        link.click();
        
        URL.revokeObjectURL(url);
        this.showToast('Gradient library exported!');
    }

    importGradients(file) {
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importData = JSON.parse(e.target.result);
                
                if (!importData.favorites || !importData.collections) {
                    throw new Error('Invalid file format');
                }
                
                // Merge with existing data
                const existingFavoriteIds = new Set(this.favoriteGradients.map(g => g.id));
                const newFavorites = importData.favorites.filter(g => !existingFavoriteIds.has(g.id));
                
                this.favoriteGradients.push(...newFavorites);
                
                // Merge collections
                Object.entries(importData.collections).forEach(([id, collection]) => {
                    if (!this.gradientCollections[id]) {
                        this.gradientCollections[id] = collection;
                    }
                });
                
                this.saveFavorites();
                this.saveCollections();
                this.renderFavorites();
                this.renderCollections();
                this.updateCollectionSelect();
                
                this.showToast(`Imported ${newFavorites.length} gradients and ${Object.keys(importData.collections).length} collections!`);
                
            } catch (error) {
                this.showToast('Error importing file. Please check the format.', 'error');
                console.error('Import error:', error);
            }
        };
        
        reader.readAsText(file);
        
        // Reset file input
        document.getElementById('importFile').value = '';
    }

    // Storage methods
    saveFavorites() {
        localStorage.setItem('gradientFavorites', JSON.stringify(this.favoriteGradients));
    }

    saveCollections() {
        localStorage.setItem('gradientCollections', JSON.stringify(this.gradientCollections));
    }

    // Core Gradient Methods
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
        const rNorm = r / 255;
        const gNorm = g / 255;
        const bNorm = b / 255;

        const max = Math.max(rNorm, gNorm, bNorm);
        const min = Math.min(rNorm, gNorm, bNorm);
        const diff = max - min;

        let h = 0;
        let s = 0;
        let l = (max + min) / 2;

        if (diff !== 0) {
            s = l > 0.5 ? diff / (2 - max - min) : diff / (max + min);

            switch (max) {
                case rNorm:
                    h = (gNorm - bNorm) / diff + (gNorm < bNorm ? 6 : 0);
                    break;
                case gNorm:
                    h = (bNorm - rNorm) / diff + 2;
                    break;
                case bNorm:
                    h = (rNorm - gNorm) / diff + 4;
                    break;
            }
            h /= 6;
        }

        return {
            h: Math.round(h * 360),
            s: Math.round(s * 100),
            l: Math.round(l * 100)
        };
    }

    HSLToHex(h, s, l) {
        h = h / 360;
        s = s / 100;
        l = l / 100;

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
            r = g = b = l; // achromatic
        } else {
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }

        return this.RGBToHex(
            Math.round(r * 255),
            Math.round(g * 255),
            Math.round(b * 255)
        );
    }

    // Tab switching functionality
    switchTab(tabName) {
        // Remove active class from all tabs and content
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

        // Add active class to selected tab and content
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        document.getElementById(`${tabName}Tab`).classList.add('active');
    }

    // Copy to clipboard functionality
    copyToClipboard(target) {
        const element = document.getElementById(target);
        if (element) {
            element.select();
            element.setSelectionRange(0, 99999); // For mobile devices
            
            navigator.clipboard.writeText(element.value).then(() => {
                this.showToast('Copied to clipboard!');
            }).catch(() => {
                // Fallback for older browsers
                document.execCommand('copy');
                this.showToast('Copied to clipboard!');
            });
        }
    }

    // Download functionality
    downloadImage(format) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = 800;
        canvas.height = 600;
        
        if (format === 'png') {
            // Create gradient on canvas
            const gradient = this.createCanvasGradient(ctx, canvas.width, canvas.height);
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Download as PNG
            canvas.toBlob((blob) => {
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.download = 'gradient.png';
                link.href = url;
                link.click();
                URL.revokeObjectURL(url);
                this.showToast('PNG downloaded!');
            });
        } else if (format === 'svg') {
            this.downloadSVG();
        }
    }

    createCanvasGradient(ctx, width, height) {
        let gradient;
        
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
        
        return gradient;
    }

    downloadSVG() {
        const stops = this.colorStops
            .sort((a, b) => a.position - b.position)
            .map(stop => `<stop offset="${stop.position}%" stop-color="${stop.color}" />`)
            .join('\n        ');

        let gradientDef;
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

        const svgContent = `<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
    <defs>
        ${gradientDef}
    </defs>
    <rect width="100%" height="100%" fill="url(#gradient)" />
</svg>`;

        const blob = new Blob([svgContent], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = 'gradient.svg';
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
        this.showToast('SVG downloaded!');
    }

    // Share functionality
    generateShareLink() {
        const params = new URLSearchParams();
        params.set('type', this.gradientType);
        params.set('angle', this.gradientAngle);
        params.set('position', this.radialPosition);
        params.set('animation', this.animationType);
        params.set('speed', this.animationSpeed);
        params.set('direction', this.animationDirection);
        params.set('stops', JSON.stringify(this.colorStops));
        
        const shareUrl = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
        
        if (navigator.share) {
            navigator.share({
                title: 'Check out this gradient!',
                url: shareUrl
            }).then(() => {
                this.showToast('Shared successfully!');
            }).catch(() => {
                this.copyShareLink(shareUrl);
            });
        } else {
            this.copyShareLink(shareUrl);
        }
    }

    copyShareLink(url) {
        navigator.clipboard.writeText(url).then(() => {
            this.showToast('Share link copied to clipboard!');
        }).catch(() => {
            // Fallback
            const textArea = document.createElement('textarea');
            textArea.value = url;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            this.showToast('Share link copied to clipboard!');
        });
    }

    // Load from URL functionality
    loadFromURL() {
        const params = new URLSearchParams(window.location.search);
        
        if (params.has('stops')) {
            try {
                const stops = JSON.parse(params.get('stops'));
                if (Array.isArray(stops) && stops.length > 0) {
                    this.colorStops = stops;
                }
            } catch (e) {
                console.warn('Invalid stops parameter in URL');
            }
        }
        
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
        
        if (params.has('animation')) {
            this.animationType = params.get('animation');
            document.querySelectorAll('[data-type]').forEach(btn => btn.classList.remove('active'));
            document.querySelector(`[data-type="${this.animationType}"]`)?.classList.add('active');
        }
        
        if (params.has('speed')) {
            this.animationSpeed = parseFloat(params.get('speed'));
            document.getElementById('animationSpeed').value = this.animationSpeed;
            document.getElementById('speedValue').textContent = `${this.animationSpeed}x`;
        }
        
        if (params.has('direction')) {
            this.animationDirection = params.get('direction');
            document.querySelectorAll('[data-direction]').forEach(btn => btn.classList.remove('active'));
            document.querySelector(`[data-direction="${this.animationDirection}"]`)?.classList.add('active');
        }
        
        this.isPlaying = this.animationType !== 'none';
        this.toggleControls();
        this.renderColorStops();
        this.updateGradient();
        
        if (params.size > 0) {
            this.showToast('Gradient loaded from URL!');
        }
    }

    // Toast notification system
    showToast(message, type = 'success') {
        // Remove existing toasts
        const existingToasts = document.querySelectorAll('.toast');
        existingToasts.forEach(toast => toast.remove());
        
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        
        // Style the toast
        Object.assign(toast.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '12px 24px',
            borderRadius: '8px',
            color: 'white',
            fontWeight: '500',
            zIndex: '10000',
            animation: 'slideInRight 0.3s ease-out',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
            backgroundColor: type === 'error' ? '#ef4444' : '#22c55e'
        });
        
        document.body.appendChild(toast);
        
        // Remove after 3 seconds
        setTimeout(() => {
            toast.style.animation = 'slideOutRight 0.3s ease-in';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
}

// Initialize the gradient generator when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new GradientGenerator();
});

// Add CSS animations for toasts and gradient animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    @keyframes rotateGradient {
        0% { filter: hue-rotate(0deg); }
        100% { filter: hue-rotate(360deg); }
    }
    
    @keyframes shiftGradient {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
    }
    
    @keyframes pulseGradient {
        0%, 100% { opacity: 1; transform: scale(1); }
        50% { opacity: 0.8; transform: scale(1.05); }
    }
    
    .rotate-animation.animated {
        animation: rotateGradient var(--animation-duration, 3s) linear infinite var(--animation-direction, normal);
    }
    
    .shift-animation.animated {
        animation: shiftGradient var(--animation-duration, 3s) ease-in-out infinite var(--animation-direction, normal);
    }
    
    .pulse-animation.animated {
        animation: pulseGradient var(--animation-duration, 3s) ease-in-out infinite var(--animation-direction, normal);
    }
`;
document.head.appendChild(style);