const BACKEND_URL = "http://localhost:3000/api/comments"; // ATUALIZE ESTA URL QUANDO FIZER O DEPLOY DO BACKEND!

let replyingToId = null;
let replyingToName = null;

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("comment-form");
  const cancelReplyButton = document.getElementById("cancel-reply");

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
        const commentData = {
          name,
          message,
        };

        if (replyingToId) {
          commentData.parent_id = replyingToId;
        }

        const response = await fetch(BACKEND_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(commentData),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        document.getElementById("name").value = "";
        document.getElementById("message").value = "";
        resetReplyState();
        loadComments();
      } catch (err) {
        console.error("Erro ao enviar comentário:", err);
        alert("Ocorreu um erro ao enviar o comentário. Tente novamente.");
      }
    });

    cancelReplyButton.addEventListener("click", resetReplyState);

    loadComments();
  }
});

async function loadComments() {
  try {
    const commentsDiv = document.getElementById("comments");
    const commentList = commentsDiv.querySelector(".comment-list");

    const response = await fetch(BACKEND_URL);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const comments = await response.json();

    commentList.innerHTML = "";

    comments.forEach((comment) => {
      commentList.appendChild(renderComment(comment));
    });

    commentsDiv.setAttribute("aria-live", "polite");
  } catch (err) {
    console.error("Erro ao carregar comentários:", err);
    const commentList = document.querySelector(".comment-list");
    commentList.innerHTML = "<p>Erro ao carregar comentários.</p>";
  }
}

function renderComment(comment) {
  const commentArticle = document.createElement("article");
  commentArticle.className = "comment";
  commentArticle.dataset.id = comment.id;

  let repliesHtml = "";
  if (comment.replies && comment.replies.length > 0) {
    const repliesContainer = document.createElement("div");
    repliesContainer.className = "replies";
    comment.replies.forEach((reply) => {
      repliesContainer.appendChild(renderComment(reply));
    });
    repliesHtml = repliesContainer.outerHTML;
  }

  const deleteButtonHtml = `<button type="button" class="delete-button" data-id="${comment.id}">Apagar</button>`;

  commentArticle.innerHTML = `
    <header class="comment-header">
      <strong class="comment-author">${sanitizeInput(comment.name)}</strong>
      <time datetime="${comment.created_at}">${formatDate(comment.created_at)}</time>
    </header>
    <p class="comment-body">${sanitizeInput(comment.message)}</p>
    <div class="comment-actions">
      <button type="button" class="reply-button" data-id="${comment.id}" data-name="${sanitizeInput(comment.name)}">Responder</button>
      ${deleteButtonHtml}
    </div>
    ${repliesHtml}
  `;

  commentArticle.querySelector(".reply-button").addEventListener("click", (e) => {
    replyingToId = e.target.dataset.id;
    replyingToName = e.target.dataset.name;
    document.getElementById("reply-info").textContent = `Respondendo a: ${replyingToName}`;
    document.getElementById("cancel-reply").style.display = "inline-block";
    document.getElementById("message").focus();
  });

  const deleteButton = commentArticle.querySelector(".delete-button");
  if (deleteButton) {
    deleteButton.addEventListener("click", async (e) => {
      const commentId = e.target.dataset.id;
      const adminToken = prompt("Para apagar, insira o token de administrador:");

      if (!adminToken) {
        alert("Exclusão cancelada. Token não fornecido.");
        return;
      }

      if (confirm("Tem certeza que deseja apagar este comentário e todas as suas respostas?")) {
        try {
          const response = await fetch(`${BACKEND_URL}/${commentId}`, {
            method: "DELETE",
            headers: {
              "X-Admin-Token": adminToken,
            },
          });

          if (response.status === 403) {
            alert("Acesso negado. Token de administrador inválido.");
            return;
          }

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          loadComments();
        } catch (err) {
          console.error("Erro ao deletar comentário:", err);
          alert("Ocorreu um erro ao deletar o comentário. Tente novamente.");
        }
      }
    });
  }

  return commentArticle;
}

function resetReplyState() {
  replyingToId = null;
  replyingToName = null;
  document.getElementById("reply-info").textContent = "";
  document.getElementById("cancel-reply").style.display = "none";
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
