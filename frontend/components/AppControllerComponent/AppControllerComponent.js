import { NavbarComponent } from '../NavbarComponent/NavbarComponent.js';
import { PhotoEditorComponent } from '../PhotoEditorComponent/PhotoEditorComponent.js';
import { SeeAndShareComponent } from '../SeeAndShareComponent/SeeAndShareComponent.js';
import { WebcamPageComponent } from '../WebcamPageComponent/WebcamPageComponent.js';
import { Views, ViewArr } from './Views.js';

export class AppControllerComponent {
  #container = null; // Private container for the component
  #currentView = Views.WebcamPage; // Track the current view. Default is webcam page.
  #navbarComponent;
  #webcamPage;
  #photoEditPage;
  #seeAndSharePage;
  
  #finalizeListenerSet = false;
  #backToCameraListenerSet = false;
  #seeAndShareListenerSet = false;
  #backToPhotoEditorListenerSet = false;
//   #hub = null; // EventHub instance for managing events

  constructor() {
    this.#navbarComponent = new NavbarComponent();
    this.#webcamPage = new WebcamPageComponent();
    this.#photoEditPage = new PhotoEditorComponent();
    this.#seeAndSharePage = new SeeAndShareComponent();
  }

  // Render the AppController component and return the container
  render() {
    this.#createContainer();
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
    if (finalizePhoto && !this.#finalizeListenerSet) {
      finalizePhoto.addEventListener("click", () => {
        this.#currentView = Views.PhotoEditPage;
        this.#renderCurrentView();
        this.#finalizeListenerSet = true; //so we don't keep adding event listeners
        this.#attachEventListeners();
      })
    }

    const goBackToCamera = this.#container.querySelector("#goBackToCamera");
    if (goBackToCamera && !this.#backToCameraListenerSet) {
      goBackToCamera.addEventListener("click", () => {
        this.#currentView = Views.WebcamPage;
        this.#renderCurrentView();
        this.#backToCameraListenerSet = true; //so we don't keep adding event listeners
        this.#attachEventListeners();
      })
    }

    const seeAndShare = this.#container.querySelector("#seeAndShare");
    if (seeAndShare && !this.#seeAndShareListenerSet) {
      seeAndShare.addEventListener("click", () => {
        this.#currentView = Views.SeeAndSharePage;
        this.#renderCurrentView();
        this.#seeAndShareListenerSet = true; //so we don't keep adding event listeners
        this.#attachEventListeners();
      })
    }

    const backToPhotoEditor = this.#container.querySelector("#backToPhotoEditor");
    if (backToPhotoEditor && !this.#backToPhotoEditorListenerSet) {
      backToPhotoEditor.addEventListener("click", () => {
        console.log("back to photo editor");
        this.#currentView = Views.PhotoEditPage;
        this.#renderCurrentView();
        this.#backToPhotoEditorListenerSet = true; //so we don't keep adding event listeners
        this.#attachEventListeners();
      })
    }
  }

  // Toggles the view
  #toggleView() {
    
  }

  // Renders the current view based on the #currentView state
  #renderCurrentView() {
    this.#container.innerHTML = "";
    this.#setupContainerContent();
    const viewContainer = this.#container.querySelector('#viewContainer');
    viewContainer.innerHTML = ""; // Clear existing content

    viewContainer.appendChild(this.#navbarComponent.render());

    if (this.#currentView === Views.WebcamPage) {
      viewContainer.appendChild(this.#webcamPage.render());
    } else if (this.#currentView === Views.PhotoEditPage) {
      viewContainer.appendChild(this.#photoEditPage.render());
    } else if (this.#currentView === Views.SeeAndSharePage) {
      viewContainer.appendChild(this.#seeAndSharePage.render());
    }
  }
}

