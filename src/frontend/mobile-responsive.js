document.addEventListener('DOMContentLoaded', function() {
    // Menu Toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const menuPrincipal = document.querySelector('.menu-principal');

    if (menuToggle && menuPrincipal) {
        menuToggle.addEventListener('click', function() {
            this.classList.toggle('active');
            menuPrincipal.classList.toggle('active');
        });

        // Adicionar índice aos itens do menu para animação escalonada
        const menuItems = menuPrincipal.querySelectorAll('li');
        menuItems.forEach((item, index) => {
            item.style.setProperty('--item-index', index);
        });
    }

    // Header na rolagem
    const header = document.querySelector('.header-principal');
    if (header) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 10) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }

    // Animações de entrada usando IntersectionObserver
    const fadeElements = document.querySelectorAll('.fade-in, .stagger-item');

    if (fadeElements.length) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, { threshold: 0.15 });

        fadeElements.forEach(element => {
            observer.observe(element);
        });
    }

    // Gerenciar indicadores de deslize
    const swipeContainers = document.querySelectorAll('.swipe-container');

    swipeContainers.forEach(container => {
        const items = container.querySelectorAll('.swipe-item');
        const indicator = document.createElement('div');
        indicator.className = 'swipe-indicator';

        // Criar pontos indicadores
        items.forEach((_, index) => {
            const dot = document.createElement('span');
            dot.className = 'indicator-dot' + (index === 0 ? ' active' : '');
            indicator.appendChild(dot);
        });

        container.parentNode.insertBefore(indicator, container.nextSibling);

        // Atualizar indicadores ao deslizar
        container.addEventListener('scroll', function() {
            const scrollPosition = this.scrollLeft;
            const containerWidth = this.offsetWidth;
            const dots = indicator.querySelectorAll('.indicator-dot');

            items.forEach((item, index) => {
                const itemPosition = item.offsetLeft;
                if (scrollPosition >= itemPosition - containerWidth/2 &&
                    scrollPosition < itemPosition + item.offsetWidth - containerWidth/2) {
                    dots.forEach(d => d.classList.remove('active'));
                    dots[index].classList.add('active');
                }
            });
        });
    });

    // Fechar menu ao clicar em links
    const menuLinks = document.querySelectorAll('.menu-principal a');
    menuLinks.forEach(link => {
        link.addEventListener('click', function() {
            if (menuPrincipal.classList.contains('active')) {
                menuPrincipal.classList.remove('active');
                if (menuToggle) menuToggle.classList.remove('active');
            }
        });
    });
});