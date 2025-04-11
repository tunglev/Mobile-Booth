import { BaseComponent } from '../BaseComponent/BaseComponent.js';
// import { openAndGetDB } from '../WebcamPageComponent/WebcamPageComponent.js';

let db;
const request1 = indexedDB.open('ImageDB', 1);
request1.onupgradeneeded = function (event) {
    db = event.target.result;
    db.createObjectStore('images', { keyPath: 'id' });
};
request1.onsuccess = function (event) {
    db = event.target.result;
};
request1.onerror = function () {
    console.error('Failed to open IndexedDB');
};

export class PhotoEditorComponent extends BaseComponent {
  #container = null; // Private variable to store the container element
  #photo = null;

  constructor() {
    super();
    this.loadCSS('PhotoEditorComponent');
  }

  // Renders the component and returns the container element
  render() {
    if (!this.#container) {
      this.#createContainer();
      this.#setupContainerContent();
      this.#attachEventListeners();
    }
    this.#getAndShowPhoto();
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
        <canvas id="editor" width="600" height="400"></canvas>
        <button id="goBackToCamera">Go Back To Camera</button>
    `;
  }

  // Attaches the event listeners for the component
  #attachEventListeners() {
  }


  #initializeProperties() {
  }

  #getAndShowPhoto() {
    getMostRecentImage((record) => {
      if (record) {
        const img = new Image();
        img.src = URL.createObjectURL(record.blob);
        img.onload = () => {
          const canvas = this.#container.querySelector('#editor');
          const ctx = canvas.getContext('2d');
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        };
      }
    });
  }

  getContainer() {
    return this.#container;
  }
}

async function getMostRecentImage(callback) {
  const transaction = db.transaction("images", "readonly");
  const objectStore = transaction.objectStore("images");
  const request = objectStore.openKeyCursor(null, "prev");

  request.onsuccess = (event) => {
    const cursor = event.target.result;

    if (cursor) { 
      const mostRecentKey = cursor.primaryKey;
      console.log("Most recent key:", mostRecentKey);

      const getRequest = objectStore.get(mostRecentKey);

      getRequest.onsuccess = () => {
        callback(getRequest.result);
      };
      getRequest.onerror = (e) => {
        console.error('Error getting image record:', e.target.error);
      };
    } else {
      console.log("No images found");
    }
  };

  request.onerror = (e) => {
    console.error('Error opening key cursor:', e.target.error);
  };
}