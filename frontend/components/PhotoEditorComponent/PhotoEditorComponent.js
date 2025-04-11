import { BaseComponent } from '../BaseComponent/BaseComponent.js';

export class PhotoEditorComponent extends BaseComponent {
  #container = null; // Private variable to store the container element

  constructor() {
    super();
    this.loadCSS('PhotoEditorComponent');
  }

  // Renders the component and returns the container element
  render() {
    if (this.#container) {
      return this.#container;
    }
    
    this.#createContainer();
    this.#setupContainerContent();
    this.#attachEventListeners();

    return this.#container;
  }

  // Creates the container element and applies the necessary classes
  #createContainer() {
    this.#container = document.createElement('div');
  }
  
  // Sets up the inner HTML of the container
  #setupContainerContent() {
    this.#container.innerHTML = `
        <h1>Photo Editor</h1>
        <button id="goBackToCamera">Go Back To Camera</button>
    `;
  }

  // Attaches the event listeners for the component
  #attachEventListeners() {
  }


  #initializeProperties() {

  }

  getContainer() {
    return this.#container;
  }
}
