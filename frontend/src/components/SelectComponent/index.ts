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
		buttonText.textContent = this.selectedOption?.label || 'Select an option';

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
		// Initially hide the dropdown
		this.optionsList.style.display = 'none';

		// Add options
		this.options.forEach((option) => {
			const optionElement = document.createElement('div');
			optionElement.classList.add('select-option');
			optionElement.textContent = option.label;
			
			// Mark as selected if it's the current selected option
			if (this.selectedOption && this.selectedOption.value === option.value) {
				optionElement.classList.add('selected');
			}

			optionElement.addEventListener('click', () => {
				this.selectOption(option);
			});

			// Add mouseover effect
			optionElement.addEventListener('mouseover', () => {
				// Remove 'active' class from all options
				this.optionsList?.querySelectorAll('.select-option').forEach(el => {
					el.classList.remove('active');
				});
				// Add 'active' class to the hovered option
				optionElement.classList.add('active');
			});

			this.optionsList?.appendChild(optionElement);
		});

		// Append to document body for proper positioning
		document.body.appendChild(this.optionsList);

		// Add event listener to toggle dropdown
		this.selectButton.addEventListener('click', () => {
			this.toggleDropdown();
		});

		// Close dropdown when clicking outside
		document.addEventListener('click', (e) => {
			if (this.container && 
				!this.container.contains(e.target as Node) && 
				!this.optionsList?.contains(e.target as Node) && 
				this.isOpen) {
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
		if (this.optionsList && this.selectButton && this.container) {
			// Position the dropdown below the button
			const rect = this.container.getBoundingClientRect();
			
			this.optionsList.style.position = 'absolute';
			this.optionsList.style.top = `${rect.bottom}px`;
			this.optionsList.style.left = `${rect.left}px`;
			this.optionsList.style.width = `${rect.width}px`;
			this.optionsList.style.display = 'block';
			this.optionsList.style.backgroundColor = 'white';
			
			this.isOpen = true;
			this.selectButton.classList.add('active');
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

		// Update the button text
		if (this.selectButton) {
			const buttonText = this.selectButton.querySelector('span');
			if (buttonText) {
				buttonText.textContent = option.label;
			}
		}

		// Update the selected class on options
		if (this.optionsList) {
			this.optionsList.querySelectorAll('.select-option').forEach((el, index) => {
				if (this.options[index].value === option.value) {
					el.classList.add('selected');
				} else {
					el.classList.remove('selected');
				}
			});
		}

		this.closeDropdown();

		if (this.onChange) {
			this.onChange(option);
		}
	}

	setValue(value: string) {
		const option = this.options.find(opt => opt.value === value);
		if (option) {
			this.selectOption(option);
		}
		return this;
	}

	getValue(): string | null {
		return this.selectedOption ? this.selectedOption.value : null;
	}

	// Clean up when component is removed
	cleanup() {
		if (this.optionsList && document.body.contains(this.optionsList)) {
			document.body.removeChild(this.optionsList);
		}
	}
}
