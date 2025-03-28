import { HomePage } from "@/pages/Home";
import { LoginPage } from "@/pages/Login";
import { Faq } from "@/pages/Faq";
import { AboutUs } from "@/pages/About";
import { BaseComponent } from "@/components/BaseComponent";
import { Navbar } from "@/components/Navbar";
import { Events, EventHub } from "@/lib/eventhub";

export default class App {
  #container: HTMLElement | null = null; // Private container for the component
  #pageContainer: HTMLElement | null = null; // Private container for the page content
  #pageComponents: Record<string, BaseComponent> = {};
  #currentPage: string = "home";
  #hub: EventHub | null = null; // EventHub instance for managing events

  constructor() {
    this.#hub = EventHub.getInstance();
    this.#hub.subscribe(Events.NavigateTo, (page: string) => this.#navigateTo(page));
    this.#pageComponents = {
      home: new HomePage(),
      login: new LoginPage(),
      faq: new Faq(),
      about: new AboutUs(),
    };
  }

  // Render the AppController component and return the container
  render() {
    this.#createContainer();
    this.#setupContainerContent();

    // Initially render the main view
    this.#renderCurrentPage();
    if (!this.#container) {
      throw new Error("Container element not found");
    }
    return this.#container;
  }
  
  // Creates the main container element
  #createContainer() {
    this.#container = document.createElement("div");
    this.#container.id = "app";
    this.#container.classList.add("app");
  }

  // Sets up the HTML structure for the container
  #setupContainerContent() {
    if (!this.#container) {
      throw new Error("Container element not found");
    }
    
    const navbar = new Navbar();
    this.#container.appendChild(navbar.render());
    
    this.#pageContainer = document.createElement("main");
    this.#pageContainer.id = "page-container";
    this.#container.appendChild(this.#pageContainer);
  }

  // Toggles the view between main and simple
  #navigateTo(page: string) {
    switch (page) {
      case "":
      case "/":
      case "/home":
        this.#currentPage = "home";
        break;
      case "/login":
        this.#currentPage = "login";
        break;
      case "/faq":
        this.#currentPage = "faq";
        break;
      case "/about":
        this.#currentPage = "about";
        break;
      default:
        this.#currentPage = "404";
    }
    this.#renderCurrentPage();
    
    // Update the URL without reloading the page
    window.history.pushState({ page }, page, window.location.origin + page);
  }

  // Renders the current view based on the #currentPage state
  #renderCurrentPage() {
    if (!this.#pageContainer) {
      throw new Error("Page container element not found");
    }
    this.#pageContainer.innerHTML = "";
    const pageComponent = this.#pageComponents[this.#currentPage];
    if (!pageComponent) {
      throw new Error(`Page component not found for view: ${this.#currentPage}`);
    }
    this.#pageContainer.appendChild(pageComponent.render());
  }
}
