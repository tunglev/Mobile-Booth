import { BaseComponent } from "@/components/BaseComponent";
import { Events, EventHub } from "@/lib/eventhub";
import "./LoginPage.css";

export class LoginPage extends BaseComponent {
  #container: HTMLElement | null = null;

  constructor() {
    super();
    // this.loadCSS("LoginPage");
  }

  render() {
    if (this.#container) {
      return this.#container;
    }

    this.#container = document.createElement("div");
    this.#container.classList.add("login-page");
    this.#setupContainerContent();
    this.#attachEventListeners();

    return this.#container;
  }

  #setupContainerContent() {
    if (!this.#container) return;
    this.#container.innerHTML = `
      <div class="login-container">
        <h1>Authenticate</h1>
        <p>Please sign into Google to continue.</p>
        <button id="sign-in-button">Sign In</button>
      </div>
    `;
  }

  #attachEventListeners() {
    if (!this.#container) return;
  }
}
