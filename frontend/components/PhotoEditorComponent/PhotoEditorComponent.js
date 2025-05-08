import { BaseComponent } from '../BaseComponent/BaseComponent.js';
// import { openAndGetDB } from '../WebcamPageComponent/WebcamPageComponent.js';

export class PhotoEditorComponent extends BaseComponent {
  #container = null; 
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
        <div id="controlsPanel" class="controls-panel">
          <div style="margin-top: 1rem;">
            <label>Add a Caption:
              <input type="text" id="captionInput" placeholder="Enter Caption" />
              <input type="color" id="colorInput" value="#000000" />
            </label>
            <button id="addText">Add Text</button>
          </div>
          <button id="goBackToCamera">Go Back To Camera</button>
          <button id="saveInDatabase">Save Photo to Database</button>
          <button id="seeAndShare">See and Share Your Photos</button>
        </div>
    `;
  }

  // Attaches the event listeners for the component
  #attachEventListeners() {
    this.#container.querySelector('#addText').addEventListener('click', () => {
      const ctx = this.#canvas.getContext('2d');
      const text = this.#container.querySelector('#captionInput').value;
      const color = this.#container.querySelector('#colorInput').value;

      // Redraw the image first to clear previous text
      this.#getMostRecentImage((record) => {
        if (record && record.blob) {
          const img = new Image();
          img.onload = () => {
            // Ensure canvas dimensions match the image to avoid distortion
            // This might already be handled by #getAndShowPhoto, but good to be sure
            // or if the image aspect ratio is critical for text placement.
            // If #getAndShowPhoto always sets canvas to image dimensions, this might be redundant.
            // For now, let's assume it's good practice to ensure it here too.
            this.#canvas.width = img.width;
            this.#canvas.height = img.height;
            ctx.clearRect(0, 0, this.#canvas.width, this.#canvas.height); // Clear canvas
            ctx.drawImage(img, 0, 0, this.#canvas.width, this.#canvas.height); // Redraw image

            // Add new text
            ctx.font = '24px sans-serif';
            ctx.fillStyle = color;
            // Position text at the bottom-left with a margin
            const margin = 10; // Define a margin from the edge
            ctx.fillText(text, margin, this.#canvas.height - margin);

            this.#saveCaptionPreference(text);
          };
          img.onerror = () => {
            console.error("Error loading image from blob for adding text.");
            // Fallback: if image can't be redrawn, just draw text (might draw over old text)
            // Or, clear and draw text on blank canvas if preferred
            ctx.clearRect(0, 0, this.#canvas.width, this.#canvas.height); // Clear canvas
            ctx.font = '24px sans-serif';
            ctx.fillStyle = color;
            const margin = 10;
            ctx.fillText(text, margin, this.#canvas.height - margin);
            this.#saveCaptionPreference(text);
          };
          img.src = URL.createObjectURL(record.blob);
        } else {
          // If no image, just draw text on blank canvas (or handle as error)
          console.log("No image to draw text on, drawing on blank canvas.");
          ctx.clearRect(0, 0, this.#canvas.width, this.#canvas.height); // Clear canvas
          ctx.font = '24px sans-serif';
          ctx.fillStyle = color;
          const margin = 10;
          ctx.fillText(text, margin, this.#canvas.height - margin);
          this.#saveCaptionPreference(text);
        }
      });
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
      if (record && record.blob) { // Ensure record and blob exist
        const img = new Image();
        img.onload = () => {
          const ctx = this.#canvas.getContext('2d');
          // Adjust canvas to the aspect ratio of the incoming image
          this.#canvas.width = img.width;
          this.#canvas.height = img.height;
          ctx.clearRect(0, 0, this.#canvas.width, this.#canvas.height);
          ctx.drawImage(img, 0, 0, this.#canvas.width, this.#canvas.height);
        };
        img.onerror = () => {
          console.error("Error loading image from blob.");
          // Optionally, display a placeholder or error message on the canvas
        };
        img.src = URL.createObjectURL(record.blob);
      } else {
        console.log("No recent image record found or blob is missing.");
        // Optionally, display a placeholder or error message on the canvas
        const ctx = this.#canvas.getContext('2d');
        ctx.clearRect(0, 0, this.#canvas.width, this.#canvas.height);
        ctx.font = '16px sans-serif';
        ctx.fillStyle = 'gray';
        ctx.textAlign = 'center';
        ctx.fillText('No image to display. Please capture an image first.', this.#canvas.width / 2, this.#canvas.height / 2);
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
      console.log("tried but failed to load user prefs because dbprefs is not initialized");
      return;
    }
    console.log("Loading user prefs...");
    const transaction = this.#dbprefs.transaction(['userPreferences'], 'readonly');
		const store = transaction.objectStore('userPreferences');
    const captionRequest = store.get('captionPreference');
    captionRequest.onsuccess = (event) => {
      if (event.target.result) {
        const { caption } = event.target.result;
        // Apply caption to the input field, not directly to canvas here
        // The actual drawing of text onto canvas happens on 'Add Text' button click
        if (this.#captionInput) {
            this.#captionInput.value = caption;
        }
      }
    }
    captionRequest.onerror = (event) => {
        console.error('Error loading caption preference:', event.target.error);
    };
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

  // saving photo to json
  async #savePhotoToJSON() {
    console.log("Saving photo to json file");

    // No need to shrink further if the combined image is already appropriately sized.
    // If shrinking is still desired, ensure shrinkCanvas handles it correctly.
    // const smallerCanvas = shrinkCanvas(this.#canvas, 0.5); 
    const base64 = this.#canvas.toDataURL("image/jpeg", 0.8); // Use a reasonable quality

    fetch("/photos/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ image: base64 }),
    })
    .then(res => res.json(), (err) => console.log("json didn't work"))
    .then(data => {
      console.log("Image uploaded!")
      alert("Successfully uploaded photo!")
    })
    .catch(err => {
      console.log("Error uploading image:");
      console.error(err);
      alert("Error: failed to upload photo");
    });
  }

  // async #savePhotoToDatabase() {
  //   console.log("Saving photo to database");
  //   this.#canvas.toBlob((blob) => {
  //     if (!blob) {
  //       console.error("Failed to generate image blob");
  //       alert("Error: couldn't generate image");
  //       return;
  //     }

  //     const formData = new FormData();
  //     formData.append("image", blob, "photo.jpg");

  //     fetch("/photos/", {
  //       method: "POST",
  //       body: formData, // no need to set Content-Type manually for FormData
  //     })
  //     .then(res => res.json(), (err) => console.err(err))
  //     .then(data => {
  //       console.log("Image uploaded!");
  //       alert("Successfully uploaded photo to database!");
  //     })
  //     .catch(err => {
  //       console.error("Error uploading image:", err);
  //       alert("Error: failed to upload photo to database");
  //     });
  //   }, "image/jpeg", 0.5);
  // }

  async #savePhotoToDatabase() {
    console.log("Saving photo to database");

    // old JSON version
    const base64 = this.#canvas.toDataURL("image/jpeg", 0.5);

    fetch("/photos/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ image: base64 }),
    })
    .then(res => res.json(), (err) => console.err(err))
    .then(data => {
      console.log("Image uploaded to database!")
      alert("Successfully uploaded photo!")
    })
    .catch(err => {
      console.log("Error uploading image:");
      console.error(err);
      alert("Error: failed to upload photo");
    });
  }
}


function shrinkCanvas(originalCanvas, scale = 0.5) {
  const tmpCanvas = document.createElement('canvas');
  tmpCanvas.width = originalCanvas.width * scale;
  tmpCanvas.height = originalCanvas.height * scale;
  const ctx = tmpCanvas.getContext('2d');
  ctx.drawImage(originalCanvas, 0, 0, tmpCanvas.width, tmpCanvas.height);
  return tmpCanvas;
}