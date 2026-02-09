const loginForm = document.getElementById("loginForm");
const msg = document.querySelector(".mensagem");

// Redireciona se já estiver logado
window.addEventListener("load", () => {
  const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));
  if (usuarioLogado) {
    window.location.href = "../pagina-visaogeral/visaogeral.html";
  }
});

loginForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  const email = document.getElementById("email").value.trim().toLowerCase();
  const senha = document.getElementById("senha").value;

  let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
  const usuarioValido = usuarios.find(u => u.email === email);

  if (usuarioValido && await comparePassword(senha, usuarioValido.senha)) {
    msg.style.color = "green";
    msg.textContent = `Bem-vindo, ${usuarioValido.nome}! Redirecionando...`;

    // Armazena usuário logado sem a senha (segurança)
    const { senha: _, ...usuarioSemSenha } = usuarioValido;
    localStorage.setItem("usuarioLogado", JSON.stringify(usuarioSemSenha));

    setTimeout(() => {
      window.location.href = "../pagina-visaogeral/visaogeral.html";
    }, 1500);
  } else {
    msg.style.color = "red";
    msg.textContent = "Email ou senha incorretos!";
  }
});
