// URL do Cloudflare Tunnel
const BACKEND_URL = "https://trio-amp-studios-tone.trycloudflare.com/api/comments";

let replyingToId = null;
let replyingToName = null;
let userToken = null;

// Função chamada pelo Google após login
function handleCredentialResponse(response) {
    userToken = response.credential;

    try {
        const payload = JSON.parse(atob(response.credential.split('.')[1]));

        // Preenche nome
        document.getElementById("user-name").textContent = payload.name;

        // Preenche foto (com fallback se não tiver)
        const avatarImg = document.getElementById("user-avatar");
        if (payload.picture) {
            avatarImg.src = payload.picture;
        } else {
            avatarImg.src = "https://cdn-icons-png.flaticon.com/512/847/847969.png";
        }

        document.getElementById("name").value = payload.name;
        document.getElementById("name").readOnly = true;

        document.getElementById("google-login-container").style.display = "none";
        document.getElementById("user-info").style.display = "flex";

        // Recarrega para atualizar os botões de apagar (agora que sabemos quem é o usuário)
        loadComments();
    } catch (e) {
        console.error("Erro login:", e);
    }
}

function logout() {
    userToken = null;
    document.getElementById("name").value = "";
    document.getElementById("name").readOnly = false;
    document.getElementById("user-avatar").src = "";

    document.getElementById("google-login-container").style.display = "flex";
    document.getElementById("user-info").style.display = "none";

    // Recarrega para remover os botões de apagar
    loadComments();
}

document.addEventListener("DOMContentLoaded", () => {
  // CARREGA OS COMENTÁRIOS IMEDIATAMENTE (PÚBLICO)
  loadComments();

  const form = document.getElementById("comment-form");
  const cancelReplyButton = document.getElementById("cancel-reply");

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      // Verifica se está logado antes de deixar enviar
      if (!userToken) {
          alert("Por favor, faça login com o Google para comentar.");
          return;
      }

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
          token: userToken
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
        console.error("Erro envio:", err);
        alert("Não foi possível enviar seu comentário.");
      }
    });

    cancelReplyButton.addEventListener("click", resetReplyState);
  }
});

async function loadComments() {
  try {
    const commentsDiv = document.getElementById("comments");
    const commentList = commentsDiv.querySelector(".comment-list");

    const headers = {};
    if (userToken) {
        headers['Authorization'] = `Bearer ${userToken}`;
    }

    const response = await fetch(BACKEND_URL, {
        method: 'GET',
        headers: headers
    });

    if (!response.ok) throw new Error("Erro API");

    const comments = await response.json();

    commentList.innerHTML = "";

    if (comments.length === 0) {
        commentList.innerHTML = "<p style='opacity: 0.6; font-size: 0.9rem; text-align: center;'>Seja o primeiro a comentar!</p>";
    } else {
        comments.forEach((comment) => {
            commentList.appendChild(renderComment(comment));
        });
    }

    commentsDiv.setAttribute("aria-live", "polite");
  } catch (err) {
    console.error("Erro load:", err);
    const commentList = document.querySelector(".comment-list");
    if (commentList) {
        commentList.innerHTML = "<p style='text-align: center;'>Comentários indisponíveis no momento.</p>";
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

  let deleteButtonHtml = "";
  if (comment.can_delete) {
      deleteButtonHtml = `<button type="button" class="delete-button" data-id="${comment.id}" style="color: #ff4444; margin-left: 10px;">Apagar</button>`;
  }

  // Botão de responder só aparece se estiver logado?
  // Não, pode aparecer, mas ao clicar pede login. Vamos deixar visível.

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
    if (!userToken) {
        alert("Faça login para responder.");
        return;
    }
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

      if (confirm("Apagar comentário?")) {
        try {
          const response = await fetch(`${BACKEND_URL}/${commentId}`, {
            method: "DELETE",
            headers: {
              "Authorization": `Bearer ${userToken}`
            },
          });

          if (!response.ok) throw new Error("Erro delete");

          loadComments();
        } catch (err) {
          alert("Erro ao apagar.");
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
