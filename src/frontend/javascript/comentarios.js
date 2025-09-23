const API_URL = "http://localhost:3000/api/comments";

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
        const response = await fetch(API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name, message }),
        });

        if (!response.ok) {
          throw new Error("Falha ao enviar comentário");
        }

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
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error("Falha ao carregar comentários");
    }
    const comments = await response.json();

    const commentsDiv = document.getElementById("comments");
    const commentList = commentsDiv.querySelector(".comment-list");

    if (comments.length === 0) {
      commentList.innerHTML = "<p>Ainda não há comentários. Seja o primeiro a comentar!</p>";
    } else {
      commentList.innerHTML = comments
        .map(
          (comment) => `
        <article class="comment" data-id="${comment.id}">
          <header class="comment-header">
            <strong class="comment-author">${sanitizeInput(comment.name)}</strong>
            <time datetime="${comment.created_at}">${formatDate(comment.created_at)}</time>
          </header>
          <p class="comment-body">${sanitizeInput(comment.message)}</p>
        </article>
      `
        )
        .join("");
    }

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