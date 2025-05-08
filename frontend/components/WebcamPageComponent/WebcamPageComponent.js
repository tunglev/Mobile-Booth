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
	#countdownOverlay = null; // Added for countdown display

	#stream = null;
	#isActive = false;
	#currentFilter = 'none';
	#currentGridLayout = '1x4'; // Default grid layout
	#dbprefs = null; // Keep for potential other uses or future refactor, but logic will bypass it for filter/grid
	#dbimages = null;
	#capturedImages = []; // Array to store captured images
	#maxRecentImages = 4; // Maximum number of recent images to display
	#captureIntervalId = null; // Added to manage the capture interval
	#isCombiningImages = false; // Flag to prevent concurrent combining operations

	constructor() {
		super();
		this.loadCSS('WebcamPageComponent');
		this.#initIndexedDB(); // Keep this, it initializes image DB too
		this.#loadPreferencesFromServer(); // Load from server instead of local
	}

    #playAudio(soundFilePath) {
        const audio = new Audio(soundFilePath);
        audio.play().catch(error => console.error(`Error playing sound: ${soundFilePath}`, error));
    }

    render() {
        this.#stopWebcam();
        if (this.#container) {
            return this.#container;
        }

		// Create the main container
		this.#container = document.createElement('div'); // Changed from 'webcam-page' to 'div' for more general use
		this.#container.classList.add('webcam-page-component'); // Added a class for styling

		// Render the task text

		this.#container.innerHTML = `
        <header>
            <h1>Mobile Booth</h1>
        </header>
        <main class="webcam-page-main">
            <div id="countdown-overlay" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.7); color: white; font-size: 10em; display: flex; justify-content: center; align-items: center; z-index: 1000; display: none;">3</div>
            <div class="webcam-layout-container">
                <div class="webcam-left-panel">
                    <video id="webcam-video" class="webcam-video" autoplay playsinline></video>
                </div>
                <div class="webcam-right-panel">
                    <div class="controls-and-previews">
                        <section class="config-section">
                            <div class="filter-container">
                                <div class="select-container">
                                    <label class="select-label">Filter</label>
                                    <div class="search-container">
                                        <input type="text" id="filter-search" class="filter-search" placeholder="Search filters..." />
                                        <span class="error-message" id="search-error"></span>
                                    </div>
                                    <div class="select-button" id="filter-select">
                                        <span class="select-value">No Filter</span>
                                        <span class="select-chevron">▼</span>
                                    </div>
                                    <div class="select-options" id="filter-options">
                                        <div class="select-option selected" data-value="none">No Filter</div>
                                        <div class="select-option filter-option" data-value="grayscale">Grayscale</div>
                                        <div class="select-option filter-option" data-value="sepia">Sepia</div>
                                        <div class="select-option filter-option" data-value="invert">Invert</div>
                                        <div class="select-option filter-option" data-value="blur">Blur</div>
                                        <div class="select-option filter-option" data-value="brightness">Brightness</div>
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
                                <button id="captureImage" disabled>Start capturing</button>
                                <button id="finalizePhoto" disabled style="text-decoration: none;">Finalize and Edit Photo</button>
                            </div>
                        </section>
                        <section class="preview-section">
                            <div class="image-preview" id="image-preview">
                                <div class="images-row layout-1x4" id="images-row">
                                    <img class="captured-image" src="assets/placeholder.jpeg" style="user-select: none;">
                                </div>
                                <button id="shareButton">
                                    🌐 Share
                                </button>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </main>
        `;
		this.#initializeProperties();
		this.#addOptionsEventListeners();
		this.#addSearchEventListeners();
		this.#addGridEventListeners();
		return this.#container;
	}

	// filter search
	#addSearchEventListeners() {
		const searchInput = this.#container.querySelector('#filter-search');
		const filterOptions = this.#container.querySelectorAll('.filter-option');
		const errorMessage = this.#container.querySelector('#search-error');

		searchInput.addEventListener('input', () => {
			const query = searchInput.value.trim().toLowerCase();

			// Validate input
			if (/[^a-z\s]/i.test(query)) {
				errorMessage.textContent = 'Only alphabetic characters are allowed.';
				filterOptions.forEach((option) => (option.style.display = 'none'));
				return;
			} else {
				errorMessage.textContent = '';
			}

			// Filter options and find suggestion
			let hasResults = false;
			let suggestion = '';

			filterOptions.forEach((option) => {
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
		this.#gridSelect = this.#container.querySelector('#grid-select');
		this.#gridOptions = this.#container.querySelector('#grid-options');
		this.#countdownOverlay = this.#container.querySelector('#countdown-overlay'); // Initialize countdown overlay

		this.#startButton.addEventListener('click', () => this.#toggleWebcam());
		this.#captureButton.addEventListener('click', () => this.#startCapturing());
		this.#filterSelect.addEventListener('click', () => this.#toggleFilterOptions());
		this.#gridSelect.addEventListener('click', () => this.#toggleGridOptions());
		window.addEventListener('beforeunload', () => {
			if (this.#stream) {
				this.#stream.getTracks().forEach((track) => track.stop());
			}
		});
	}

	#addOptionsEventListeners() {
		const options = this.#container.querySelectorAll('#filter-options .select-option'); // Changed selector to include all .select-option elements within #filter-options
		options.forEach((option) => {
			option.addEventListener('click', (event) => { // Add event parameter
				event.preventDefault(); // Prevent default action

				// Update selected class
				options.forEach((opt) => opt.classList.remove('selected'));
				option.classList.add('selected');

				// Update display text
				this.#filterSelect.querySelector('.select-value').textContent = option.textContent;

				// Apply filter
				const filter = option.getAttribute('data-value');
				this.#applyFilter(filter);
				this.#updatePreferencesOnServer({ filter }); // Save to server

				// Close dropdown
				this.#filterOptions.classList.remove('active');
				this.#filterSelect.classList.remove('active');
			});
		});
	}

	#addGridEventListeners() {
		const options = this.#container.querySelectorAll('#grid-options .select-option');
		options.forEach((option) => {
			option.addEventListener('click', (event) => { // Add event parameter
				event.preventDefault(); // Prevent default action

				// Update selected class
				options.forEach((opt) => opt.classList.remove('selected'));
				option.classList.add('selected');

				// Update display text
				this.#gridSelect.querySelector('.select-value').textContent = option.textContent;

				// Apply grid layout
				const layout = option.getAttribute('data-value');
				this.#applyGridLayout(layout);
				this.#updatePreferencesOnServer({ gridSize: layout }); // Save to server

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
		}
	}

	#stopWebcam() {
		if (this.#stream) {
			this.#stream.getTracks().forEach((track) => track.stop());
			this.#stream = null;
		}
        if (this.#video) {
            this.#video.srcObject = null;
        }

		// Stop continuous capture if it's running
		this.#stopCapturingInterval();

        if (this.#startButton) {
            this.#startButton.textContent = 'Start Camera';
        }
        if (this.#captureButton) {
            this.#captureButton.disabled = true;
        }
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

		// Update UI dropdown display after applying
		if (this.#container && this.#filterSelect) {
			const options = this.#container.querySelectorAll('#filter-options .select-option');
			options.forEach((option) => {
				const isSelected = option.getAttribute('data-value') === filter;
				option.classList.toggle('selected', isSelected);
				if (isSelected) {
					this.#filterSelect.querySelector('.select-value').textContent = option.textContent;
				}
			});
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

		// Update UI dropdown display after applying
		if (this.#container && this.#gridSelect) {
			const options = this.#container.querySelectorAll('#grid-options .select-option');
			options.forEach((option) => {
				const isSelected = option.getAttribute('data-value') === layout;
				option.classList.toggle('selected', isSelected);
				if (isSelected) {
					this.#gridSelect.querySelector('.select-value').textContent = option.textContent;
				}
			});
		}
	}

	#startCapturing() {
		if (!this.#isActive) {
			console.warn('Webcam is not active. Cannot start capturing.');
			return;
		}

		// Clear any existing interval before starting a new one
		this.#stopCapturingInterval();

		// Disable the single capture button and finalize button during continuous capture
		// The main webcam start/stop button remains enabled.
		if (this.#captureButton) {
			this.#captureButton.disabled = true;
		}
		if (this.#finalizeButton) {
			this.#finalizeButton.disabled = true;
		}

		this.#capturedImages = []; // Reset captured images array
		this.#displayCapturedImages(); // Update UI to show empty/placeholder initially

		let countdown = 3; // Countdown from 3 seconds
		// Show and initialize countdown overlay for the first number (e.g., 3)
		if (this.#countdownOverlay) {
			this.#countdownOverlay.textContent = countdown;
			this.#countdownOverlay.style.display = 'flex';
            // Play sound immediately for the first number if it's greater than 0
            if (countdown > 0) { 
                this.#playAudio('assets/sounds/count.mp3');
            }
		}

		// Start capturing images every second after the initial display
		this.#captureIntervalId = setInterval(() => {
			if (!this.#isActive) { // Safety check: if webcam was stopped externally
				this.#stopCapturingInterval(); // Stop the interval
				return;
			}

            // `countdown` here is the value that was last displayed or set.
            // We decrement it first to get the new value for this tick.
            if (countdown > 0) {
                countdown--; // New value for this tick (e.g., 2, then 1, then 0)

                if (countdown > 0) { // If the new value is still positive (e.g., 2 or 1)
                    // This is a countdown tick, not the capture tick yet.
                    if (this.#countdownOverlay) {
                        this.#countdownOverlay.textContent = countdown; // Display the new number (2 or 1)
                    }
                    this.#playAudio('assets/sounds/count.mp3'); // Play sound for this new number
                    return; // End this interval tick; wait for the next one.
                }
                // If countdown is now 0, we fall through to the capture logic below.
            }

            // This point is reached if countdown became 0 in the block above.
            // Hide countdown display as it's now 0
            if (this.#countdownOverlay) {
                this.#countdownOverlay.style.display = 'none';
            }

            this.#captureImage(); // Capture the image (plays shutter sound)

            // Check if the sequence of captures is complete
            if (this.#capturedImages.length < this.#maxRecentImages) {
                // Not complete, reset countdown for the next image
                countdown = 3; 
                if (this.#countdownOverlay) {
                    this.#countdownOverlay.textContent = countdown; // Display 3 for the new countdown
                    this.#countdownOverlay.style.display = 'flex';
                    this.#playAudio('assets/sounds/count.mp3'); // Play sound for this new 3
                }
            } else {
                // Sequence complete
                this.#stopCapturingInterval(); 
                this.#combineAndSaveCapturedImages();
                if (this.#finalizeButton) {
                    this.#finalizeButton.disabled = false;
                }
                if (this.#isActive && this.#captureButton) {
                    this.#captureButton.disabled = false; 
                }
            }
		}, 1000);
		console.log('Continuous capture started.');
	}

	// Helper method to clear the capture interval and manage button states
	#stopCapturingInterval() {
		if (this.#captureIntervalId) {
			clearInterval(this.#captureIntervalId);
			this.#captureIntervalId = null;
			console.log('Continuous capture interval stopped.');

			// Hide countdown overlay
			if (this.#countdownOverlay) {
				this.#countdownOverlay.style.display = 'none';
			}

			// Re-enable the capture button if the webcam is still active
			if (this.#isActive && this.#captureButton) {
				this.#captureButton.disabled = false;
			}
			// Finalize button state is typically managed by #captureImage or other logic
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

            this.#playAudio('assets/sounds/camera-shutter.mp3'); // Play shutter sound

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
		// This function now primarily ensures the ImageDB is set up.
		// The MobileBoothDB (prefs) part remains but isn't used by the preference methods anymore.
		const request = indexedDB.open('MobileBoothDB', 5);

		request.onerror = (event) => {
			console.error('IndexedDB error (MobileBoothDB):', event.target.error);
		};

		request.onupgradeneeded = (event) => {
			console.log("upgradeneeded for MobileBoothDB")
			const db = event.target.result;
			if (!db.objectStoreNames.contains('userPreferences')) {
                console.log("created prefs db");
				db.createObjectStore('userPreferences', { keyPath: 'id' });
			} else {
                console.log("prefs db already exists");
            }
		};

		request.onsuccess = (event) => {
			this.#dbprefs = event.target.result; // Store the DB handle
			// No longer call #loadUserPreferences here
		};

		///////////////////////////////////////////////////////
		const request2 = indexedDB.open('ImageDB', 5);

		request2.onerror = (event) => {
			console.error('IndexedDB error (ImageDB):', event.target.error);
		};

		request2.onupgradeneeded = (event) => {
			console.log("upgradeneeded for ImageDB");
			const db = event.target.result;
            if (!db.objectStoreNames.contains('images')) {
                console.log("created images db");
                db.createObjectStore('images', { keyPath: 'id' });
            } else {
                console.log("images db already exists");
            }
		};

		request2.onsuccess = (event) => {
			this.#dbimages = event.target.result; // Store the DB handle for images
			// No longer call #loadUserPreferences here
		};
	}

	// Add methods for server communication
	async #loadPreferencesFromServer() {
		try {
			const response = await fetch('http://localhost:3000/preferences'); // Add full URL
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			const prefs = await response.json();
			console.log('Loaded preferences from server:', prefs);

			// Apply preferences after a short delay to ensure DOM is ready
			setTimeout(() => {
				if (prefs.filter) {
					this.#applyFilter(prefs.filter);
				}
				if (prefs.gridSize) {
					this.#applyGridLayout(prefs.gridSize);
				}
			}, 100); // Small delay might be needed

		} catch (error) {
			console.error('Error loading preferences from server:', error);
			// Apply default preferences if loading fails
			setTimeout(() => {
				this.#applyFilter(this.#currentFilter); // Apply default filter
				this.#applyGridLayout(this.#currentGridLayout); // Apply default grid layout
			}, 100);
		}
	}

	async #updatePreferencesOnServer(prefsToUpdate) {
		try {
			const response = await fetch('http://localhost:3000/preferences', { // Add full URL
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(prefsToUpdate),
			});

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const result = await response.json();
			console.log('Preferences updated on server:', result.preferences);

			// Update local state immediately (optional, but good practice)
			if (prefsToUpdate.filter !== undefined) {
				this.#currentFilter = prefsToUpdate.filter;
			}
			if (prefsToUpdate.gridSize !== undefined) {
				this.#currentGridLayout = prefsToUpdate.gridSize;
			}

		} catch (error) {
			console.error('Error updating preferences on server:', error);
		}
	}

	async #combineAndSaveCapturedImages() {
		if (this.#isCombiningImages || this.#capturedImages.length < this.#maxRecentImages || !this.#video) {
			console.warn('Conditions not met for combining images or already combining.');
			return;
		}
		this.#isCombiningImages = true;

		console.log('Combining and saving images...');
		const combinedCanvas = document.createElement('canvas');
		const ctx = combinedCanvas.getContext('2d');

		const videoWidth = this.#video.videoWidth;
		const videoHeight = this.#video.videoHeight;

		if (videoWidth === 0 || videoHeight === 0) {
			console.error('Video dimensions are zero, cannot combine images.');
			this.#isCombiningImages = false;
			return;
		}

		// Set combined canvas dimensions based on grid layout
		switch (this.#currentGridLayout) {
			case '1x4': // Row
				combinedCanvas.width = videoWidth * this.#maxRecentImages;
				combinedCanvas.height = videoHeight;
				break;
			case '2x2': // Grid
				combinedCanvas.width = videoWidth * 2;
				combinedCanvas.height = videoHeight * 2;
				break;
			case '4x1': // Column
				combinedCanvas.width = videoWidth;
				combinedCanvas.height = videoHeight * this.#maxRecentImages;
				break;
			default: // Default to 1x4 if layout is unknown
				combinedCanvas.width = videoWidth * this.#maxRecentImages;
				combinedCanvas.height = videoHeight;
				break;
		}

		const imageLoadPromises = this.#capturedImages.map(dataURL => {
			return new Promise((resolve, reject) => {
				const img = new Image();
				img.onload = () => resolve(img);
				img.onerror = reject;
				img.src = dataURL;
			});
		});

		try {
			const loadedImages = await Promise.all(imageLoadPromises);

			// Draw images onto the combined canvas
			loadedImages.forEach((img, index) => {
				let dx = 0, dy = 0;
				switch (this.#currentGridLayout) {
					case '1x4': // Row
						dx = index * videoWidth;
						dy = 0;
						break;
					case '2x2': // Grid
						dx = (index % 2) * videoWidth;
						dy = Math.floor(index / 2) * videoHeight;
						break;
					case '4x1': // Column
						dx = 0;
						dy = index * videoHeight;
						break;
					default:
						dx = index * videoWidth;
						dy = 0;
						break;
				}
				ctx.drawImage(img, dx, dy, videoWidth, videoHeight);
			});

			this.#saveImage(combinedCanvas); // Save the combined image
			console.log('Combined image saved.');
		} catch (error) {
			console.error('Error loading images for combining:', error);
		} finally {
			this.#isCombiningImages = false;
		}
	}

    #saveImage(canvas) {
        canvas.toBlob(blob => {
            if (blob && this.#dbimages) { // Check if image DB is ready
				console.log('Saving image to IndexedDB:', this.#dbimages);
                saveBlobToIndexedDB(blob, "Captured Image", this.#dbimages);
            } else if (!blob) {
                console.error('Failed to get blob from canvas');
            } else if (!this.#dbimages) {
				console.error('ImageDB not initialized, cannot save image.');
			}
        }, 'image/png');
    }
}
  
function saveBlobToIndexedDB(blob, name, db) {
    const transaction = db.transaction(['images'], 'readwrite');
    const store = transaction.objectStore('images');
    const id = Date.now();
  
    const imageRecord = {
        id,
        name,
        blob,
    };
  
    const addRequest = store.add(imageRecord);
  
    addRequest.onsuccess = function () {
        console.log('Image blob saved to IndexedDB with ID:', id);
    };
  
    addRequest.onerror = function (e) {
        console.error('Error saving blob to IndexedDB:', e.target.error);
    };
}