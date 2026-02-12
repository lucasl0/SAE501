// Exécuté immédiatement
(function() {
    try {
        const savedTheme = localStorage.getItem('admin-theme');
        if (savedTheme && savedTheme !== 'blue') {
            // Gradient
            const gradientDiv = document.querySelector('.absolute.w-full.min-h-\\[40vh\\].z-\\[-1\\]');
            if (gradientDiv) {
                gradientDiv.className = gradientDiv.className.replace(/from-\w+-200/, `from-${savedTheme}-200`);
            }
            
            // Meta theme-color
            const metaTheme = document.querySelector('meta[name="theme-color"]');
            if (metaTheme) {
                const colors = {
                    blue: '#bfdbfe', red: '#fed7d7', green: '#bbf7d0',
                    purple: '#e9d5ff', pink: '#fbcfe8', indigo: '#c7d2fe',
                    orange: '#fed7aa', teal: '#b2f5ea'
                };
                metaTheme.content = colors[savedTheme] || '#bfdbfe';
            }
        }
    } catch (e) {
        console.warn('Theme init error:', e);
    }
})();