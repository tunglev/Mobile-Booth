import { BaseComponent } from "@/components/BaseComponent";
import { Events, EventHub } from "@/lib/eventhub";
import "./Feedback.css";

export class Feedback extends BaseComponent {
  #container: HTMLElement | null = null;

  constructor() {
    super();
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
        <h2>Feedback Form</h2>
        <form class="feedback-form">
          <div class="form-group">
            <input type="text" placeholder="Your Name" class="form-input">
          </div>
          <div class="form-group">
            <input type="email" placeholder="Your Email" class="form-input">
          </div>
          <div class="form-group">
            <textarea placeholder="Your Feedback" class="form-textarea" rows="5"></textarea>
          </div>
          <button type="button" class="submit-button">Submit Feedback</button>
        </form>
      </div>
    `;
  }

  #attachEventListeners() {
    if (!this.#container) return;
  }
}
