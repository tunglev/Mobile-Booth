import { BaseComponent } from '../BaseComponent/BaseComponent.js';

export class NavbarComponent extends BaseComponent {
  #container = null;

  constructor(taskData = {}) {
    super();
    this.loadCSS('NavbarComponent');
  }

  render() {
    // Create the main container
    this.#container = document.createElement('nav');
    this.#container.classList.add('navbar');

    // Render the navbar links
    this.#container.innerHTML = `
    <a href="home.html" id="home">Home</a>
    <ul id="menu">
        <li><a href="login.html" id="login">Log In</a></li>
        <li><a href="faq.html">FAQ</a></li>
        <li><a href="about.html">About Us</a></li>
        <li><a href="feedback.html">Feedback</a></li>
        <li><a href="dynamic.html">Dynamic</a></li>
        <li><a href="settings.html">Settings</a></li>
    </ul>`;

    return this.#container;
  }
}