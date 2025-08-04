document.addEventListener('DOMContentLoaded', () => {
    function initializeDatepickers() {
        const wrappers = document.querySelectorAll('[data-datepicker-wrapper]');

        wrappers.forEach((wrapper, index) => {
            const input = wrapper.querySelector('[data-datepicker-input]');
            const logic = wrapper.querySelector('[data-datepicker-logic]');
            const icon = wrapper.querySelector('[data-datepicker-icon]');
            const hint = wrapper.querySelector('[data-datepicker-hint]');

            if (!input || !logic) {
                return;
            }

            if (input.dataset.initialized) {
                return;
            }

            input.dataset.initialized = 'true';

            if (logic.tagName === 'R-DATEPICKER') {
                const checkReady = () => {
                    if (typeof logic._handleKeyDown === 'function') {
                        setupEventListeners();
                    } else {
                        setTimeout(checkReady, 50);
                    }
                };

                const setupEventListeners = () => {
                    input.addEventListener('keydown', (e) => {
                        logic.textValue = input.value;
                        try {
                            logic._handleKeyDown(e);
                        } catch (error) {
                            console.error('Error calling _handleKeyDown:', error);
                        }
                    });

                    logic.addEventListener('input', (e) => {
                        input.value = e.detail && e.detail.value;
                        input.dispatchEvent(new Event('change', {bubbles: true}));
                        input.dispatchEvent(new Event('input', {bubbles: true}));
                    });

                    if (hint) {
                        input.addEventListener('focus', () => hint.style.opacity = '1');
                        input.addEventListener('blur', () => hint.style.opacity = '0');
                    }

                    if (icon) {
                        icon.addEventListener('click', () => {
                            logic._handleIconClick();
                        });
                    }
                };

                checkReady();
            }
        });
    }

    setTimeout(() => {
        initializeDatepickers();
    }, 200);

    document.addEventListener('htmx:afterSwap', () => {
        setTimeout(initializeDatepickers, 100);
    });
    document.addEventListener('htmx:afterSettle', () => {
        setTimeout(initializeDatepickers, 100);
    });
});