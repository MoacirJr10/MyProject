const apiUrl = "http://localhost:3000/api/comments";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("comment-form");

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const name = document.getElementById("name").value.trim();
      const message = document.getElementById("message").value.trim();

      if (!name || !message) {
        alert("Preencha todos os campos.");
        return;
      }

      try {
        const res = await fetch(apiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, message }),
        });

        if (!res.ok) throw new Error("Erro ao enviar comentário");

        document.getElementById("name").value = "";
        document.getElementById("message").value = "";
        await loadComments();
      } catch (err) {
        console.error(err);
        alert("Erro ao enviar comentário.");
      }
    });

    loadComments();
  }
});

async function loadComments() {
  try {
    const res = await fetch(apiUrl);
    if (!res.ok) throw new Error("Erro ao carregar comentários");

    const data = await res.json();
    const commentsDiv = document.getElementById("comments");

    commentsDiv.innerHTML = data
      .map((c) => `<p><strong>${c.name}</strong>: ${c.message}</p>`)
      .join("");
  } catch (err) {
    console.error(err);
    document.getElementById("comments").innerHTML =
      "<p>Erro ao carregar comentários.</p>";
  }
}
