let graficoPizza, graficoLinha;

document.getElementById("gerarRelatorio").addEventListener("click", abrirRelatorio);

function getTransacoes() {
  return getLancamentos();
}

function atualizarInterface() {
  const transacoes = getTransacoes();
  const receitas = somarTipo(transacoes, "receita");
  const despesas = somarTipo(transacoes, "despesa");
  const saldo = receitas - despesas;

  document.getElementById("valorReceitas").innerText = receitas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  document.getElementById("valorDespesas").innerText = despesas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const saldoElem = document.getElementById("valorSaldo");
  saldoElem.innerText = saldo.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  saldoElem.style.color = saldo >= 0 ? "#198754" : "#dc3545";

  atualizarLista();
  gerarGraficos();
}

function atualizarLista() {
  const transacoes = getTransacoes();
  const lista = document.getElementById("listaDetalhes");
  lista.innerHTML = "";

  if (transacoes.length === 0) {
    lista.innerHTML = `<li class="list-group-item text-muted">Nenhum dado disponível</li>`;
    return;
  }

  transacoes.slice().reverse().forEach((t, idxReversed) => {
    const idxOriginal = transacoes.length - 1 - idxReversed;
    const li = document.createElement("li");
    li.classList.add("list-group-item", "d-flex", "justify-content-between", "align-items-center");

    const ehReceita = (t.tipo || '').toLowerCase() === "receita";

    const texto = document.createElement("span");
    texto.innerText = `${t.data} — ${t.descricao} (${ehReceita ? "+" : "-"} ${t.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })})`;
    texto.classList.add(ehReceita ? "text-success" : "text-danger");

    const btnExcluir = document.createElement("button");
    btnExcluir.classList.add("btn", "btn-sm", "btn-outline-danger");
    btnExcluir.innerHTML = '<i class="fa-solid fa-trash"></i>';
    btnExcluir.onclick = () => excluirTransacao(idxOriginal);

    li.appendChild(texto);
    li.appendChild(btnExcluir);
    lista.appendChild(li);
  });
}

function excluirTransacao(idx) {
  const transacoes = getTransacoes();
  if (confirm("Deseja realmente excluir este lançamento?")) {
    transacoes.splice(idx, 1);
    setLancamentos(transacoes);
    atualizarInterface();
  }
}

function gerarGraficos() {
  const transacoes = getTransacoes();
  const ctxPizza = document.getElementById("graficoPizza");
  const ctxLinha = document.getElementById("graficoLinha");

  if (graficoPizza) graficoPizza.destroy();
  if (graficoLinha) graficoLinha.destroy();

  const labels = transacoes.length > 0 ? transacoes.map(t => t.descricao) : ['Sem dados'];
  const valores = transacoes.length > 0
    ? transacoes.map(t => (t.tipo || '').toLowerCase() === "receita" ? t.valor : -t.valor)
    : [1];
  const cores = labels.map(() => gerarCorAleatoria());

  if (ctxPizza) graficoPizza = new Chart(ctxPizza, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        data: valores.map(v => Math.abs(v)),
        backgroundColor: cores
      }]
    },
    options: {
      plugins: { legend: { position: 'bottom' } }
    }
  }) : null;

  const saldoPorData = transacoes.length > 0 ? calcularEvolucaoFinanceira(transacoes) : { 'Sem dados': 0 };

  if (ctxLinha) graficoLinha = new Chart(ctxLinha, {
    type: 'line',
    data: {
      labels: Object.keys(saldoPorData),
      datasets: [{
        label: 'Saldo acumulado',
        data: Object.values(saldoPorData),
        borderColor: '#198754',
        backgroundColor: 'rgba(25,135,84,0.2)',
        fill: true,
        tension: 0.3
      }]
    },
    options: {
      scales: { y: { beginAtZero: true } },
      plugins: { legend: { display: false } }
    }
  }) : null;
}

function calcularEvolucaoFinanceira(transacoes) {
  const porData = {};
  let saldoAcumulado = 0;

  const transOrd = transacoes
    .slice()
    .sort((a, b) => {
      const da = a.data ? new Date(a.data.split('/').reverse().join('-') || a.data) : new Date(0);
      const db = b.data ? new Date(b.data.split('/').reverse().join('-') || b.data) : new Date(0);
      return da - db;
    });

  transOrd.forEach(t => {
    const data = t.data || 'Sem data';
    if (!porData[data]) porData[data] = 0;
    saldoAcumulado += (t.tipo || '').toLowerCase() === "receita" ? t.valor : -t.valor;
    porData[data] = saldoAcumulado;
  });

  return porData;
}

