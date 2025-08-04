import {css, html, LitElement} from 'lit';
import {_isValidDate, _isValidISODate} from '../common/date-utils.js';

class RDatePicker extends LitElement {
    static properties = {
        value: {type: String},
        name: {type: String},
        size: {type: String},
        required: {type: Boolean},
        showHint: {type: Boolean, attribute: 'show-hint'},
        standalone: {type: Boolean},
    };

    delimiter = "-";

    get datePattern() {
        return new RegExp(`^\\d{4}\\${this.delimiter}\\d{2}\\${this.delimiter}\\d{2}$`);
    }

    static styles = css`
        :host {
            display: inline-block;
            width: 100%;
            position: relative;
        }

        .r-shortcuts-hint {
            position: absolute;
            font-size: 0.50rem;
            color: var(--wa-color-neutral-50);
            transition: opacity 0.8s ease;
            pointer-events: none;
            white-space: nowrap;
        }`;

    constructor() {
        super();
        this.id = '';
        this.value = '';
        this.size = 'small';
        this.required = false;
        this.showHint = false;
        this.standalone = false;
    }

    connectedCallback() {
        super.connectedCallback();
        if (this.value) {
            this.textValue = this.value.replace(/[-\/]/g, this.delimiter);
        }
    }

    _handleKeyDown(e) {
        if (e.key.toLowerCase() === 't' && !e.ctrlKey && !e.metaKey && !e.altKey) {
            e.preventDefault();
            const today = new Date().toISOString().split('T')[0];
            this._setDateValue(today);
            return;
        }

        if (e.key === 'Enter') {
            e.preventDefault();
            const parsed = this._parseShortcut(this.textValue.trim());

            if (parsed) {
                this._setDateValue(parsed);
            } else if (this.textValue.match(this.datePattern)) {
                this._validateAndSetDate(this.textValue);
            }
        }
    }

    _handleNativeDateChange(e) {
        if (e.target.value) {
            this._setDateValue(e.target.value);
        }
    }

    _handleIconClick(e) {
        const nativeInput = this.shadowRoot.querySelector('input[type="date"]');
        if (nativeInput && nativeInput.showPicker) {
            nativeInput.showPicker();
        }
    }

    _parseShortcut(input) {
        if (!input) return null;

        const currentYear = new Date().getFullYear();

        if (input.match(/^\d{4}$/)) {
            return this._parseDdmmFormat(input, currentYear);
        }

        if (input.match(/^\d{6}$/)) {
            return this._parseDdmmyyFormat(input, currentYear);
        }

        return null;
    }

    _parseDdmmFormat(input, currentYear) {
        const day = input.slice(0, 2);
        const month = input.slice(2, 4);

        if (_isValidDate(day, month, currentYear)) {
            return `${currentYear}${this.delimiter}${month.padStart(2, '0')}${this.delimiter}${day.padStart(2, '0')}`;
        }

        return null;
    }

    _parseDdmmyyFormat(input, currentYear) {
        const day = input.slice(0, 2);
        const month = input.slice(2, 4);
        let year = parseInt(input.slice(4, 6));

        const currentTwoDigitYear = currentYear % 100;
        if (year <= currentTwoDigitYear + 10) {
            year = Math.floor(currentYear / 100) * 100 + year;
        } else {
            year = Math.floor(currentYear / 100 - 1) * 100 + year;
        }

        if (_isValidDate(day, month, year)) {
            return `${year}${this.delimiter}${month.padStart(2, '0')}${this.delimiter}${day.padStart(2, '0')}`;
        }

        return null;
    }


    _validateAndSetDate(dateString) {
        if (_isValidISODate(dateString)) {
            this._setDateValue(dateString);
        }
    }


    _setDateValue(dateString) {
        this.value = dateString;
        this.textValue = dateString;

        const textInput = this.shadowRoot.querySelector('.datepicker-input');
        const nativeInput = this.shadowRoot.querySelector('input[type="date"]');

        if (textInput) {
            textInput.value = dateString;
        }
        if (nativeInput) {
            nativeInput.value = dateString;
        }

        this.dispatchEvent(new CustomEvent('change', {
            detail: {value: dateString},
            bubbles: true
        }));

        this.dispatchEvent(new CustomEvent('input', {
            detail: {value: dateString},
            bubbles: true
        }));
    }

    focus() {
        const input = this.shadowRoot.querySelector('.datepicker-input');
        input?.focus();
    }

    _handleStandaloneKeyDown(e) {
        const input = e.target;
        this.textValue = input.value;
        this._handleKeyDown(e);
    }

    _handleStandaloneInput(e) {
        const input = e.target;
        this.textValue = input.value;
    }

    _handleStandaloneFocus() {
        if (this.showHint) {
            const hint = this.shadowRoot.querySelector('.r-shortcuts-hint');
            if (hint) {
                hint.style.opacity = '1';
            }
        }
    }

    _handleStandaloneBlur() {
        if (this.showHint) {
            const hint = this.shadowRoot.querySelector('.r-shortcuts-hint');
            if (hint) {
                hint.style.opacity = '0';
            }
        }
    }


    render() {
        if (this.standalone) {
            return html`
                <wa-input
                        name="${this.name}"
                        type="text"
                        size="${this.size}"
                        ?required="${this.required}"
                        .value="${this.value}"
                        autocomplete="off"
                        class="datepicker-input"
                        @keydown="${this._handleStandaloneKeyDown}"
                        @input="${this._handleStandaloneInput}"
                        @focus="${this._handleStandaloneFocus}"
                        @blur="${this._handleStandaloneBlur}">
                    <wa-icon slot="end" name="calendar"
                             @click="${this._handleIconClick}"></wa-icon>
                </wa-input>

                <input
                        id="${this.name}"
                        type="date"
                        style="position: absolute; opacity: 0; pointer-events: none; z-index: -1;"
                        .value="${this.value}"
                        @change="${this._handleNativeDateChange}"
                        tabindex="-1"
                />

                ${this.showHint ? html`
                    <div class="r-shortcuts-hint">
                        ddmm + Enter, ddmmyy + Enter, 't' for today
                    </div>
                ` : ''}
            `;
        } else {
            return html`
                <input
                        id="${this.name}"
                        type="date"
                        style="position: absolute; opacity: 0; pointer-events: none; z-index: -1;"
                        .value="${this.value}"
                        @change="${this._handleNativeDateChange}"
                        tabindex="-1"
                />
            `;
        }
    }
}

customElements.define('r-datepicker', RDatePicker);