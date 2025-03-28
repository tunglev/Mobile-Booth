import { BaseComponent } from "@/components/BaseComponent";
import { Events, EventHub } from "@/lib/eventhub";
import "./About.css";

export class AboutUs extends BaseComponent {
  #container: HTMLElement | null = null;

  constructor() {
    super();
    // this.loadCSS("About.css");
    // this.loadCSS("LoginPage");
  }

  render() {
    if (this.#container) {
      return this.#container;
    }

    this.#container = document.createElement("div");
    this.#container.classList.add("about-page");
    this.#setupContainerContent();
    this.#attachEventListeners();

    return this.#container;
  }

  #setupContainerContent() {
    if (!this.#container) return;
    this.#container.innerHTML = `
      <div class="about-container">
        <div id="Jack" class="about-card">
            <h3>Jack Hudson</h3>
            <img href="" alt="Picture of Jack">
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
        </div>

        <div id="Tung" class="about-card">
            <h3>Tung Le</h3>
            <img href="" alt="Picture of Tung">
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
        </div>

        <div id="Basim" class="about-card">
            <h3>Basim Majid</h3>
            <img href="" alt="Picture of Basim">
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
        </div>

        <div id="Mihir" class="about-card">
            <h3>Mihir Nagarkatti</h3>
            <img href="" alt="Picture of Mihir">
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
        </div>
      </div>
    `;
  }

  #attachEventListeners() {
    if (!this.#container) return;
  }
}
