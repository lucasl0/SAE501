export const TAILWIND_COLORS = {
    blue: {
        name: 'Bleu',
        bg: 'bg-blue-200',
        gradientFrom: 'from-blue-200',
        meta: '#bfdbfe',
        ring: 'focus:ring-blue-500',
        button: 'bg-blue-700 hover:bg-blue-950',
        border: 'border-blue-600'
    },
    red: {
        name: 'Rouge',
        bg: 'bg-red-200',
        gradientFrom: 'from-red-200',
        meta: '#fed7d7',
        ring: 'focus:ring-red-500',
        button: 'bg-red-700 hover:bg-red-950',
        border: 'border-red-600'
    },
    green: {
        name: 'Vert',
        bg: 'bg-green-200',
        gradientFrom: 'from-green-200',
        meta: '#bbf7d0',
        ring: 'focus:ring-green-500',
        button: 'bg-green-700 hover:bg-green-950',
        border: 'border-green-600'
    },
    purple: {
        name: 'Violet',
        bg: 'bg-purple-200',
        gradientFrom: 'from-purple-200',
        meta: '#e9d5ff',
        ring: 'focus:ring-purple-500',
        button: 'bg-purple-700 hover:bg-purple-950',
        border: 'border-purple-600'
    },
    pink: {
        name: 'Rose',
        bg: 'bg-pink-200',
        gradientFrom: 'from-pink-200',
        meta: '#fbcfe8',
        ring: 'focus:ring-pink-500',
        button: 'bg-pink-700 hover:bg-pink-950',
        border: 'border-pink-600'
    },
    indigo: {
        name: 'Indigo',
        bg: 'bg-indigo-200',
        gradientFrom: 'from-indigo-200',
        meta: '#c7d2fe',
        ring: 'focus:ring-indigo-500',
        button: 'bg-indigo-700 hover:bg-indigo-950',
        border: 'border-indigo-600'
    },
    orange: {
        name: 'Orange',
        bg: 'bg-orange-200',
        gradientFrom: 'from-orange-200',
        meta: '#fed7aa',
        ring: 'focus:ring-orange-500',
        button: 'bg-orange-700 hover:bg-orange-950',
        border: 'border-orange-600'
    },
    teal: {
        name: 'Sarcelle',
        bg: 'bg-teal-200',
        gradientFrom: 'from-teal-200',
        meta: '#b2f5ea',
        ring: 'focus:ring-teal-500',
        button: 'bg-teal-700 hover:bg-teal-950',
        border: 'border-teal-600'
    }
};

export const DEFAULT_THEME = 'blue';

class ThemeManager {
    constructor() {
        this.currentTheme = localStorage.getItem('admin-theme') || DEFAULT_THEME;
    }

    init() {
        // Appliquer le thème sauvegardé au chargement
        this.applyTheme(this.currentTheme, false);
        
        // Initialiser le sélecteur si présent
        this.initThemeSelector();
    }

    applyTheme(themeKey, save = true) {
        const theme = TAILWIND_COLORS[themeKey] || TAILWIND_COLORS[DEFAULT_THEME];
        
        // 1. Mettre à jour le gradient
        const gradientDiv = document.querySelector('.absolute.w-full.min-h-\\[40vh\\].z-\\[-1\\]');
        if (gradientDiv) {
            gradientDiv.classList.remove(...Object.keys(TAILWIND_COLORS).map(c => `from-${c}-200`));
            gradientDiv.classList.add(theme.gradientFrom);
        }

        // 2. Mettre à jour les boutons primaires
        document.querySelectorAll('.bg-blue-700').forEach(el => {
            el.classList.remove('bg-blue-700');
            el.classList.add(theme.button.split(' ')[0]);
        });

        document.querySelectorAll('.hocus\\:bg-blue-950').forEach(el => {
            el.classList.remove('hocus:bg-blue-950');
            el.classList.add(theme.button.split(' ')[1]);
        });

        // 3. Mettre à jour les focus rings
        document.querySelectorAll('.focus\\:ring-blue-500').forEach(el => {
            el.classList.remove('focus:ring-blue-500');
            el.classList.add(theme.ring);
        });

        // 4. Mettre à jour les hovers dans la navigation
        document.querySelectorAll('[data-navigation="back-end"] .hocus\\:bg-blue-100').forEach(el => {
            el.classList.remove('hocus:bg-blue-100');
            el.classList.add(`hocus:bg-${themeKey}-100`);
        });

        // 5. Mettre à jour le lien admin
        document.querySelector('h1 a').classList.remove('from-blue-900', 'to-slate-900', 'hocus:from-blue-600', 'hocus:to-slate-600');
        
        // 6. Meta theme-color
        this.updateMetaThemeColor(theme.meta);

        // 7. Sauvegarder
        if (save) {
            localStorage.setItem('admin-theme', themeKey);
            this.currentTheme = themeKey;
        }

        // 8. Mettre à jour l'état actif des boutons
        this.updateActiveButton(themeKey);
    }

    updateMetaThemeColor(color) {
        let metaTheme = document.querySelector('meta[name="theme-color"]');
        if (!metaTheme) {
            metaTheme = document.createElement('meta');
            metaTheme.name = 'theme-color';
            document.head.appendChild(metaTheme);
        }
        metaTheme.content = color;
    }

    initThemeSelector() {
        const selector = document.querySelector('[data-theme-selector]');
        if (!selector) return;

        const buttonsContainer = selector.querySelector('[data-theme-buttons]');
        if (!buttonsContainer) return;

        this.renderThemeButtons(buttonsContainer);
    }

    renderThemeButtons(container) {
        // Vider le conteneur
        container.innerHTML = '';

        // Récupérer le template
        const template = document.querySelector('[data-tpl-id="theme-button"]');
        if (!template) {
            console.error('Template theme-button non trouvé');
            return;
        }

        // Créer les boutons
        Object.entries(TAILWIND_COLORS).forEach(([key, theme]) => {
            const button = template.content.cloneNode(true).firstElementChild;
            
            // Configurer le bouton
            button.dataset.themeValue = key;
            button.setAttribute('aria-label', `Changer le thème pour ${theme.name}`);
            button.setAttribute('title', theme.name);
            
            // Couleurs
            button.classList.add(`bg-${key}-200`);
            button.classList.add(`focus:ring-${key}-500`);
            button.style.backgroundColor = theme.meta;
            
            // État actif
            if (this.currentTheme === key) {
                button.classList.add('border-2', `border-${key}-600`);
            } else {
                button.classList.add('border-transparent');
            }
            
            // Event listener
            button.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.applyTheme(key);
            });
            
            container.appendChild(button);
        });
    }

    updateActiveButton(activeKey) {
        document.querySelectorAll('.theme-btn').forEach(btn => {
            btn.classList.remove('border-2', ...Object.keys(TAILWIND_COLORS).map(c => `border-${c}-600`));
            btn.classList.add('border-transparent');
            
            if (btn.dataset.themeValue === activeKey) {
                btn.classList.remove('border-transparent');
                btn.classList.add('border-2', `border-${activeKey}-600`);
            }
        });
    }
}

export const themeManager = new ThemeManager();