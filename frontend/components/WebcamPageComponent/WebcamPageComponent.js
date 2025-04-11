import { BaseComponent } from '../BaseComponent/BaseComponent.js';

export class WebcamPageComponent extends BaseComponent {
    #container = null;
    #video = null;
    #startButton = null;
    #captureButton = null;
    #finalizeButton = null; 
    #imagePreview = null;
    #filterSelect = null; 
    #filterOptions = null; 

    #stream = null;
    #isActive = false;
    #currentFilter = 'none';

    constructor() {
        super();
        this.loadCSS('WebcamPageComponent');
    }

render() {
    if (this.#container) {
        return this.#container;
    }

    // Create the main container
    this.#container = document.createElement('webcam-page');

    // Render the task text

    this.#container.innerHTML = `
    <header>
        <h1>Mobile Booth</h1>
    </header>

    <main>
        <section class="webcam-section">
        <div class="webcam-container">
            <video id="webcam-video" class="webcam-video" autoplay playsinline></video>
            
            <div class="filter-container">
            <div class="select-container">
                <label class="select-label">Filter</label>
                <div class="search-container">
                    <input type="text" id="filter-search" class="filter-search" placeholder="Search filters..." />
                    <span class="error-message" id="search-error"></span>
                </div>
                <div class="select-button" id="filter-select">
                <span class="select-value">No Filter</span>
                </div>
                <div class="select-options" id="filter-options">
                <div class="select-option selected" data-value="none">No Filter</div>
                <div class="select-option" data-value="grayscale">Grayscale</div>
                <div class="select-option" data-value="sepia">Sepia</div>
                <div class="select-option" data-value="invert">Invert</div>
                <div class="select-option" data-value="blur">Blur</div>
                <div class="select-option" data-value="brightness">Brightness</div>
                </div>
            </div>
            </div>
            
            <div class="webcam-controls">
            <button id="startWebcam">Start Camera</button>
            <button id="captureImage" disabled>Take Photo</button>
            <button id="toggleVideoMode">Toggle Video Mode</button>
            <button id="finalizePhoto" disabled style="text-decoration: none;">Finalize and Edit Photo</a>
            </div>
            
            <div class="image-preview" id="image-preview" >
            <img id="captured-image" alt="Captured Image" class="captured-image" src="assets/placeholder.jpeg" style="user-select: none;">
            <button id="shareButton">
                🌐 Share
            </button>
            </div>
        </div>
        </section>
    </main>
    `
    this.#initializeProperties();
    this.#addOptionsEventListeners();
    this.#addSearchEventListeners();
    return this.#container;
}

// filter search
#addSearchEventListeners() {
    const searchInput = this.#container.querySelector('#filter-search');
    const filterOptions = this.#container.querySelectorAll('.select-option');
    const errorMessage = this.#container.querySelector('#search-error');

    searchInput.addEventListener('input', () => {
        const query = searchInput.value.trim().toLowerCase();

        // Validate input
        if (/[^a-z\s]/i.test(query)) {
            errorMessage.textContent = 'Only alphabetic characters are allowed.';
            filterOptions.forEach(option => option.style.display = 'none');
            return;
        } else {
            errorMessage.textContent = '';
        }

        // Filter options and find suggestion
        let hasResults = false;
        let suggestion = '';
        
        filterOptions.forEach(option => {
            const text = option.textContent.toLowerCase();
            if (text.includes(query)) {
                option.style.display = 'block';
                hasResults = true;
                
                // Find the first matching option for suggestion
                if (!suggestion && text.startsWith(query)) {
                    suggestion = text;
                }
            } else {
                option.style.display = 'none';
            }
        });

        // Show suggestion in the input
        if (suggestion && query.length > 0) {
            searchInput.style.background = 'white';
            const suggestionSuffix = suggestion.slice(query.length);
            
            const ghostInput = document.createElement('input');
            ghostInput.type = 'text';
            ghostInput.style.position = 'absolute';
            ghostInput.style.top = '0';
            ghostInput.style.left = '0';
            ghostInput.style.width = '100%';
            ghostInput.style.height = '100%';
            ghostInput.style.border = 'none';
            ghostInput.style.padding = getComputedStyle(searchInput).padding;
            ghostInput.style.color = '#ccc';
            ghostInput.style.pointerEvents = 'none';
            ghostInput.value = query + suggestionSuffix;
            
            // Remove existing ghost input if any
            const existingGhost = searchInput.parentElement.querySelector('.ghost-input');
            if (existingGhost) {
                existingGhost.remove();
            }
            
            ghostInput.classList.add('ghost-input');
            searchInput.parentElement.appendChild(ghostInput);
        } else {
            const ghostInput = searchInput.parentElement.querySelector('.ghost-input');
            if (ghostInput) {
                ghostInput.remove();
            }
        }

        // Show message if no results
        if (!hasResults) {
            errorMessage.textContent = 'No filters found.';
        } else {
            errorMessage.textContent = '';
        }
    });

    // Clear suggestion on blur
    searchInput.addEventListener('blur', () => {
        const ghostInput = searchInput.parentElement.querySelector('.ghost-input');
        if (ghostInput) {
            ghostInput.remove();
        }
    });

    // Expand/collapse results on focus/blur
    searchInput.addEventListener('focus', () => {
        this.#filterOptions.classList.add('active');
    });

    searchInput.addEventListener('blur', () => {
        setTimeout(() => this.#filterOptions.classList.remove('active'), 200);
    });
}

    #initializeProperties() {
        this.#video = this.#container.querySelector('#webcam-video');
        this.#startButton = this.#container.querySelector('#startWebcam');
        this.#captureButton = this.#container.querySelector('#captureImage');
        this.#finalizeButton = this.#container.querySelector('#finalizePhoto');
        this.#imagePreview = this.#container.querySelector('#image-preview');
        this.#filterSelect = this.#container.querySelector('#filter-select');
        this.#filterOptions = this.#container.querySelector('#filter-options');

        this.#startButton.addEventListener('click', () => this.#toggleWebcam());
        this.#captureButton.addEventListener('click', () => this.#captureImage());
        this.#filterSelect.addEventListener('click', () => this.#toggleFilterOptions());
        window.addEventListener('beforeunload', () => {
            if (this.#stream) {
                this.#stream.getTracks().forEach((track) => track.stop());
            }
        });
    }

    #addOptionsEventListeners() {
        const options = this.#container.querySelectorAll('.select-option');
        options.forEach((option) => {
            option.addEventListener('click', () => {
                // Update selected class
                options.forEach((opt) => opt.classList.remove('selected'));
                option.classList.add('selected');
        
                // Update display text
                this.#filterSelect.querySelector('.select-value').textContent = option.textContent;
        
                // Apply filter
                const filter = option.getAttribute('data-value');
                this.#applyFilter(filter);
        
                // Close dropdown
                this.#filterOptions.classList.remove('active');
                this.#filterSelect.classList.remove('active');
            });	
        });
    }

    async #toggleWebcam() {
        console.log('toggleWebcam');
        if (!this.#isActive) {
            try {
                this.#stream = await navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: false,
                });
    
                this.#video.srcObject = this.#stream;
                this.#isActive = true;
                this.#startButton.textContent = 'Stop Camera';
                this.#captureButton.disabled = false;
            } catch (error) {
                console.error('Error accessing webcam:', error);
                alert('Could not access the camera. Please ensure it is connected and permissions are granted.');
            }
        } else {
            this.#stopWebcam();
            this.#startButton.textContent = 'Start Camera';
            this.#captureButton.disabled = true;
        }
    }

    #stopWebcam() {
        if (this.#stream) {
            this.#stream.getTracks().forEach((track) => track.stop());
            this.#stream = null;
        }
    
        this.#video.srcObject = null;
        this.#isActive = false;
    }

    #toggleFilterOptions() {
        this.#filterOptions.classList.toggle('active');
        this.#filterSelect.classList.toggle('active');
    }

    #applyFilter(filter) {
        this.#currentFilter = filter;
    
        // Reset filter
        this.#video.style.filter = '';
    
        // Apply selected filter
        switch (filter) {
            case 'grayscale':
                this.#video.style.filter = 'grayscale(100%)';
                break;
            case 'sepia':
                this.#video.style.filter = 'sepia(100%)';
                break;
            case 'invert':
                this.#video.style.filter = 'invert(100%)';
                break;
            case 'blur':
                this.#video.style.filter = 'blur(5px)';
                break;
            case 'brightness':
                this.#video.style.filter = 'brightness(150%)';
                break;
        }
    }

    #captureImage() {
        if (!this.#isActive) return;
        this.#finalizeButton.disabled = false;
    
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
    
        // Set canvas dimensions to match video
        canvas.width = this.#video.videoWidth;
        canvas.height = this.#video.videoHeight;
    
        // Draw current video frame to canvas
        if (context) {
            context.drawImage(this.#video, 0, 0, canvas.width, canvas.height);
    
            // Apply filter to canvas if needed
            if (this.#currentFilter !== 'none') {
                context.filter = this.#video.style.filter;
                context.drawImage(canvas, 0, 0);
                context.filter = 'none';
            }
    
            // Convert canvas to data URL
            const imageDataURL = canvas.toDataURL('image/png');
    
            // Display the captured image
            this.#displayCapturedImage(imageDataURL);
        }
    }

    #displayCapturedImage(imageDataURL) {
        // Clear previous previews
        this.#imagePreview.innerHTML = '';
    
        // Create and display the image
        const img = document.createElement('img');
        img.src = imageDataURL;
        img.classList.add('captured-image');
        img.style.userSelect = "none";
        this.#imagePreview.appendChild(img);
    }
}
