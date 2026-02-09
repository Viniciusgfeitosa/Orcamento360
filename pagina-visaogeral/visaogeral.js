// ==========================================================
// LÓGICA DE TEMA CLARO/ESCURO (usa auth-utils.js)
// ==========================================================

function renderizarDashboard() {
  const lancamentos = getLancamentos();

  let totalReceitas = 0;
  let totalDespesas = 0;

  lancamentos.forEach(l => {
    if (l.tipo === 'Receita') totalReceitas += l.valor;
    if (l.tipo === 'Despesa') totalDespesas += l.valor;
  });

  const saldoAtual = totalReceitas - totalDespesas;

  const cards = document.querySelectorAll('.conteudo-cartao-vazio');
  if (cards.length >= 3) {
    cards[0].innerHTML = `<h4 class="text-success">${saldoAtual.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</h4>`;
    cards[1].innerHTML = `<h5 class="text-primary">${totalReceitas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</h5>`;
    cards[2].innerHTML = `<h5 class="text-danger">${totalDespesas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</h5>`;
  }

  const despesas = lancamentos.filter(l => l.tipo === 'Despesa');
  despesas.sort((a, b) => b.valor - a.valor);

  if (cards.length > 3) {
    if (despesas.length === 0) {
      cards[3].innerHTML = `<p class="text-muted">Nenhuma despesa registrada ainda.</p>`;
    } else {
      const top5 = despesas.slice(0, 5);
      const lista = top5.map(d => `
        <div class="d-flex justify-content-between border-bottom py-1">
          <span>${d.descricao}</span>
          <strong class="text-danger">-${d.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong>
        </div>
      `).join('');
      cards[3].innerHTML = lista;
    }
  }

  if (cards.length > 4) {
    const categorias = {};
    despesas.forEach(d => {
      categorias[d.categoria] = (categorias[d.categoria] || 0) + d.valor;
    });

    const nomesCategorias = Object.keys(categorias);
    const valoresCategorias = Object.values(categorias);

    if (nomesCategorias.length === 0) {
      cards[4].innerHTML = `<p class="text-muted">Nenhuma despesa para exibir no gráfico.</p>`;
    } else {
      const isDarkMode = document.documentElement.classList.contains('dark-mode');
      const textColor = isDarkMode ? '#f8f9fa' : '#212529';
      const gridColor = isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)';

      cards[4].innerHTML = `<canvas id="graficoGastos" style="max-height: 250px;"></canvas>`;

      const ctx = document.getElementById('graficoGastos');
      new Chart(ctx, {
        type: 'bar',
        data: {
          labels: nomesCategorias,
          datasets: [{
            label: 'Despesas por Categoria',
            data: valoresCategorias,
            backgroundColor: 'rgba(220, 53, 69, 0.7)',
            borderRadius: 4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                color: textColor,
                callback: (value) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
              },
              grid: { color: gridColor }
            },
            x: {
              ticks: { color: textColor },
              grid: { color: gridColor }
            }
          },
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: (context) => {
                  let label = context.dataset.label || '';
                  if (label) label += ': ';
                  if (context.parsed.y !== null) {
                    label += context.parsed.y.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
                  }
                  return label;
                }
              }
            }
          }
        }
      });
    }
  }
}

// ==========================================================
// INICIALIZAÇÃO
// ==========================================================

window.addEventListener("load", () => {
  const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));
  if (!usuarioLogado) {
    window.location.href = "../pagina-inicial/index.html";
    return;
  }

  const prefersDark = carregarTemaSalvo();
  aplicarTemaGlobal(prefersDark);
  renderizarDashboard();

  const switchElement = document.getElementById('darkModeSwitch');
  if (switchElement) {
    switchElement.addEventListener('change', (event) => {
      aplicarTemaGlobal(event.target.checked);
      renderizarDashboard();
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
});
