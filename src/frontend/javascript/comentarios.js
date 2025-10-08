const BACKEND_BASE_URL = "https://myproject-8k82.onrender.com"; // ATUALIZE ESTA URL QUANDO FIZER O DEPLOY DO BACKEND!
const COMMENTS_API_URL = `${BACKEND_BASE_URL}/api/comments`;
const AUTH_API_URL = `${BACKEND_BASE_URL}/api/auth/google`;

let replyingToId = null;
let replyingToName = null;

// Variáveis para o estado de autenticação
let currentUser = null; // { token, isAdmin, name, email }

// Função global para lidar com a resposta do Google Sign-In
window.handleCredentialResponse = async (response) => {
  if (response.credential) {
    try {
      const res = await fetch(AUTH_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id_token: response.credential }),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      currentUser = data; // Armazena as informações do usuário
      localStorage.setItem("userToken", data.token);
      localStorage.setItem("isAdmin", data.isAdmin);
      localStorage.setItem("userName", data.name);
      localStorage.setItem("userEmail", data.email);

      updateUIOnLogin();
      loadComments(); // Recarrega comentários para atualizar botões de exclusão
    } catch (error) {
      console.error("Erro ao autenticar com o backend:", error);
      alert("Falha na autenticação. Tente novamente.");
    }
  }
};

function logout() {
  currentUser = null;
  localStorage.removeItem("userToken");
  localStorage.removeItem("isAdmin");
  localStorage.removeItem("userName");
  localStorage.removeItem("userEmail");
  updateUIOnLogout();
  loadComments(); // Recarrega comentários para remover botões de exclusão
}

function updateUIOnLogin() {
  document.getElementById("g_id_signin").style.display = "none";
  document.getElementById("logout-button").style.display = "inline-block";
  document.getElementById("user-info").textContent = `Logado como: ${currentUser.name} (${currentUser.email})`;
  document.getElementById("user-info").style.display = "block";
  // Preenche o campo de nome do formulário se o usuário estiver logado
  document.getElementById("name").value = currentUser.name;
  document.getElementById("name").readOnly = true; // Torna o campo somente leitura
}

function updateUIOnLogout() {
  document.getElementById("g_id_signin").style.display = "block";
  document.getElementById("logout-button").style.display = "none";
  document.getElementById("user-info").style.display = "none";
  document.getElementById("user-info").textContent = "";
  document.getElementById("name").value = "";
  document.getElementById("name").readOnly = false;
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("comment-form");
  const cancelReplyButton = document.getElementById("cancel-reply");
  const logoutButton = document.getElementById("logout-button");

  // Tenta carregar o estado do usuário do localStorage
  const storedToken = localStorage.getItem("userToken");
  const storedIsAdmin = localStorage.getItem("isAdmin") === "true"; // Converte para booleano
  const storedUserName = localStorage.getItem("userName");
  const storedUserEmail = localStorage.getItem("userEmail");

  if (storedToken && storedUserName && storedUserEmail) {
    currentUser = {
      token: storedToken,
      isAdmin: storedIsAdmin,
      name: storedUserName,
      email: storedUserEmail,
    };
    updateUIOnLogin();
  } else {
    updateUIOnLogout();
  }

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

        const response = await fetch(COMMENTS_API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(commentData),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        document.getElementById("name").value = currentUser ? currentUser.name : "";
        document.getElementById("message").value = "";
        resetReplyState();
        loadComments();
      } catch (err) {
        console.error("Erro ao enviar comentário:", err);
        alert("Ocorreu um erro ao enviar o comentário. Tente novamente.");
      }
    });

    cancelReplyButton.addEventListener("click", resetReplyState);
    logoutButton.addEventListener("click", logout);

    loadComments();
  }
});

async function loadComments() {
  try {
    const commentsDiv = document.getElementById("comments");
    const commentList = commentsDiv.querySelector(".comment-list");

    const response = await fetch(COMMENTS_API_URL);
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

  const deleteButtonHtml = (currentUser && currentUser.isAdmin)
    ? `<button type="button" class="delete-button" data-id="${comment.id}">Apagar</button>`
    : "";

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

  // Adiciona listener para o botão de apagar APENAS se ele existir
  const deleteButton = commentArticle.querySelector(".delete-button");
  if (deleteButton) {
    deleteButton.addEventListener("click", async (e) => {
      const commentId = e.target.dataset.id;

      if (!currentUser || !currentUser.isAdmin || !currentUser.token) {
        alert("Você não tem permissão para apagar comentários.");
        return;
      }

      if (confirm("Tem certeza que deseja apagar este comentário e todas as suas respostas?")) {
        try {
          const response = await fetch(`${COMMENTS_API_URL}/${commentId}`, {
            method: "DELETE",
            headers: {
              "Authorization": `Bearer ${currentUser.token}`, // Envia o JWT
            },
          });

          if (response.status === 403) {
            alert("Acesso negado. Você não é o administrador.");
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
