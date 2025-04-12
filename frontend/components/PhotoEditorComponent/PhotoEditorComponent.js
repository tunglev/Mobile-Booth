import { BaseComponent } from '../BaseComponent/BaseComponent.js';
// import { openAndGetDB } from '../WebcamPageComponent/WebcamPageComponent.js';

export class PhotoEditorComponent extends BaseComponent {
  #container = null; // Private variable to store the container element
  #dbprefs = null;
  #dbimages = null;
  #captionInput = null;
  #canvas = null;
  #saveButton = null;

  constructor() {
    super();
    this.loadCSS('PhotoEditorComponent');
    this.#initIndexedDB();
  }

  // Renders the component and returns the container element
  render() {
    if (!this.#container) {
      this.#createContainer();
      this.#setupContainerContent();
      this.#initializeProperties();
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
        <div style="margin-top: 1rem;">
          <label>Add a Caption:
            <input type="text" id="captionInput" placeholder="Enter Caption" />
            <input type="color" id="colorInput" value="#000000" />
          </label>
          <button id="addText">Add Text</button>
        </div>
        <button id="goBackToCamera">Go Back To Camera</button>
        <button id="saveInDatabase">Save Photo to Database</button>
    `;
  }

  // Attaches the event listeners for the component
  #attachEventListeners() {
    this.#container.querySelector('#addText').addEventListener('click', () => {
      const ctx = this.#canvas.getContext('2d');
      const text = this.#container.querySelector('#captionInput').value;
      const color = this.#container.querySelector('#colorInput').value;
      ctx.font = '24px sans-serif';
      ctx.fillStyle = color;
      ctx.fillText(text, 10, 380); // simple fixed position

      this.#saveCaptionPreference(text);
    });

    this.#saveButton.addEventListener('click', () => {
      this.#savePhotoToDatabase();
    })
  }

  #initializeProperties() {
    this.#captionInput = this.#container.querySelector("#captionInput");
    this.#canvas = this.#container.querySelector("#editor");
    this.#saveButton = this.#container.querySelector("#saveInDatabase");
  }

  #getAndShowPhoto() {
    this.#getMostRecentImage((record) => {
      if (record) {
        const img = new Image();
        img.src = URL.createObjectURL(record.blob);
        img.onload = () => {
          const ctx = this.#canvas.getContext('2d');
          ctx.clearRect(0, 0, this.#canvas.width, this.#canvas.height);
          ctx.drawImage(img, 0, 0, this.#canvas.width, this.#canvas.height);
        };
      }
    });
  }

  getContainer() {
    return this.#container;
  }

  #initIndexedDB() {
		const request = indexedDB.open('MobileBoothDB', 5);

		request.onerror = (event) => {
			console.error('IndexedDB error:', event.target.error);
		};

		request.onupgradeneeded = (event) => {
			console.log("upgradeneeded")
			const db = event.target.result;
			// Create an object store for user preferences if it doesn't exist
			if (!db.objectStoreNames.contains('userPreferences')) {
        console.log("created prefs db");
				db.createObjectStore('userPreferences', { keyPath: 'id' });
			} else {
        console.log("prefs db already exists");
      }
		};

		request.onsuccess = (event) => {
			this.#dbprefs = event.target.result;
			this.#loadUserPreferences();
		};
		///////////////////////////////////////////////////////
		const request2 = indexedDB.open('ImageDB', 5);

		request2.onerror = (event) => {
			console.error('IndexedDB error:', event.target.error);
		};

		request2.onupgradeneeded = (event) => {
			console.log("upgradeneeded");
			const db = event.target.result;
        // Create an object store for saved images if it doesn't exist
        if (!db.objectStoreNames.contains('images')) {
          console.log("created images db");
          db.createObjectStore('images', { keyPath: 'id' });
        } else {
          console.log("images db already exists");
        }
		};

		request2.onsuccess = (event) => {
			this.#dbimages = event.target.result;
			this.#loadUserPreferences();
		};
	}

  #saveCaptionPreference(caption) {
    if (!this.#dbprefs) return;
    const transaction = this.#dbprefs.transaction(['userPreferences'], 'readwrite');
		const store = transaction.objectStore('userPreferences');

    store.put({
			id: 'captionPreference',
			caption: caption,
		});

    transaction.onerror = (event) => {
			console.error('Error saving caption preference:', event.target.error);
		};
  }

  #loadUserPreferences() {
    if (!this.#dbprefs) {
      console.log("tried but failed to load user prefs");
      return;
    }
    console.log("Loading user prefs...");
    const transaction = this.#dbprefs.transaction(['userPreferences'], 'readonly');
		const store = transaction.objectStore('userPreferences');
    const captionRequest = store.get('captionPreference');
    captionRequest.onsuccess = (event) => {
      if (event.target.result) {
        const { caption } = event.target.result;
        setTimeout(() => {
          if (this.#container) {
            ctx.font = '24px sans-serif';
            ctx.fillStyle = color;
            ctx.fillText(caption, 10, 380); // simple fixed position
            this.#captionInput.value = caption;
          }
        }, 0);
      }
    }
  }

  #getMostRecentImage(callback) {
    const transaction = this.#dbimages.transaction("images", "readonly");
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

  // MOCKED saving photo to database
  async #savePhotoToDatabase() {
    console.log("Storing photo in fake server. Should see error following...");
    this.#canvas.toBlob(blob => {
      if (blob) {
        const response = fetch("/mock/API/", {
          method: "POST",
          body: JSON.stringify(blob),
        });
      } else {
        console.error('Failed to get blob from canvas');
      }
    }, 'image/png');
  }

}

