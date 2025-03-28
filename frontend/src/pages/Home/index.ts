import { BaseComponent } from "@/components/BaseComponent";
import { EventHub } from "@/lib/eventhub/EventHub.js";
import { Events } from "@/lib/eventhub/Events.js";
import { TaskData } from "@/lib/models/task";
import { TaskInputComponent } from "@/components/TaskInputComponent";
import { TaskListComponent } from "@/components/TaskListComponent";
import { WebcamComponent } from "@/components/WebcamComponent";

export class HomePage extends BaseComponent {
  #container: HTMLElement | null = null;
  #taskInput: TaskInputComponent;
  #taskList: TaskListComponent;
  #webcam: WebcamComponent;

  constructor() {
    super();
    this.loadCSS("src/pages/Home", "styles");
    this.#taskInput = new TaskInputComponent();
    this.#taskList = new TaskListComponent();
    this.#webcam = new WebcamComponent();
  }

  render() {
    if (this.#container) {
      return this.#container;
    }

    this.#container = document.createElement("div");
    this.#container.classList.add("task-page");
    this.#setupContainerContent();
    this.#attachEventListeners();

    return this.#container;
  }

  #setupContainerContent() {
    if (!this.#container) return;
    
    // Create a header section
    const header = document.createElement("header");
    header.innerHTML = `<h1>Mobile Booth</h1>`;
    
    // Create main content section
    const mainContent = document.createElement("main");
    
    // Create a container for the webcam
    const webcamSection = document.createElement("section");
    webcamSection.classList.add("webcam-section");
    webcamSection.appendChild(this.#webcam.render());
    
    // Add components to the main content
    mainContent.appendChild(webcamSection);
    
    // Add sections to container
    this.#container.appendChild(header);
    this.#container.appendChild(mainContent);
  }

  #attachEventListeners() {
    const hub = EventHub.getInstance();
    
    // Subscribe to relevant events if needed
    hub.subscribe(Events.TasksLoaded, (tasks: TaskData[]) => {
      this.setTasks(tasks);
    });
    
    // Subscribe to image capture event
    hub.subscribe(Events.ImageCaptured, (imageDataURL: string) => {
      this.#displayCapturedImage(imageDataURL);
    });
  }

  // Method to set initial tasks (if needed)
  setTasks(tasks: TaskData[]) {
    tasks.forEach(task => {
      const hub = EventHub.getInstance();
      hub.publish(Events.NewTask, task);
    });
  }
  
  // Display the captured image
  #displayCapturedImage(imageDataURL: string) {
    if (!this.#container) return;
    
    // Find or create the image preview container
    let imagePreview = this.#container.querySelector(".image-preview");
    if (!imagePreview) {
      imagePreview = document.createElement("div");
      imagePreview.classList.add("image-preview");
      
      const webcamSection = this.#container.querySelector(".webcam-section");
      if (webcamSection) {
        webcamSection.appendChild(imagePreview);
      }
    }
    
    // Clear previous previews
    imagePreview.innerHTML = "";
    
    // Create and display the image
    const img = document.createElement("img");
    img.src = imageDataURL;
    img.classList.add("captured-image");
    imagePreview.appendChild(img);
  }
}