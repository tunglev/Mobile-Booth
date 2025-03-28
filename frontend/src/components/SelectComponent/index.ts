import { BaseComponent } from '@/components/BaseComponent';

export interface SelectOption {
	value: string;
	label: string;
}

export class SelectComponent extends BaseComponent {
	private options: SelectOption[];
	private label: string;
	private selectedOption: SelectOption | null = null;
	private isOpen: boolean = false;
	private container: HTMLElement | null = null;
	private selectButton: HTMLElement | null = null;
	private optionsList: HTMLElement | null = null;
	private onChange: ((option: SelectOption) => void) | null = null;

	constructor(options: SelectOption[], label: string = 'Label') {
		super();
		this.options = options;
		this.label = label;
		this.loadCSS('src/components/SelectComponent', 'styles');
	}

	setOnChange(callback: (option: SelectOption) => void) {
		this.onChange = callback;
		return this;
	}

	render() {
		// Create the main container
		this.container = document.createElement('div');
		this.container.classList.add('select-container');

		// Create label
		const labelElement = document.createElement('div');
		labelElement.classList.add('select-label');
		labelElement.textContent = this.label;
		this.container.appendChild(labelElement);

		// Create select button
		this.selectButton = document.createElement('div');
		this.selectButton.classList.add('select-button');

		// Add default text and chevron
		const buttonText = document.createElement('span');
		buttonText.textContent = this.selectedOption?.label || 'Option';

		const chevron = document.createElement('span');
		chevron.classList.add('select-chevron');
		chevron.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`;

		this.selectButton.appendChild(buttonText);
		this.selectButton.appendChild(chevron);
		this.container.appendChild(this.selectButton);

		// Create options dropdown
		this.optionsList = document.createElement('div');
		this.optionsList.classList.add('select-options');
		this.optionsList.style.display = 'none';

		// Add options
		this.options.forEach((option) => {
			const optionElement = document.createElement('div');
			optionElement.classList.add('select-option');
			optionElement.textContent = option.label;

			optionElement.addEventListener('click', () => {
				this.selectOption(option);
			});

			this.optionsList?.appendChild(optionElement);
		});

		this.container.appendChild(this.optionsList);

		// Add event listener to toggle dropdown
		this.selectButton.addEventListener('click', () => {
			this.toggleDropdown();
		});

		// Close dropdown when clicking outside
		document.addEventListener('click', (e) => {
			if (this.container && !this.container.contains(e.target as Node) && this.isOpen) {
				this.closeDropdown();
			}
		});

		return this.container;
	}

	private toggleDropdown() {
		if (this.isOpen) {
			this.closeDropdown();
		} else {
			this.openDropdown();
		}
	}

	private openDropdown() {
		if (this.optionsList) {
			this.optionsList.style.display = 'block';
			this.isOpen = true;
			this.selectButton?.classList.add('active');
		}
	}

	private closeDropdown() {
		if (this.optionsList) {
			this.optionsList.style.display = 'none';
			this.isOpen = false;
			this.selectButton?.classList.remove('active');
		}
	}

	private selectOption(option: SelectOption) {
		this.selectedOption = option;

		if (this.selectButton) {
			const buttonText = this.selectButton.querySelector('span');
			if (buttonText) {
				buttonText.textContent = option.label;
			}
		}

		this.closeDropdown();

		if (this.onChange) {
			this.onChange(option);
		}
	}

	getValue(): string | null {
		return this.selectedOption ? this.selectedOption.value : null;
	}
}
