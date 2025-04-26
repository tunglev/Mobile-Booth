import { BaseComponent } from "../BaseComponent/BaseComponent.js";

export class SeeAndShareComponent extends BaseComponent {
  #container = null;
  #getPhotoButton;
  #deletePhotoButton;

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
    return this.#container;
  }

  // Creates the container element and applies the necessary classes
  #createContainer() {
    this.#container = document.createElement("div");
  }

  // Sets up the inner HTML of the container
  #setupContainerContent() {
    this.#container.innerHTML = `
        <h1>See your photos And Share them!</h1>

        <button id="getPhoto">Get Most Recent Photo</button>
        <button id="deletePhoto" disabled>Get Most Recent Photo</button>
    `;
  }

  // Attaches the event listeners for the component
  #attachEventListeners() {
    this.#getPhotoButton.addEventListener("click", () => {});

    this.#deletePhotoButton.addEventListener("click", () => {});
  }

  #initializeProperties() {
    this.#getPhotoButton = this.#container.querySelector("#getPhoto");
    this.#deletePhotoButton = this.#container.querySelector("#deletePhoto");
  }

  getContainer() {
    return this.#container;
  }

  #getPhotosFromJsonFile() {
    // fetch GET
    fetch("/photos/")
      .then((res) => res.json())
      .then((data) => {
        data.foreach((photo) => {
          const canvas = document.createElement("canvas");
          canvas.width = 300;
          canvas.height = 200;
          const ctx = canvas.getContext("2d");

          const img = new Image();
          img.onload = () =>
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          // hopefully this works
          img.src = photo.image;

          const deleteBtn = document.createElement("button");
          deleteBtn.innerText = "Delete";
          deleteBtn.onclick = () => {
            fetch(`/photos/${photo.id}`, {
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

  #deletePhotoFromJsonFile() {
    // fetch DELETE
  }
}

function drawBase64ToCanvas(base64, canvas) {
  const img = new Image();
  img.onload = () => {
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);
  };
  img.src = base64;
}
