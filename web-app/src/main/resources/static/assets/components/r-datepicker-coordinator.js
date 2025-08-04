document.addEventListener('DOMContentLoaded', () => {
    function initializeDatepickers() {
        console.log('🔍 Looking for datepicker wrappers...');
        const wrappers = document.querySelectorAll('[data-datepicker-wrapper]');
        console.log('📦 Found', wrappers.length, 'datepicker wrappers');
        
        wrappers.forEach((wrapper, index) => {
            const input = wrapper.querySelector('[data-datepicker-input]');
            const logic = wrapper.querySelector('[data-datepicker-logic]');
            const icon = wrapper.querySelector('[data-datepicker-icon]');
            const hint = wrapper.querySelector('[data-datepicker-hint]');
            
            console.log(`📋 Wrapper ${index}:`, {
                input: input?.id || input?.name || 'NO_ID',
                logic: !!logic,
                icon: !!icon,
                hint: !!hint,
                logicMethods: logic ? Object.getOwnPropertyNames(logic.__proto__).filter(name => name.startsWith('_handle')) : []
            });
            
            if (!input || !logic) {
                console.warn('❌ Missing input or logic component for wrapper', index);
                return;
            }
            
            // Avoid double initialization
            if (input.dataset.initialized) {
                console.log('♻️ Already initialized:', input.id || input.name);
                return;
            }
            input.dataset.initialized = 'true';
            
            // Wait for Lit component to be ready
            if (logic.tagName === 'R-DATEPICKER') {
                // Check if Lit component is ready
                const checkReady = () => {
                    if (typeof logic._handleKeyDown === 'function') {
                        setupEventListeners();
                    } else {
                        console.log('⏳ Waiting for Lit component to initialize...');
                        setTimeout(checkReady, 50);
                    }
                };
                
                const setupEventListeners = () => {
                    // Forward user input to logic component
                    input.addEventListener('keydown', (e) => {
                        console.log('⌨️ Keydown:', e.key, 'in', input.id || input.name);
                        logic.textValue = input.value;
                        try {
                            logic._handleKeyDown(e);
                            console.log('✅ Sent to logic component');
                        } catch (error) {
                            console.error('❌ Error calling _handleKeyDown:', error);
                        }
                    });
                    
                    logic.addEventListener('input', (e) => {
                        console.log('🔄 Logic updated value:', e.detail && e.detail.value);
                        input.value = e.detail && e.detail.value;
                        input.dispatchEvent(new Event('change', { bubbles: true }));
                        input.dispatchEvent(new Event('input', { bubbles: true }));
                    });
                    
                    // Show/hide hints
                    if (hint) {
                        input.addEventListener('focus', () => hint.style.opacity = '1');
                        input.addEventListener('blur', () => hint.style.opacity = '0');
                    }
                    
                    // Calendar icon click
                    if (icon) {
                        icon.addEventListener('click', () => {
                            console.log('📅 Calendar icon clicked');
                            logic._handleIconClick();
                        });
                    }
                    
                    console.log('✅ Initialized r-datepicker:', input.id || input.name);
                };
                
                checkReady();
            }
        });
    }
    
    // Initialize existing datepickers with delay to ensure Lit components are loaded  
    setTimeout(() => {
        console.log('🚀 Starting datepicker initialization...');
        initializeDatepickers();
    }, 200);
    
    // Re-initialize when new content is added (for HTMX)
    document.addEventListener('htmx:afterSwap', () => {
        console.log('🔄 HTMX content swapped, re-initializing...');
        setTimeout(initializeDatepickers, 100);
    });
    document.addEventListener('htmx:afterSettle', () => {
        console.log('🎯 HTMX settled, re-initializing...');
        setTimeout(initializeDatepickers, 100);
    });
});