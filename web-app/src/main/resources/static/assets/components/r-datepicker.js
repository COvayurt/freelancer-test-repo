import {css, html, LitElement} from 'lit';
import {_isValidDate, _isValidISODate} from '../common/date-utils.js';

class RDatePicker extends LitElement {
    static properties = {
        value: {type: String},
        name: {type: String},
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

        .datepicker-wrapper wa-input {
            flex: 1;
            padding-right: 2.5rem !important;
        }

        .shortcuts-hint {
            position: absolute;
            bottom: -18px;
            left: 0;
            font-size: 0.75rem;
            color: var(--wa-color-neutral-80);
            opacity: 0;
            transition: opacity 0.2s ease;
            pointer-events: none;
            white-space: nowrap;
            z-index: 1;
        }

        .shortcuts-hint.show {
            opacity: 1;
        }
    `;

    constructor() {
        super();
        this.id = '';
        this.value = '';
        this.name = '';
        this.placeholder = `yyyy${this.delimiter}mm${this.delimiter}dd`;
        this.required = false;
        this.disabled = false;
        this.size = 'small';
        this.shortcuts = true;
        this.label = '';
        this.textValue = '';
        this.focused = false;
        this.showHint = false;
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

    _handleIconClick() {
        if (this.disabled) return;

        const nativeInput = this.shadowRoot.querySelector('input[type="date"]');

        if (nativeInput && nativeInput.showPicker) {
            nativeInput.style.opacity = '1';
            nativeInput.style.pointerEvents = 'auto';

            nativeInput.focus({ preventScroll: true });
            nativeInput.showPicker();
            setTimeout(() => {


                setTimeout(() => {
                    nativeInput.style.opacity = '0';
                    nativeInput.style.pointerEvents = 'none';
                    nativeInput.style.zIndex = '-1';
                }, 300);
            }, 0);
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
        debugger;
        const input = this.shadowRoot.querySelector('.datepicker-input');
        input?.focus();
    }



    render() {
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

customElements.define('r-datepicker', RDatePicker);