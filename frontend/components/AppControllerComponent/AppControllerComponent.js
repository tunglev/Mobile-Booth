import { NavbarComponent } from '../NavbarComponent/NavbarComponent.js';
import { WebcamPageComponent } from '../WebcamPageComponent/WebcamPageComponent.js';
import { Views } from './Views.js';

export class AppControllerComponent {
  #container = null; // Private container for the component
  #currentView = Views.WebcamPage; // Track the current view: 
  #navbarComponent;
  #webcamPage
//   #hub = null; // EventHub instance for managing events

  constructor() {
    this.#navbarComponent = new NavbarComponent();
    this.#webcamPage = new WebcamPageComponent();
  }

  // Render the AppController component and return the container
  render() {
    this.#createContainer();
    this.#setupContainerContent();
    this.#attachEventListeners();
    this.#navbarComponent.render();

    // Initially render the main view
    this.#renderCurrentView();

    return this.#container;
  }

  // Creates the main container element
  #createContainer() {
    this.#container = document.createElement('div');
    this.#container.classList.add('app-controller');
  }

  // Sets up the HTML structure for the container
  #setupContainerContent() {
    this.#container.innerHTML = `
      <div>THIS IS THE TOP OF THE APP CONTROLLER CONTAINER</div>
      <div id="viewContainer"></div>
    `;
  }

  // Attaches the necessary event listeners
  #attachEventListeners() {
  }

  // Toggles the view
  #toggleView() {
    
  }

  // Renders the current view based on the #currentView state
  #renderCurrentView() {
    const viewContainer = this.#container.querySelector('#viewContainer');
    viewContainer.innerHTML = ''; // Clear existing content

    viewContainer.appendChild(this.#navbarComponent.render());

    if (this.#currentView === Views.WebcamPage) {
      viewContainer.appendChild(this.#webcamPage.render());
    }
  }
}
