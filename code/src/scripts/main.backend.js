import "/src/styles/base.css";
import "/src/styles/scroll-shadow.css";
import "/src/styles/tailwind.css";
import "/src/styles/back-end/index.css";
import "./back-end/mobile-pagination.js";

import "./back-end/delete-entry-modal.js";
import "./back-end/preview-upload.js";
import "./back-end/paste-clipboard-image.js";
import "./back-end/reset-form.js";
import "./back-end/delete-uploaded-image.js";
import "./back-end/drag-n-drop-upload.js";
import "./back-end/close-modal.js";
import "./back-end/preview-modal.js";
import "./back-end/display-pagination-shortcut.js";
import "./back-end/tooltip-manager.js";
import "./back-end/breadcrumb-modal.js";
import "./back-end/flash-message.js";
import "/src/scripts/store-scroll-position.utils";
import { themeManager, TAILWIND_COLORS } from './theme-manager.js';

if (process.env.NODE_ENV === "development") {
    await import("./profiler-bar");
    await import("./vite.error-overlay");
}


// Initialisation immédiate
function init() {
    themeManager.init();
    
    // Observer l'ajout dynamique du sélecteur
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === 1 && node.matches?.('[data-theme-selector]')) {
                    themeManager.initThemeSelector();
                }
            });
        });
    });
    
    observer.observe(document.body, { childList: true, subtree: true });
}

// Attendre que le DOM soit prêt
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}