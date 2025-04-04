import { AppControllerComponent } from '../components/AppControllerComponent/AppControllerComponent.js';

console.log("")

// Create an instance of AppControllerComponent
// Right now, it ONLY adds the navbar.
const appController = new AppControllerComponent();

// Render the component in the #app container
const appContainer = document.getElementById('app');
appContainer.appendChild(appController.render());