function abrirRelatorio() {
  const transacoes = getTransacoes();
  const relatorio = document.getElementById("relatorioMensal");
  relatorio.innerHTML = "";

  if (transacoes.length === 0) {
    relatorio.innerHTML = `<li class="list-group-item text-muted">Nenhum lançamento neste mês.</li>`;
  } else {
    transacoes.forEach(t => {
      const ehReceita = (t.tipo || '').toLowerCase() === "receita";
      relatorio.innerHTML += `
        <li class="list-group-item d-flex justify-content-between align-items-center">
          <span>${t.data} — ${t.descricao}</span>
          <span class="${ehReceita ? "text-success" : "text-danger"}">
            ${ehReceita ? "+" : "-"} ${t.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </span>
        </li>
      `;
    });
  }

  new bootstrap.Modal(document.getElementById("modalRelatorio")).show();
}

function somarTipo(transacoes, tipo) {
  return transacoes
    .filter(t => (t.tipo || '').toLowerCase() === tipo.toLowerCase())
    .reduce((a, b) => a + b.valor, 0);
}

function gerarCorAleatoria() {
  const r = Math.floor(Math.random() * 180);
  const g = Math.floor(Math.random() * 180);
  const b = Math.floor(Math.random() * 180);
  return `rgb(${r},${g},${b})`;
}

window.addEventListener("load", () => {
  const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));
  if (!usuarioLogado) {
    window.location.href = "../pagina-inicial/index.html";
    return;
  }

  const prefersDark = carregarTemaSalvo();
  aplicarTemaGlobal(prefersDark);

  const switchEl = document.getElementById("darkModeSwitch");
  if (switchEl) {
    switchEl.addEventListener("change", (e) => {
      aplicarTemaGlobal(e.target.checked);
    });
  }

  const btnSair = document.getElementById("btnSair");
  if (btnSair) {
    btnSair.addEventListener("click", (e) => {
      e.preventDefault();
      localStorage.removeItem("usuarioLogado");
      window.location.href = "../pagina-inicial/index.html";
    });
  }

  atualizarInterface();
});

async function gerarRelatorioPDF() {
  const transacoes = getTransacoes();
  if (transacoes.length === 0) {
    alert("Nenhum dado disponível para gerar o PDF!");
    return;
  }

  if (typeof window.jspdf === 'undefined' || !window.jspdf.jsPDF) {
    alert("Biblioteca de PDF não carregada. Verifique sua conexão.");
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const receitas = somarTipo(transacoes, "receita");
  const despesas = somarTipo(transacoes, "despesa");
  const saldo = receitas - despesas;

  doc.setFontSize(18);
  doc.text("Relatório Financeiro Mensal", 20, 20);
  doc.setFontSize(12);
  doc.text(`Gerado em: ${new Date().toLocaleDateString("pt-BR")}`, 20, 30);

  let y = 50;
  doc.text("Data", 20, y);
  doc.text("Descrição", 60, y);
  doc.text("Tipo", 140, y);
  doc.text("Valor (R$)", 170, y);
  y += 10;

  transacoes.forEach(t => {
    const ehReceita = (t.tipo || '').toLowerCase() === "receita";
    doc.text(t.data || '', 20, y);
    doc.text((t.descricao || '').substring(0, 25), 60, y);
    doc.text(ehReceita ? "Receita" : "Despesa", 140, y);
    doc.text((t.valor || 0).toFixed(2), 170, y, { align: "right" });
    y += 8;

    if (y > 270) {
      doc.addPage();
      y = 20;
    }
  });

  y += 10;
  doc.line(20, y, 190, y);
  y += 10;
  doc.text(`Total Receitas: R$ ${receitas.toFixed(2)}`, 20, y);
  y += 8;
  doc.text(`Total Despesas: R$ ${despesas.toFixed(2)}`, 20, y);
  y += 8;
  doc.text(`Saldo Final: R$ ${saldo.toFixed(2)}`, 20, y);

  doc.save("relatorio_mensal.pdf");
}
