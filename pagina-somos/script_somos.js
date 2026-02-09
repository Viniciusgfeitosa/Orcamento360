// Aguarda o carregamento completo do HTML antes de rodar o código
document.addEventListener("DOMContentLoaded", () => {
  console.log("Página 'Quem Somos' carregada com sucesso!");

  // Seleciona todos os membros da equipe
  const members = document.querySelectorAll(".member");

  // Percorre cada membro para adicionar uma interação simples
  members.forEach(member => {
    member.addEventListener("click", () => {
      alert(`Você clicou em ${member.querySelector("p").textContent}`);
    });
  });
});