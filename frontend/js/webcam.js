// DOM Elements
const video = document.getElementById('webcam-video');
const startButton = document.getElementById('startWebcam');
const captureButton = document.getElementById('captureImage');
const finalizeButton = document.getElementById('finalizePhoto');
const imagePreview = document.getElementById('image-preview');
const filterSelect = document.getElementById('filter-select');
const filterOptions = document.getElementById('filter-options');

// Variables
let stream = null;
let isActive = false;
let currentFilter = 'none';

// Event Listeners
startButton.addEventListener('click', toggleWebcam);
captureButton.addEventListener('click', captureImage);
filterSelect.addEventListener('click', toggleFilterOptions);

// Select each filter option
const options = document.querySelectorAll('.select-option');
options.forEach((option) => {
	option.addEventListener('click', () => {
		// Update selected class
		options.forEach((opt) => opt.classList.remove('selected'));
		option.classList.add('selected');

		// Update display text
		filterSelect.querySelector('.select-value').textContent = option.textContent;

		// Apply filter
		const filter = option.getAttribute('data-value');
		applyFilter(filter);

		// Close dropdown
		filterOptions.classList.remove('active');
		filterSelect.classList.remove('active');
	});
});

// Toggle webcam function
async function toggleWebcam() {
    console.log('toggleWebcam');
	if (!isActive) {
		try {
			stream = await navigator.mediaDevices.getUserMedia({
				video: true,
				audio: false,
			});

			video.srcObject = stream;
			isActive = true;
			startButton.textContent = 'Stop Camera';
			captureButton.disabled = false;
		} catch (error) {
			console.error('Error accessing webcam:', error);
			alert('Could not access the camera. Please ensure it is connected and permissions are granted.');
		}
	} else {
		stopWebcam();
		startButton.textContent = 'Start Camera';
		captureButton.disabled = true;
	}
}

// Stop webcam function
function stopWebcam() {
	if (stream) {
		stream.getTracks().forEach((track) => track.stop());
		stream = null;
	}

	video.srcObject = null;
	isActive = false;
}

// Toggle filter dropdown
function toggleFilterOptions() {
	filterOptions.classList.toggle('active');
	filterSelect.classList.toggle('active');
}

// Apply filter function
function applyFilter(filter) {
	currentFilter = filter;

	// Reset filter
	video.style.filter = '';

	// Apply selected filter
	switch (filter) {
		case 'grayscale':
			video.style.filter = 'grayscale(100%)';
			break;
		case 'sepia':
			video.style.filter = 'sepia(100%)';
			break;
		case 'invert':
			video.style.filter = 'invert(100%)';
			break;
		case 'blur':
			video.style.filter = 'blur(5px)';
			break;
		case 'brightness':
			video.style.filter = 'brightness(150%)';
			break;
	}
}

// Capture image function
function captureImage() {
	if (!isActive) return;
	finalizeButton.disabled = false;

	const canvas = document.createElement('canvas');
	const context = canvas.getContext('2d');

	// Set canvas dimensions to match video
	canvas.width = video.videoWidth;
	canvas.height = video.videoHeight;

	// Draw current video frame to canvas
	if (context) {
		context.drawImage(video, 0, 0, canvas.width, canvas.height);

		// Apply filter to canvas if needed
		if (currentFilter !== 'none') {
			context.filter = video.style.filter;
			context.drawImage(canvas, 0, 0);
			context.filter = 'none';
		}

		// Convert canvas to data URL
		const imageDataURL = canvas.toDataURL('image/png');

		// Display the captured image
		displayCapturedImage(imageDataURL);
	}
}

// If we ever make a "clear photo" button, set finalizedButton.disabled to true

// Display captured image
function displayCapturedImage(imageDataURL) {
	// Clear previous previews
	imagePreview.innerHTML = '';

	// Create and display the image
	const img = document.createElement('img');
	img.src = imageDataURL;
	img.classList.add('captured-image');
	imagePreview.appendChild(img);
}

// Handle page unload
window.addEventListener('beforeunload', () => {
	if (stream) {
		stream.getTracks().forEach((track) => track.stop());
	}
});
