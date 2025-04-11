import { NavbarComponent } from '../NavbarComponent/NavbarComponent.js';
import { PhotoEditorComponent } from '../PhotoEditorComponent/PhotoEditorComponent.js';
import { WebcamPageComponent } from '../WebcamPageComponent/WebcamPageComponent.js';
import { Views, ViewArr } from './Views.js';

export class AppControllerComponent {
  #container = null; // Private container for the component
  #currentView = Views.WebcamPage; // Track the current view. Default is webcam page.
  #navbarComponent;
  #webcamPage;
  #photoEditPage;
//   #hub = null; // EventHub instance for managing events

  constructor() {
    this.#navbarComponent = new NavbarComponent();
    this.#webcamPage = new WebcamPageComponent();
    this.#photoEditPage = new PhotoEditorComponent();
  }

  // Render the AppController component and return the container
  render() {
    this.#createContainer();
    this.#setupContainerContent();
    this.#navbarComponent.render();

    // Initially render the main view
    this.#renderCurrentView();

    this.#attachEventListeners();

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
      <div id="viewContainer"></div>
    `;
  }

  // Attaches the necessary event listeners
  #attachEventListeners() {
    const finalizePhoto = this.#container.querySelector("#finalizePhoto");
    if (finalizePhoto) {
      finalizePhoto.addEventListener("click", () => {
        this.#currentView = Views.PhotoEditPage;
        this.#renderCurrentView();
      })
    }
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
    } else if (this.#currentView === Views.PhotoEditPage) {
      viewContainer.appendChild(this.#photoEditPage.render());
    } else {
    }
  }
}
