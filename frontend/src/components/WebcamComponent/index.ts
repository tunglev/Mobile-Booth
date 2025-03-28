import { BaseComponent } from "@/components/BaseComponent";
import { Events, EventHub } from "@/lib/eventhub";
import { SelectComponent, SelectOption } from "@/components/SelectComponent";

export class WebcamComponent extends BaseComponent {
  #container: HTMLElement | null = null;
  #video: HTMLVideoElement | null = null;
  #stream: MediaStream | null = null;
  #isActive: boolean = false;
  #filterSelect: SelectComponent | null = null;
  #currentFilter: string = "none";

  constructor() {
    super();
    this.loadCSS("src/components/WebcamComponent", "styles");
  }

  render() {
    if (this.#container) {
      return this.#container;
    }

    this.#container = document.createElement("div");
    this.#container.classList.add("webcam-container");
    this.#setupContainerContent();
    this.#attachEventListeners();

    return this.#container;
  }

  #setupContainerContent() {
    if (!this.#container) return;
    
    // Create video element
    this.#video = document.createElement("video");
    this.#video.classList.add("webcam-video");
    this.#video.autoplay = true;
    this.#video.playsInline = true;
    
    // Create filter select component
    const filterOptions: SelectOption[] = [
      { value: "none", label: "No Filter" },
      { value: "grayscale", label: "Grayscale" },
      { value: "sepia", label: "Sepia" },
      { value: "invert", label: "Invert" },
      { value: "blur", label: "Blur" },
      { value: "brightness", label: "Brightness" }
    ];
    
    this.#filterSelect = new SelectComponent(filterOptions, "Filter");
    this.#filterSelect.setOnChange((option: SelectOption) => {
      this.#applyFilter(option.value);
    });
    
    // Create controls
    const controls = document.createElement("div");
    controls.classList.add("webcam-controls");
    
    const startButton = document.createElement("button");
    startButton.id = "startWebcam";
    startButton.innerText = "Start Camera";
    
    const captureButton = document.createElement("button");
    captureButton.id = "captureImage";
    captureButton.innerText = "Take Photo";
    captureButton.disabled = true;
    
    controls.appendChild(startButton);
    controls.appendChild(captureButton);
    
    // Create filter container
    const filterContainer = document.createElement("div");
    filterContainer.classList.add("filter-container");
    filterContainer.appendChild(this.#filterSelect.render());
    
    // Add elements to container
    this.#container.appendChild(this.#video);
    this.#container.appendChild(filterContainer);
    this.#container.appendChild(controls);
  }

  #attachEventListeners() {
    if (!this.#container) return;
    
    const startButton = this.#container.querySelector("#startWebcam");
    const captureButton = this.#container.querySelector("#captureImage");
    
    startButton?.addEventListener("click", () => this.#toggleWebcam());
    captureButton?.addEventListener("click", () => this.#captureImage());
  }

  async #toggleWebcam() {
    const startButton = this.#container?.querySelector("#startWebcam");
    const captureButton = this.#container?.querySelector("#captureImage");
    
    if (!this.#isActive) {
      try {
        this.#stream = await navigator.mediaDevices.getUserMedia({ 
          video: true,
          audio: false
        });
        
        if (this.#video && this.#stream) {
          this.#video.srcObject = this.#stream;
          this.#isActive = true;
          if (startButton) startButton.textContent = "Stop Camera";
          if (captureButton) (captureButton as HTMLButtonElement).disabled = false;
        }
      } catch (error) {
        console.error("Error accessing webcam:", error);
        alert("Could not access the camera. Please ensure it is connected and permissions are granted.");
      }
    } else {
      this.#stopWebcam();
      if (startButton) startButton.textContent = "Start Camera";
      if (captureButton) (captureButton as HTMLButtonElement).disabled = true;
    }
  }

  #stopWebcam() {
    if (this.#stream) {
      this.#stream.getTracks().forEach(track => track.stop());
      this.#stream = null;
    }
    
    if (this.#video) {
      this.#video.srcObject = null;
    }
    
    this.#isActive = false;
  }
  
  #applyFilter(filter: string) {
    if (!this.#video) return;
    
    this.#currentFilter = filter;
    
    // Reset filters
    this.#video.style.filter = "";
    
    // Apply the selected filter
    switch (filter) {
      case "grayscale":
        this.#video.style.filter = "grayscale(100%)";
        break;
      case "sepia":
        this.#video.style.filter = "sepia(100%)";
        break;
      case "invert":
        this.#video.style.filter = "invert(100%)";
        break;
      case "blur":
        this.#video.style.filter = "blur(5px)";
        break;
      case "brightness":
        this.#video.style.filter = "brightness(150%)";
        break;
    }
  }

  #captureImage() {
    if (!this.#video || !this.#isActive) return;
    
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    
    // Set canvas dimensions to match video
    canvas.width = this.#video.videoWidth;
    canvas.height = this.#video.videoHeight;
    
    // Draw the current video frame to the canvas
    if (context) {
      context.drawImage(this.#video, 0, 0, canvas.width, canvas.height);
      
      // Apply filter to canvas if needed
      if (this.#currentFilter !== "none") {
        context.filter = this.#video.style.filter;
        context.drawImage(canvas, 0, 0);
        context.filter = "none";
      }
      
      // Convert canvas to data URL
      const imageDataURL = canvas.toDataURL("image/png");
      
      // Dispatch event with the captured image
      const hub = EventHub.getInstance();
      hub.publish(Events.ImageCaptured, imageDataURL);
    }
  }

  // Clean up resources when component is removed
  cleanup() {
    this.#stopWebcam();
  }
} 