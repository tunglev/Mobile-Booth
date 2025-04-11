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
	#gridSelect = null;
	#gridOptions = null;

	#stream = null;
	#isActive = false;
	#currentFilter = 'none';
	#currentGridLayout = '1x4'; // Default grid layout
	#db = null;
	#capturedImages = []; // Array to store captured images
	#maxRecentImages = 4; // Maximum number of recent images to display

	constructor() {
		super();
		this.loadCSS('WebcamPageComponent');
		this.#initIndexedDB();
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
                    <div class="select-button" id="filter-select">
                    <span class="select-value">No Filter</span>
                    <span class="select-chevron">▼</span>
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
                
                <div class="grid-container">
                <div class="select-container">
                    <label class="select-label">Grid Layout</label>
                    <div class="select-button" id="grid-select">
                    <span class="select-value">1x4 (Row)</span>
                    <span class="select-chevron">▼</span>
                    </div>
                    <div class="select-options" id="grid-options">
                    <div class="select-option selected" data-value="1x4">1x4 (Row)</div>
                    <div class="select-option" data-value="2x2">2x2 (Grid)</div>
                    <div class="select-option" data-value="4x1">4x1 (Column)</div>
                    </div>
                </div>
                </div>
                
                <div class="webcam-controls">
                <button id="startWebcam">Start Camera</button>
                <button id="captureImage" disabled>Take Photo</button>
                <button id="toggleVideoMode">Toggle Video Mode</button>
                <button id="finalizePhoto" disabled style="text-decoration: none;">Finalize and Edit Photo</a>
                </div>
                
                <div class="image-preview" id="image-preview">
                    <div class="images-row layout-1x4" id="images-row">
                        <img class="captured-image" src="assets/placeholder.jpeg" style="user-select: none;">
                    </div>
                    <button id="shareButton">
                        🌐 Share
                    </button>
                </div>
            </div>
            </section>
        </main>
        `;
		this.#initializeProperties();
		this.#addOptionsEventListeners();
		this.#addGridEventListeners();
		return this.#container;
	}

	#initializeProperties() {
		this.#video = this.#container.querySelector('#webcam-video');
		this.#startButton = this.#container.querySelector('#startWebcam');
		this.#captureButton = this.#container.querySelector('#captureImage');
		this.#finalizeButton = this.#container.querySelector('#finalizePhoto');
		this.#imagePreview = this.#container.querySelector('#image-preview');
		this.#filterSelect = this.#container.querySelector('#filter-select');
		this.#filterOptions = this.#container.querySelector('#filter-options');
		this.#gridSelect = this.#container.querySelector('#grid-select');
		this.#gridOptions = this.#container.querySelector('#grid-options');

		this.#startButton.addEventListener('click', () => this.#toggleWebcam());
		this.#captureButton.addEventListener('click', () => this.#captureImage());
		this.#filterSelect.addEventListener('click', () => this.#toggleFilterOptions());
		this.#gridSelect.addEventListener('click', () => this.#toggleGridOptions());
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
				this.#saveFilterPreference(filter);

				// Close dropdown
				this.#filterOptions.classList.remove('active');
				this.#filterSelect.classList.remove('active');
			});
		});
	}

	#addGridEventListeners() {
		const options = this.#container.querySelectorAll('#grid-options .select-option');
		options.forEach((option) => {
			option.addEventListener('click', () => {
				// Update selected class
				options.forEach((opt) => opt.classList.remove('selected'));
				option.classList.add('selected');

				// Update display text
				this.#gridSelect.querySelector('.select-value').textContent = option.textContent;

				// Apply grid layout
				const layout = option.getAttribute('data-value');
				this.#applyGridLayout(layout);
				this.#saveGridPreference(layout);

				// Close dropdown
				this.#gridOptions.classList.remove('active');
				this.#gridSelect.classList.remove('active');
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

	#toggleGridOptions() {
		this.#gridOptions.classList.toggle('active');
		this.#gridSelect.classList.toggle('active');
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

	#applyGridLayout(layout) {
		this.#currentGridLayout = layout;
		const imagesRow = this.#container.querySelector('#images-row');
		
		if (imagesRow) {
			// Remove all layout classes first
			imagesRow.classList.remove('layout-1x4', 'layout-2x2', 'layout-4x1');
			// Add the new layout class
			imagesRow.classList.add(`layout-${layout}`);
		}
		
		// Re-display images with new layout
		this.#displayCapturedImages();
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

			// Add new image to the array
			this.#capturedImages.unshift(imageDataURL);
            
            // Keep only the most recent images
            if (this.#capturedImages.length > this.#maxRecentImages) {
                this.#capturedImages = this.#capturedImages.slice(0, this.#maxRecentImages);
            }

			// Display the captured images
			this.#displayCapturedImages();
		}
	}

	#displayCapturedImages() {
		// Find or create the images row container
		let imagesRow = this.#container.querySelector('#images-row');
		if (!imagesRow) {
			imagesRow = document.createElement('div');
			imagesRow.id = 'images-row';
			imagesRow.classList.add('images-row', `layout-${this.#currentGridLayout}`);
			this.#imagePreview.prepend(imagesRow);
		}

		// Clear previous previews
		imagesRow.innerHTML = '';

		// If no images captured yet, show placeholder
		if (this.#capturedImages.length === 0) {
			const img = document.createElement('img');
			img.src = 'assets/placeholder.jpeg';
			img.classList.add('captured-image');
			img.style.userSelect = 'none';
			imagesRow.appendChild(img);
			return;
		}

		// Create and display the images
		this.#capturedImages.forEach((imageDataURL) => {
			const img = document.createElement('img');
			img.src = imageDataURL;
			img.classList.add('captured-image');
			img.style.userSelect = 'none';
			imagesRow.appendChild(img);
		});
	}

	#initIndexedDB() {
		const request = indexedDB.open('MobileBoothDB', 1);

		request.onerror = (event) => {
			console.error('IndexedDB error:', event.target.error);
		};

		request.onupgradeneeded = (event) => {
			const db = event.target.result;

			// Create an object store for user preferences if it doesn't exist
			if (!db.objectStoreNames.contains('userPreferences')) {
				db.createObjectStore('userPreferences', { keyPath: 'id' });
			}
		};

		request.onsuccess = (event) => {
			this.#db = event.target.result;
			this.#loadUserPreferences();
		};
	}

	#loadUserPreferences() {
		if (!this.#db) return;

		const transaction = this.#db.transaction(['userPreferences'], 'readonly');
		const store = transaction.objectStore('userPreferences');
		
		// Load filter preference
		const filterRequest = store.get('filterPreference');
		filterRequest.onsuccess = (event) => {
			if (event.target.result) {
				const { filter } = event.target.result;
				this.#currentFilter = filter;

				// Apply the saved filter once the component is rendered
				setTimeout(() => {
					if (this.#container) {
						// Update the UI to reflect the saved filter
						const options = this.#container.querySelectorAll('#filter-options .select-option');
						options.forEach((option) => {
							if (option.getAttribute('data-value') === filter) {
								// Update the selected class
								options.forEach((opt) => opt.classList.remove('selected'));
								option.classList.add('selected');

								// Update display text
								if (this.#filterSelect) {
									this.#filterSelect.querySelector('.select-value').textContent = option.textContent;
								}

								// Apply the filter
								this.#applyFilter(filter);
							}
						});
					}
				}, 0);
			}
		};

		// Load grid layout preference
		const gridRequest = store.get('gridPreference');
		gridRequest.onsuccess = (event) => {
			if (event.target.result) {
				const { layout } = event.target.result;
				this.#currentGridLayout = layout;

				// Apply the saved grid layout once the component is rendered
				setTimeout(() => {
					if (this.#container) {
						// Update the UI to reflect the saved grid layout
						const options = this.#container.querySelectorAll('#grid-options .select-option');
						options.forEach((option) => {
							if (option.getAttribute('data-value') === layout) {
								// Update the selected class
								options.forEach((opt) => opt.classList.remove('selected'));
								option.classList.add('selected');

								// Update display text
								if (this.#gridSelect) {
									this.#gridSelect.querySelector('.select-value').textContent = option.textContent;
								}

								// Apply the grid layout
								this.#applyGridLayout(layout);
							}
						});
					}
				}, 0);
			}
		};

		filterRequest.onerror = gridRequest.onerror = (event) => {
			console.error('Error loading user preferences:', event.target.error);
		};
	}

	#saveFilterPreference(filter) {
		if (!this.#db) return;

		const transaction = this.#db.transaction(['userPreferences'], 'readwrite');
		const store = transaction.objectStore('userPreferences');

		store.put({
			id: 'filterPreference',
			filter: filter,
		});

		transaction.onerror = (event) => {
			console.error('Error saving filter preference:', event.target.error);
		};
	}

	#saveGridPreference(layout) {
		if (!this.#db) return;

		const transaction = this.#db.transaction(['userPreferences'], 'readwrite');
		const store = transaction.objectStore('userPreferences');

		store.put({
			id: 'gridPreference',
			layout: layout,
		});

		transaction.onerror = (event) => {
			console.error('Error saving grid preference:', event.target.error);
		};
	}
}
