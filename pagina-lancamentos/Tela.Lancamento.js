const tabela = document.getElementById('tabela-lancamentos');
const novoBtn = document.querySelector('.novo-lancamento');
const formLancamento = document.getElementById('formLancamento');
const lancamentoModal = new bootstrap.Modal(document.getElementById('lancamentoModal'));

// -------------------------
// INICIALIZAÇÃO DA PÁGINA
// -------------------------
window.addEventListener("load", () => {
  const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));
  if (!usuarioLogado) {
    window.location.href = "../pagina-inicial/index.html";
    return;
  }

  const prefersDark = carregarTemaSalvo();
  aplicarTemaGlobal(prefersDark);

  const switchElement = document.getElementById("darkModeSwitch");
  if (switchElement) {
    switchElement.addEventListener("change", (event) => {
      aplicarTemaGlobal(event.target.checked);
    });
  }

  renderTabela();
});

// -------------------------
// CRUD DE LANÇAMENTOS (por usuário via auth-utils)
// -------------------------
let lancamentos = [];

function carregarLancamentos() {
  lancamentos = getLancamentos();
  return lancamentos;
}

function formatarMoeda(valor) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function renderTabela() {
  carregarLancamentos();
  tabela.innerHTML = '';

  lancamentos.forEach((l, i) => {
    const valorClasse = l.tipo === 'Receita' ? 'text-success' : 'text-danger';
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${l.data}</td>
      <td>${l.descricao}</td>
      <td>${l.categoria}</td>
      <td class="${valorClasse}">${formatarMoeda(l.valor)}</td>
      <td>
        <span class="badge text-bg-${l.tipo === 'Receita' ? 'success' : 'danger'}">${l.tipo}</span>
      </td>
      <td>
        <button class="btn btn-sm btn-outline-danger btn-excluir" data-index="${i}" title="Excluir Lançamento">
          <i class="fas fa-trash-alt"></i>
        </button>
      </td>
    `;
    tabela.appendChild(row);
  });
}

function salvarLancamentos() {
  setLancamentos(lancamentos);
}

novoBtn.addEventListener('click', () => {
  formLancamento.reset();
  document.getElementById('data').value = new Date().toISOString().slice(0, 10);
  lancamentoModal.show();
});

formLancamento.addEventListener('submit', (e) => {
  e.preventDefault();

  const novo = {
    id: gerarId(),
    data: document.getElementById('data').value,
    descricao: document.getElementById('descricao').value,
    categoria: document.getElementById('categoria').value,
    valor: parseFloat(document.getElementById('valor').value) || 0,
    tipo: document.getElementById('tipo').value
  };

  carregarLancamentos();
  lancamentos.push(novo);
  salvarLancamentos();
  renderTabela();
  lancamentoModal.hide();
});

tabela.addEventListener('click', (e) => {
  if (e.target.closest('.btn-excluir')) {
    const index = parseInt(e.target.closest('.btn-excluir').dataset.index, 10);
    carregarLancamentos();
    if (confirm(`Excluir "${lancamentos[index].descricao}"?`)) {
      lancamentos.splice(index, 1);
      salvarLancamentos();
      renderTabela();
    }
  }
});

const btnSair = document.getElementById("btnSair");
if (btnSair) {
  btnSair.addEventListener("click", (e) => {
    e.preventDefault();
    localStorage.removeItem("usuarioLogado");
    window.location.href = "../pagina-inicial/index.html";
  });
}
