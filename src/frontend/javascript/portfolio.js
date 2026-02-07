/* Lógica específica do Portfólio (index.html) */

document.addEventListener("DOMContentLoaded", function () {
  inicializarSliders();
  inicializarModal();
});

function inicializarSliders() {
  /* Setas Slids cards */
  document.querySelectorAll('.projeto-card').forEach(card => {
    const slider = card.querySelector('.slider');
    const images = card.querySelectorAll('.slider img');
    const prevBtn = card.querySelector('.prev');
    const nextBtn = card.querySelector('.next');

    if (!slider || !images.length) return;

    let index = 0;

    function showImage(i) {
      index = (i + images.length) % images.length;
      slider.style.transform = `translateX(${-index * 100}%)`;
    }

    if (prevBtn && nextBtn) {
      prevBtn.addEventListener('click', (e) => {
        e.preventDefault();
        showImage(index - 1);
      });
      nextBtn.addEventListener('click', (e) => {
        e.preventDefault();
        showImage(index + 1);
      });
    }
  });
}

function inicializarModal() {
  // Modal
  const modal = document.getElementById("imageModal");
  const modalImg = document.getElementById("modalImg");
  const captionText = document.getElementById("caption");
  const closeBtn = document.querySelector(".modal .close");

  if (!modal) return;

  // Ao clicar em qualquer imagem do slider, abre o modal
  document.querySelectorAll('.slider img').forEach(img => {
    img.addEventListener('click', () => {
      modal.style.display = "block";
      modalImg.src = img.src;
      captionText.textContent = img.alt;
    });
  });

  // Fechar modal
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      modal.style.display = "none";
    });
  }

  // Fechar clicando fora da imagem
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.style.display = "none";
    }
  });
}
