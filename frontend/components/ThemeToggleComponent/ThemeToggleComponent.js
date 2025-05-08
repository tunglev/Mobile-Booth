import { BaseComponent } from '../BaseComponent/BaseComponent.js';

export class ThemeToggleComponent extends BaseComponent {
  #themeToggleButton = null;

  constructor() {
    super();
    this.loadCSS('ThemeToggleComponent'); // Assuming a CSS file named ThemeToggleComponent.css
  }

  render() {
    this.#themeToggleButton = document.createElement('button');
    this.#themeToggleButton.id = 'theme-toggle-button-fixed';
    this.#themeToggleButton.classList.add('theme-toggle-button-fixed');
    this.#themeToggleButton.addEventListener('click', () => this.#toggleTheme());

    this.#loadTheme(); // Load saved theme on component render
    return this.#themeToggleButton;
  }

  #toggleTheme() {
    document.body.classList.toggle('dark-theme');
    if (document.body.classList.contains('dark-theme')) {
      localStorage.setItem('theme', 'dark');
      this.#themeToggleButton.textContent = '☀️'; // Sun icon for dark mode
    } else {
      localStorage.setItem('theme', 'light');
      this.#themeToggleButton.textContent = '🌓'; // Moon icon for light mode
    }
  }

  #loadTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.body.classList.add('dark-theme');
      this.#themeToggleButton.textContent = '☀️';
    } else {
      document.body.classList.remove('dark-theme'); // Default to light
      this.#themeToggleButton.textContent = '🌓';
    }
  }
}
