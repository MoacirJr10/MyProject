document.addEventListener('DOMContentLoaded', () => {
    // Cria o modal do lightbox uma única vez
    const modal = document.createElement('div');
    modal.id = 'imageLightbox';
    modal.className = 'lightbox-modal';
    modal.innerHTML = `
        <span class="lightbox-close">&times;</span>
        <img class="lightbox-content" id="lightboxImg">
    `;
    document.body.appendChild(modal);

    const modalImg = document.getElementById('lightboxImg');
    const closeBtn = modal.querySelector('.lightbox-close');

    // Função para fechar o modal
    const closeModal = () => {
        modal.style.display = "none";
    };

    closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        // Fecha se clicar no fundo preto, mas não na imagem
        if (e.target === modal) {
            closeModal();
        }
    });

    // Adiciona o evento de clique a todas as imagens dentro do conteúdo principal
    // Usamos delegação de eventos para funcionar com imagens carregadas dinamicamente
    document.addEventListener('click', (e) => {
        // Verifica se o clique foi em uma imagem que deve abrir o lightbox
        if (e.target.tagName === 'IMG' && (e.target.classList.contains('card-img') || e.target.closest('.detalhe-texto'))) {
            modal.style.display = "block";
            modalImg.src = e.target.src;
        }
    });
});
