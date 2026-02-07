document.addEventListener('DOMContentLoaded', () => {
    carregarPosts();
});

let todosPosts = [];

async function carregarPosts() {
    try {
        const response = await fetch('src/data/posts.json');
        todosPosts = await response.json();
        // Carrega Artigos por padrão
        filtrar('noticia');
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
        // Lógica de Link Corrigida
        let linkDestino;

        if (post.tipo === 'projeto' && post.demo) {
            // Se for um App (ferramenta), vai direto para a página da ferramenta
            linkDestino = post.demo;
        } else {
            // Se for artigo ou projeto sem demo, vai para a página de detalhes
            // O './' garante que o navegador procure a partir da pasta atual (raiz)
            linkDestino = `./detalhes.html?id=${post.id}`;
        }

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
    const botoes = document.querySelectorAll('.btn-filtro');
    botoes.forEach(btn => {
        btn.classList.remove('ativo');
        if (btn.getAttribute('onclick').includes(tipo)) {
            btn.classList.add('ativo');
        }
    });

    const filtrados = todosPosts.filter(p => p.tipo === tipo);
    renderizarPosts(filtrados);
}
