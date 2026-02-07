// URL do Cloudflare Tunnel
const BACKEND_URL = "https://trio-amp-studios-tone.trycloudflare.com/api/comments";

// Variáveis de estado
let replyingToId = null;
let replyingToName = null;
let userToken = null;
let userEmail = null;

// Função chamada pelo Google após login
function handleCredentialResponse(response) {
    userToken = response.credential;

    // Decodifica o token apenas para mostrar o nome na tela (Visual)
    // A validação de segurança real acontece no Backend
    try {
        const payload = JSON.parse(atob(response.credential.split('.')[1]));
        userEmail = payload.email;

        document.getElementById("user-name").textContent = payload.name;
        document.getElementById("name").value = payload.name;
        document.getElementById("name").readOnly = true;

        document.getElementById("google-login-container").style.display = "none";
        document.getElementById("user-info").style.display = "block";

        loadComments();
    } catch (e) {
        console.error("Erro ao processar login", e);
    }
}

function logout() {
    userToken = null;
    userEmail = null;
    document.getElementById("name").value = "";
    document.getElementById("name").readOnly = false;

    document.getElementById("google-login-container").style.display = "flex";
    document.getElementById("user-info").style.display = "none";

    loadComments();
}

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
          token: userToken // Envia o token criptografado do Google
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

        document.getElementById("message").value = "";
        resetReplyState();
        loadComments();
      } catch (err) {
        console.error("Erro técnico:", err);
        alert("Não foi possível enviar seu comentário no momento.");
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
    console.error("Erro técnico ao carregar:", err);
    const commentList = document.querySelector(".comment-list");
    if (commentList) {
        commentList.innerHTML = "<p>Os comentários estão indisponíveis no momento.</p>";
    }
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

  // Lógica do Botão de Apagar
  let deleteButtonHtml = "";

  // Se o usuário estiver logado, mostramos o botão.
  // Se ele clicar e não for o dono/admin, o servidor bloqueia e retorna erro.
  if (userToken) {
      deleteButtonHtml = `<button type="button" class="delete-button" data-id="${comment.id}" style="background-color: #ff4444; margin-left: 10px;">Apagar</button>`;
  }

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

      if (confirm("Deseja apagar este comentário?")) {
        try {
          const response = await fetch(`${BACKEND_URL}/${commentId}`, {
            method: "DELETE",
            headers: {
              "Authorization": `Bearer ${userToken}` // Envia o token para validação no servidor
            },
          });

          if (response.status === 403 || response.status === 401) {
            alert("Você não tem permissão para apagar este comentário.");
            return;
          }

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          loadComments();
        } catch (err) {
          console.error("Erro ao deletar:", err);
          alert("Não foi possível apagar o comentário.");
        }
      }
    });
  }

  return commentArticle;
}

function resetReplyState() {
  replyingToId = null;
  replyingToName = null;
  const replyInfo = document.getElementById("reply-info");
  const cancelBtn = document.getElementById("cancel-reply");

  if(replyInfo) replyInfo.textContent = "";
  if(cancelBtn) cancelBtn.style.display = "none";
}

function formatDate(isoString) {
  if (!isoString) return "";
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
