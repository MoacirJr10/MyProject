const comments = [];

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("comment-form");

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const name = document.getElementById("name").value.trim();
      const message = document.getElementById("message").value.trim();

      if (!name || !message) {
        alert("Por favor, preencha todos os campos.");
        return;
      }

      try {

        const newComment = {
          id: Date.now(),
          name,
          message,
          date: new Date().toISOString(),
        };
        comments.push(newComment);


        document.getElementById("name").value = "";
        document.getElementById("message").value = "";


        await loadComments();
      } catch (err) {
        console.error("Erro ao enviar comentário:", err);
        alert("Ocorreu um erro ao enviar o comentário. Tente novamente.");
      }
    });

    loadComments();
  }
});

async function loadComments() {
  try {
    const commentsDiv = document.getElementById("comments");
    const commentList = commentsDiv.querySelector(".comment-list");


    commentList.innerHTML = comments
      .map(
        (comment) => `
        <article class="comment" data-id="${comment.id}">
          <header class="comment-header">
            <strong class="comment-author">${sanitizeInput(comment.name)}</strong>
            <time datetime="${comment.date}">${formatDate(comment.date)}</time>
          </header>
          <p class="comment-body">${sanitizeInput(comment.message)}</p>
        </article>
      `
      )
      .join("");


    commentsDiv.setAttribute("aria-live", "polite");
  } catch (err) {
    console.error("Erro ao carregar comentários:", err);
    const commentList = document.querySelector(".comment-list");
    commentList.innerHTML = "<p>Erro ao carregar comentários.</p>";
  }
}


function formatDate(isoString) {
  const date = new Date(isoString);
  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}


function sanitizeInput(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}