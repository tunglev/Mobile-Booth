import { BaseComponent } from '../BaseComponent/BaseComponent.js';

export class SettingsComponent extends BaseComponent {
    #container = null;

    constructor() {
        super();
        this.loadCSS('SettingsComponent');
    }

    render() {
        this.#container = document.createElement('div');
        this.#container.classList.add('settings-component');

        this.#container.innerHTML = `
            <div class="settings-container">
                <h2>User Settings</h2>
                <form id="settingsForm" class="settings-form">
                    <!-- Username -->
                    <div class="form-group">
                        <label for="username">Username:</label>
                        <input type="text" id="username" name="username" placeholder="Enter your username" class="form-input">
                        <div class="validation-message" data-for="username"></div>
                    </div>

                    <!-- Theme -->
                    <div class="form-group">
                        <label for="theme">Theme:</label>
                        <select id="theme" name="theme" class="form-input">
                            <option value="light">Light</option>
                            <option value="dark">Dark</option>
                        </select>
                    </div>

                    <!-- Language -->
                    <div class="form-group">
                        <label for="language">Language:</label>
                        <select id="language" name="language" class="form-input">
                            <option value="en">English</option>
                            <option value="fr">French</option>
                            <option value="es">Spanish</option>
                        </select>
                    </div>

                    <button type="submit" class="submit-button">Save Settings</button>
                </form>
                <div id="statusMessage" class="status-message"></div>
            </div>
        `;

        this.#attachEventListeners();
        this.#fetchSettings();
        return this.#container;
    }

    #attachEventListeners() {
        const form = this.#container.querySelector('#settingsForm');

        // Form submission
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.#handleSubmit(new FormData(form));
        });
    }

    async #fetchSettings() {
        try {
            const response = await fetch('/settings');
            const data = await response.json();
            this.#container.querySelector('#username').value = data.username || '';
            this.#container.querySelector('#theme').value = data.theme || 'light';
            this.#container.querySelector('#language').value = data.language || 'en';
        } catch (error) {
            console.error('Error fetching settings:', error);
        }
    }

    async #handleSubmit(formData) {
        const settingsData = {
            username: formData.get('username'),
            theme: formData.get('theme'),
            language: formData.get('language'),
        };

        try {
            const response = await fetch('/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settingsData),
            });
            const result = await response.json();
            this.#showStatusMessage(result.message || 'Settings updated successfully!', 'success');
        } catch (error) {
            console.error('Error updating settings:', error);
            this.#showStatusMessage('Failed to update settings. Please try again.', 'error');
        }
    }

    #showStatusMessage(message, type) {
        const statusMessage = this.#container.querySelector('#statusMessage');
        statusMessage.textContent = message;
        statusMessage.className = `status-message ${type}`;
        setTimeout(() => {
            statusMessage.textContent = '';
            statusMessage.className = 'status-message';
        }, 3000);
    }
}