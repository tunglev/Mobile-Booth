import { BaseComponent } from "../BaseComponent/BaseComponent.js";

export class SeeAndShareComponent extends BaseComponent {
  #container = null;
//   #getPhotoButton;
//   #deletePhotoButton;

  constructor() {
    super();
    this.loadCSS("SeeAndShareComponent");
  }

  // Renders the component and returns the container element
  render() {
    if (!this.#container) {
      this.#createContainer();
      this.#setupContainerContent();
      this.#initializeProperties();
      this.#attachEventListeners();
    }
    this.#getPhotosFromDatabase();
    return this.#container;
  }

  // Creates the container element and applies the necessary classes
  #createContainer() {
    this.#container = document.createElement("div");
  }

  // Sets up the inner HTML of the container
  #setupContainerContent() {
    this.#container.innerHTML = `
        <h1>Manage your photos. (Sharing coming soon!)</h1>
        <button id="backToPhotoEditor">Go back to Photo Editor</button>
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

  #getPhotosFromDatabase() {
    // fetch GET
    fetch("/photos/", { method: "GET" })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        data.forEach((photo) => {
          console.log("photo:", photo);
          const canvas = document.createElement("canvas");
          canvas.width = 300;
          canvas.height = 200;
          const ctx = canvas.getContext("2d");

          const img = new Image();
          img.onload = () =>
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          // hopefully this works
          img.src = photo.photo;

          const deleteBtn = document.createElement("button");
          deleteBtn.innerText = "Delete";
          deleteBtn.onclick = () => {
            fetch(`/photos/${photo.photoid}`, {
              method: "DELETE",
            })
              .then((res) => {
                if (!res.ok) throw new Error("SMTH WENT WRONG WITH DELETE");
                canvas.remove();
                deleteBtn.remove();
              })
              .catch((err) => console.error("ERROR DELETING PHOTO:", err));
          };
          this.#container.appendChild(canvas);
          this.#container.appendChild(deleteBtn);
        });
      });
  }
}