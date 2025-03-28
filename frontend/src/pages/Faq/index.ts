import { BaseComponent } from "@/components/BaseComponent";
import { Events, EventHub } from "@/lib/eventhub";
import "./Faq.css";

export class Faq extends BaseComponent {
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
        <h2>Where Do I start?</h2> 
        <div>
            <!-- Add questions here; maybe in later version, questions populated from a 
                list of questions and answers stored somewhere else, then added here through js/ts-->
        </div>
        <h2>Custom Backgrounds</h2> 
        <div>
            <!-- Add questions here; maybe in later version, questions populated from a 
                list of questions and answers stored somewhere else, then added here through js/ts-->
        </div>
        <h2>Advanced Features</h2> 
        <div>
            <!-- Add questions here; maybe in later version, questions populated from a 
                list of questions and answers stored somewhere else, then added here through js/ts-->
        </div>
      </div>
    `;
  }

  #attachEventListeners() {
    if (!this.#container) return;
  }
}
