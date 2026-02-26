document.addEventListener('DOMContentLoaded', () => {
    carregarPosts();
});

let todosPosts = [];
let tipoAtual = 'noticia'; // Guarda o tipo de filtro atual (noticia ou projeto)

async function carregarPosts() {
    try {
        const response = await fetch('src/data/posts.json');
        todosPosts = await response.json();
        filtrar(tipoAtual); // Padrão
    } catch (error) {
        console.error("Erro ao carregar posts:", error);
        document.getElementById('feed').innerHTML = "<p>Erro ao carregar conteúdo.</p>";
    }
}

function renderizarPosts(posts) {
    const container = document.getElementById('feed');
    container.innerHTML = '';

    if (posts.length === 0) {
        container.innerHTML = "<p style='text-align:center; width:100%; color:var(--text-secondary)'>Nenhum conteúdo encontrado.</p>";
        return;
    }

    posts.forEach(post => {
        const linkDestino = `./post.html?id=${post.id}`;

        const html = `
            <article class="card-post">
                <a href="${linkDestino}" style="display:block; overflow:hidden;">
                    <img src="${post.imagem}" alt="${post.titulo}" class="card-img">
                </a>
                <div class="card-content">
                    <div class="card-meta">${post.categoria}</div>
                    <h3 class="card-title">
                        <a href="${linkDestino}">${post.titulo}</a>
                    </h3>
                    <p class="card-resumo">${post.resumo}</p>
                    <div class="card-footer">
                        <span>${post.data}</span>
                        <a href="${linkDestino}" class="btn-ler">Ler</a>
                    </div>
                </div>
            </article>
        `;
        container.innerHTML += html;
    });
}

function filtrar(tipo) {
    tipoAtual = tipo; // Atualiza o tipo atual
    const botoes = document.querySelectorAll('.btn-filtro');
    botoes.forEach(btn => {
        btn.classList.remove('ativo');
        if (btn.getAttribute('onclick').includes(tipo)) {
            btn.classList.add('ativo');
        }
    });

    // Limpa a busca ao trocar de aba
    document.getElementById('search-input').value = '';

    const filtrados = todosPosts.filter(p => p.tipo === tipo);
    renderizarPosts(filtrados);
}

// NOVA FUNÇÃO DE BUSCA
function filtrarPorTexto() {
    const termoBusca = document.getElementById('search-input').value.toLowerCase();

    // Filtra primeiro pelo tipo (Artigos/Projetos)
    const postsPorTipo = todosPosts.filter(p => p.tipo === tipoAtual);

    // Depois, filtra pelo texto
    const resultadoFinal = postsPorTipo.filter(post => {
        const titulo = post.titulo.toLowerCase();
        const resumo = post.resumo.toLowerCase();
        const categoria = post.categoria.toLowerCase();

        return titulo.includes(termoBusca) ||
               resumo.includes(termoBusca) ||
               categoria.includes(termoBusca);
    });

    renderizarPosts(resultadoFinal);
}
