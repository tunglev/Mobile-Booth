document.addEventListener('DOMContentLoaded', function () {
	const screens = document.querySelectorAll('.screen');
	const prevBtn = document.getElementById('prevBtn');
	const nextBtn = document.getElementById('nextBtn');
	const dots = document.querySelectorAll('.dot');

	let currentScreen = 1;
	const totalScreens = screens.length;

	function updateScreen() {
		// Hide all screens
		screens.forEach((screen) => screen.classList.remove('active'));

		// Show current screen
		document.getElementById(`screen${currentScreen}`).classList.add('active');

		// Update dots
		dots.forEach((dot) => dot.classList.remove('active'));
		dots[currentScreen - 1].classList.add('active');

		// Update buttons
		prevBtn.disabled = currentScreen === 1;
		nextBtn.disabled = currentScreen === totalScreens;

		// Update button text on last screen
		if (currentScreen === totalScreens) {
			nextBtn.textContent = 'Finish';
		} else {
			nextBtn.textContent = 'Next';
		}
	}

	// Button click handlers
	prevBtn.addEventListener('click', function () {
		if (currentScreen > 1) {
			currentScreen--;
			updateScreen();
		}
	});

	nextBtn.addEventListener('click', function () {
		if (currentScreen < totalScreens) {
			currentScreen++;
			updateScreen();
		}
	});

	// Dot click handlers
	dots.forEach((dot) => {
		dot.addEventListener('click', function () {
			currentScreen = parseInt(this.dataset.screen);
			updateScreen();
		});
	});
});
