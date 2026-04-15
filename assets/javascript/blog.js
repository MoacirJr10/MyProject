document.addEventListener("DOMContentLoaded", () => {
  carregarPosts();
});

let todosPosts = [];
let tipoAtual = "noticia"; // Guarda o tipo de filtro atual (noticia ou projeto)

function sanitize(text) {
  const d = document.createElement("div");
  d.textContent = text || "";
  return d.innerHTML;
}

async function carregarPosts() {
  try {
    // Corrigido o caminho de "src/data/posts.json" para "data/posts.json"
    const response = await fetch("data/posts.json");
    if (!response.ok) throw new Error("Erro ao carregar o arquivo JSON");
    
    todosPosts = await response.json();
    filtrar(tipoAtual); // Padrão
  } catch (error) {
    console.error("Erro ao carregar posts:", error);
    document.getElementById("feed").innerHTML =
      "<p style='text-align:center; color:red;'>Erro ao carregar conteúdo. Verifique o console para mais detalhes.</p>";
  }
}

function renderizarPosts(posts) {
  const container = document.getElementById("feed");
  container.innerHTML = "";

  if (posts.length === 0) {
    container.innerHTML =
      "<p style='text-align:center; width:100%; color:var(--text-secondary)'>Nenhum conteúdo encontrado.</p>";
    return;
  }

  const fragment = document.createDocumentFragment();
  posts.forEach((post) => {
    const linkDestino = `./post.html?id=${post.id}`;

    const article = document.createElement("article");
    article.className = "card-post";

    const aImg = document.createElement("a");
    aImg.href = linkDestino;
    aImg.style.display = "block";
    aImg.style.overflow = "hidden";

    const img = document.createElement("img");
    img.src = post.imagem || "";
    img.alt = post.titulo || "";
    img.className = "card-img";
    aImg.appendChild(img);

    const content = document.createElement("div");
    content.className = "card-content";

    const meta = document.createElement("div");
    meta.className = "card-meta";
    meta.textContent = post.categoria || "";

    const h3 = document.createElement("h3");
    h3.className = "card-title";
    const aTitle = document.createElement("a");
    aTitle.href = linkDestino;
    aTitle.textContent = post.titulo || "";
    h3.appendChild(aTitle);

    const resumo = document.createElement("p");
    resumo.className = "card-resumo";
    resumo.textContent = post.resumo || "";

    const footer = document.createElement("div");
    footer.className = "card-footer";
    const spanDate = document.createElement("span");
    spanDate.textContent = post.data || "";
    const aLer = document.createElement("a");
    aLer.href = linkDestino;
    aLer.className = "btn-ler";
    aLer.textContent = "Ler";

    footer.appendChild(spanDate);
    footer.appendChild(aLer);

    content.appendChild(meta);
    content.appendChild(h3);
    content.appendChild(resumo);
    content.appendChild(footer);

    article.appendChild(aImg);
    article.appendChild(content);

    fragment.appendChild(article);
  });

  container.appendChild(fragment);
}

function filtrar(tipo) {
  tipoAtual = tipo; // Atualiza o tipo atual
  const botoes = document.querySelectorAll(".btn-filtro");
  botoes.forEach((btn) => {
    btn.classList.remove("ativo");
    // Verifica se o atributo onclick contém o tipo buscado
    const onclickAttr = btn.getAttribute("onclick");
    if (onclickAttr && onclickAttr.includes(`'${tipo}'`)) {
      btn.classList.add("ativo");
    }
  });

  // Limpa a busca ao trocar de aba
  const searchInput = document.getElementById("search-input");
  if (searchInput) searchInput.value = "";

  const filtrados = todosPosts.filter((p) => p.tipo === tipo);
  renderizarPosts(filtrados);
}

// NOVA FUNÇÃO DE BUSCA
function filtrarPorTexto() {
  const searchInput = document.getElementById("search-input");
  if (!searchInput) return;
  
  const termoBusca = searchInput.value.toLowerCase();

  // Filtra primeiro pelo tipo (Artigos/Projetos)
  const postsPorTipo = todosPosts.filter((p) => p.tipo === tipoAtual);

  // Depois, filtra pelo texto
  const resultadoFinal = postsPorTipo.filter((post) => {
    const titulo = (post.titulo || "").toLowerCase();
    const resumo = (post.resumo || "").toLowerCase();
    const categoria = (post.categoria || "").toLowerCase();

    return (
      titulo.includes(termoBusca) ||
      resumo.includes(termoBusca) ||
      categoria.includes(termoBusca)
    );
  });

  renderizarPosts(resultadoFinal);
}
