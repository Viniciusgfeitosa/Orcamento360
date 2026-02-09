/**
 * Utilitários compartilhados - Orçamento 360
 * Autenticação, armazenamento e tema
 */

// ==================== HASH DE SENHA (SHA-256) ====================
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Verifica se uma string parece ser um hash SHA-256 (64 caracteres hexadecimais)
function isHash(str) {
  return typeof str === 'string' && /^[a-f0-9]{64}$/i.test(str);
}

// Compara senha com valor armazenado (suporta hash ou texto legado)
async function comparePassword(inputPassword, storedValue) {
  if (isHash(storedValue)) {
    const inputHash = await hashPassword(inputPassword);
    return inputHash === storedValue;
  }
  return inputPassword === storedValue;
}

// ==================== LANÇAMENTOS POR USUÁRIO ====================
function getLancamentosKey(email) {
  return 'lancamentos_' + (email || '').replace(/[^a-zA-Z0-9@._-]/g, '_');
}

function getLancamentos() {
  const usuario = JSON.parse(localStorage.getItem('usuarioLogado') || 'null');
  const key = usuario ? getLancamentosKey(usuario.email) : 'lancamentos';
  let dados = JSON.parse(localStorage.getItem(key) || '[]');
  if (!Array.isArray(dados)) dados = [];
  // Migração: se usuário logado tem key vazia mas existe "lancamentos" global, usa esses dados
  if (usuario && dados.length === 0) {
    const globalData = JSON.parse(localStorage.getItem('lancamentos') || '[]');
    if (Array.isArray(globalData) && globalData.length > 0) {
      setLancamentos(globalData);
      return globalData;
    }
  }
  return dados;
}

function setLancamentos(lancamentos) {
  const usuario = JSON.parse(localStorage.getItem('usuarioLogado') || 'null');
  const key = usuario ? getLancamentosKey(usuario.email) : 'lancamentos';
  localStorage.setItem(key, JSON.stringify(lancamentos));
}

// Gera ID único para lançamento
function gerarId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

// ==================== TEMA PADRONIZADO (theme: 'light' | 'dark') ====================
function aplicarTemaGlobal(isDark) {
  const html = document.documentElement;
  const switchEl = document.getElementById('darkModeSwitch');
  if (isDark) {
    html.classList.add('dark-mode');
    if (switchEl) switchEl.checked = true;
    localStorage.setItem('theme', 'dark');
  } else {
    html.classList.remove('dark-mode');
    if (switchEl) switchEl.checked = false;
    localStorage.setItem('theme', 'light');
  }
}

function carregarTemaSalvo() {
  const saved = localStorage.getItem('theme');
  if (saved === 'dark') return true;
  if (saved === 'light') return false;
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
}
