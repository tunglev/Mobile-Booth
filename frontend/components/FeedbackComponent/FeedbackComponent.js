import { BaseComponent } from '../BaseComponent/BaseComponent.js';

export class FeedbackComponent extends BaseComponent {
    #container = null;
    #db = null;
    #storeName = 'feedbacks';
    #dbName = 'FeedbackDB';

    constructor() {
        super();
        this.loadCSS('FeedbackComponent');
        this.initializeDB();
    }

    async initializeDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.#dbName, 1);

            request.onerror = () => reject(new Error('Failed to open database'));

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains(this.#storeName)) {
                    const store = db.createObjectStore(this.#storeName, { keyPath: 'id', autoIncrement: true });
                    store.createIndex('email', 'email', { unique: false });
                    store.createIndex('timestamp', 'timestamp', { unique: false });
                }
            };

            request.onsuccess = (event) => {
                this.#db = event.target.result;
                resolve();
            };
        });
    }

    render() {
        this.#container = document.createElement('div');
        this.#container.classList.add('feedback-component');

        this.#container.innerHTML = `
            <div class="feedback-container">
                <div class="form-view">
                    <h2>Feedback Form</h2>
                    <form id="feedbackForm" class="feedback-form">
                        <div class="form-group">
                            <input type="text" id="name" name="name" placeholder="Your Name" required 
                                class="form-input" minlength="2">
                            <div class="validation-message" data-for="name"></div>
                        </div>
                        <div class="form-group">
                            <input type="email" id="email" name="email" placeholder="Your Email" required 
                                class="form-input">
                            <div class="validation-message" data-for="email"></div>
                        </div>
                        <div class="form-group">
                            <textarea id="feedback" name="feedback" placeholder="Your Feedback" required 
                                class="form-textarea" rows="5" minlength="10"></textarea>
                            <div class="validation-message" data-for="feedback"></div>
                        </div>
                        <button type="submit" class="submit-button">Submit Feedback</button>
                    </form>
                </div>
                <div class="feedback-history" style="display: none">
                    <h2>Previous Feedback</h2>
                    <div class="history-list"></div>
                </div>
                <div class="view-toggle">
                    <button id="toggleView" class="toggle-button">View Previous Feedback</button>
                </div>
            </div>
            <div id="notification" class="notification" style="display: none"></div>
        `;

        this.#attachEventListeners();
        return this.#container;
    }

    #attachEventListeners() {
        const form = this.#container.querySelector('#feedbackForm');
        const toggleBtn = this.#container.querySelector('#toggleView');

        // Form validation events
        ['name', 'email', 'feedback'].forEach(field => {
            const input = form.querySelector(`#${field}`);
            input.addEventListener('input', () => this.#validateField(input));
            input.addEventListener('blur', () => this.#validateField(input));
        });

        // Form submission
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (this.#validateForm()) {
                await this.#handleSubmit(new FormData(form));
            }
        });

        // Toggle view
        toggleBtn.addEventListener('click', () => this.#toggleView());
    }

    #validateField(input) {
        const messageElement = this.#container.querySelector(`.validation-message[data-for="${input.id}"]`);
        let isValid = true;
        let message = '';

        switch (input.id) {
            case 'name':
                isValid = input.value.length >= 2;
                message = isValid ? '' : 'Name must be at least 2 characters long';
                break;
            case 'email':
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                isValid = emailRegex.test(input.value);
                message = isValid ? '' : 'Please enter a valid email address';
                break;
            case 'feedback':
                isValid = input.value.length >= 10;
                message = isValid ? '' : 'Feedback must be at least 10 characters long';
                break;
        }

        input.classList.toggle('invalid', !isValid);
        input.classList.toggle('valid', isValid);
        messageElement.textContent = message;
        messageElement.classList.toggle('error', !isValid);

        return isValid;
    }

    #validateForm() {
        const inputs = ['name', 'email', 'feedback'];
        return inputs.every(id => this.#validateField(this.#container.querySelector(`#${id}`)));
    }

    async #handleSubmit(formData) {
        const feedbackData = {
            name: formData.get('name'),
            email: formData.get('email'),
            feedback: formData.get('feedback'),
            timestamp: new Date().toISOString()
        };

        try {
            const transaction = this.#db.transaction([this.#storeName], 'readwrite');
            const store = transaction.objectStore(this.#storeName);
            
            await new Promise((resolve, reject) => {
                const request = store.add(feedbackData);
                request.onsuccess = () => resolve();
                request.onerror = () => reject(new Error('Failed to save feedback'));
            });

            this.#showNotification('Feedback submitted successfully!', 'success');
            this.#resetForm();
            await this.#loadFeedbackHistory();
        } catch (error) {
            this.#showNotification('Failed to submit feedback. Please try again.', 'error');
            console.error('Error saving feedback:', error);
        }
    }

    #resetForm() {
        const form = this.#container.querySelector('#feedbackForm');
        form.reset();
        form.querySelectorAll('.form-input, .form-textarea').forEach(input => {
            input.classList.remove('valid', 'invalid');
        });
        form.querySelectorAll('.validation-message').forEach(msg => {
            msg.textContent = '';
            msg.classList.remove('error');
        });
    }

    #toggleView() {
        const formView = this.#container.querySelector('.form-view');
        const historyView = this.#container.querySelector('.feedback-history');
        const toggleBtn = this.#container.querySelector('#toggleView');

        const isShowingForm = formView.style.display !== 'none';
        formView.style.display = isShowingForm ? 'none' : 'block';
        historyView.style.display = isShowingForm ? 'block' : 'none';
        toggleBtn.textContent = isShowingForm ? 'Show Feedback Form' : 'View Previous Feedback';

        if (!isShowingForm) {
            this.#loadFeedbackHistory();
        }
    }

    async #loadFeedbackHistory() {
        const historyList = this.#container.querySelector('.history-list');
        historyList.innerHTML = '';

        try {
            const transaction = this.#db.transaction([this.#storeName], 'readonly');
            const store = transaction.objectStore(this.#storeName);
            const request = store.index('timestamp').openCursor(null, 'prev');

            request.onsuccess = (event) => {
                const cursor = event.target.result;
                if (cursor) {
                    const feedback = cursor.value;
                    const element = document.createElement('div');
                    element.classList.add('feedback-entry');
                    element.innerHTML = `
                        <div class="feedback-header">
                            <strong>${feedback.name}</strong>
                            <span class="feedback-date">
                                ${new Date(feedback.timestamp).toLocaleString()}
                            </span>
                        </div>
                        <div class="feedback-content">${feedback.feedback}</div>
                    `;
                    historyList.appendChild(element);
                    cursor.continue();
                }
            };
        } catch (error) {
            console.error('Error loading feedback history:', error);
            this.#showNotification('Failed to load feedback history.', 'error');
        }
    }

    #showNotification(message, type) {
        const notification = this.#container.querySelector('#notification');
        notification.textContent = message;
        notification.className = `notification ${type}`;
        notification.style.display = 'block';

        setTimeout(() => {
            notification.style.display = 'none';
        }, 3000);
    }
}
