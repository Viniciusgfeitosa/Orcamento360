const cadastroForm = document.getElementById("cadastroForm");
const msg = document.querySelector(".mensagem");

cadastroForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  const nome = document.getElementById("nome").value.trim();
  const email = document.getElementById("email").value.trim().toLowerCase();
  const senha = document.getElementById("senha").value;
  const confirmarSenha = document.getElementById("confirmarSenha").value;

  // Validação de senha mínima
  if (senha.length < 6) {
    msg.style.color = "red";
    msg.textContent = "A senha deve ter no mínimo 6 caracteres.";
    return;
  }

  // Confirmação de senha
  if (senha !== confirmarSenha) {
    msg.style.color = "red";
    msg.textContent = "As senhas não coincidem. Verifique e tente novamente.";
    return;
  }

  // Regex para validação de e-mail
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}$/;
  if (!emailRegex.test(email)) {
    msg.style.color = "red";
    msg.textContent = "Digite um email válido (ex: usuario@dominio.com)";
    return;
  }

  let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];

  if (usuarios.find(u => u.email === email)) {
    msg.style.color = "red";
    msg.textContent = "Este email já está cadastrado!";
    return;
  }

  // Hash da senha antes de armazenar
  const senhaHash = await hashPassword(senha);
  usuarios.push({ nome, email, senha: senhaHash });
  localStorage.setItem("usuarios", JSON.stringify(usuarios));

  msg.style.color = "green";
  msg.textContent = "Cadastro realizado com sucesso! Redirecionando para login...";

  cadastroForm.reset();

  setTimeout(() => {
    window.location.href = "../pagina-login/telalogin.html";
  }, 1500);
});
