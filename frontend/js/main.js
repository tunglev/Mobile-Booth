import { AppControllerComponent } from '../components/AppControllerComponent/AppControllerComponent.js';
import { ThemeToggleComponent } from '../components/ThemeToggleComponent/ThemeToggleComponent.js';

// Create an instance of AppControllerComponent
const appController = new AppControllerComponent();

// Render the AppController in the #app container
const appContainer = document.getElementById('app');
appContainer.appendChild(appController.render());

// Create and render the ThemeToggleComponent
const themeToggle = new ThemeToggleComponent();
document.body.appendChild(themeToggle.render()); // Append to body to ensure it's outside other main containers