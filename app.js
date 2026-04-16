/**
 * ASAMBLEA APP - app.js
 * Gestor de tiempos para Asamblea de Circuito 2025-2026
 * "Tienen que adorarlo con espíritu y con verdad" - Juan 4:24
 */

// ============================================================
// DATOS PRECARGADOS DEL PROGRAMA (CA-copgm26-S)
// ============================================================
const PROGRAMA_INICIAL = [
  // --- MAÑANA ---
  { sesion: 'manana', tipo: 'musica',   tema: 'Música de fondo',                                    duracion: 10 },
  { sesion: 'manana', tipo: 'oracion',  tema: 'Canción 85 y oración',                               duracion: 10 },
  { sesion: 'manana', tipo: 'discurso', tema: '"El Padre sin duda está buscando a personas así"',    duracion: 15 },
  { sesion: 'manana', tipo: 'discurso', tema: 'Serie: Adoremos a Dios "con espíritu" — cuando tratemos de entender su guía', duracion: 15 },
  { sesion: 'manana', tipo: 'discurso', tema: 'Serie: Adoremos a Dios "con espíritu" — cuando estemos desanimados',         duracion: 15 },
  { sesion: 'manana', tipo: 'discurso', tema: 'Serie: Adoremos a Dios "con espíritu" — cuando queramos hacer más por Jehová', duracion: 15 },
  { sesion: 'manana', tipo: 'anuncio',  tema: 'Canción 88 y anuncios',                              duracion: 10 },
  { sesion: 'manana', tipo: 'discurso', tema: '¿Cómo "damos a conocer la verdad"?',                 duracion: 20 },
  { sesion: 'manana', tipo: 'bautismo', tema: 'Discurso de bautismo: El significado de su bautismo', duracion: 30 },
  { sesion: 'manana', tipo: 'musica',   tema: 'Canción 51',                                         duracion: 5  },
  // --- TARDE ---
  { sesion: 'tarde',  tipo: 'musica',   tema: 'Música de fondo',                                    duracion: 10 },
  { sesion: 'tarde',  tipo: 'oracion',  tema: 'Canción 72 y oración',                               duracion: 5  },
  { sesion: 'tarde',  tipo: 'discurso', tema: 'Discurso público: Cómo distinguir lo que está bien de lo que está mal', duracion: 30 },
  { sesion: 'tarde',  tipo: 'discurso', tema: 'Resumen de La Atalaya',                              duracion: 30 },
  { sesion: 'tarde',  tipo: 'anuncio',  tema: 'Canción 56 y anuncios',                              duracion: 10 },
  { sesion: 'tarde',  tipo: 'discurso', tema: 'Serie: Adoremos a Dios "con verdad" — en la familia',               duracion: 15 },
  { sesion: 'tarde',  tipo: 'discurso', tema: 'Serie: Adoremos a Dios "con verdad" — en un mundo dividido',        duracion: 15 },
  { sesion: 'tarde',  tipo: 'discurso', tema: 'Serie: Adoremos a Dios "con verdad" — cuando tengamos problemas económicos', duracion: 15 },
  { sesion: 'tarde',  tipo: 'discurso', tema: '"Compra la verdad y nunca la vendas"',               duracion: 30 },
  { sesion: 'tarde',  tipo: 'oracion',  tema: 'Canción 29 y oración',                               duracion: 5  },
];

// Emojis por tipo
const TIPO_EMOJI = {
  discurso: '🎤',
  musica:   '🎵',
  anuncio:  '📢',
  oracion:  '🙏',
  bautismo: '💧',
};

// ============================================================
// ESTADO Y STORAGE
// ============================================================
let state = {
  discursos: [],    // Lista de discursos
  timers: {},       // { id: { interval, elapsed, startTs, running } }
  darkMode: false,
  fontSize: 100,    // Porcentaje: 80 a 140
  header: {
    badge: 'Asamblea de Circuito 2025–2026',
    title: '"Tienen que adorarlo con espíritu y con verdad"',
    verse: 'Juan 4:24',
  },
};

// Valores por defecto del header (para resetear)
const HEADER_DEFAULT = {
  badge: 'Asamblea de Circuito 2025–2026',
  title: '"Tienen que adorarlo con espíritu y con verdad"',
  verse: 'Juan 4:24',
};

// --- Persistencia con LocalStorage ---
function saveState() {
  const toSave = {
    discursos: state.discursos,
    darkMode: state.darkMode,
    fontSize: state.fontSize,
    header: state.header,
    // Guardamos el tiempo transcurrido (no el interval)
    timersData: Object.fromEntries(
      Object.entries(state.timers).map(([id, t]) => [id, {
        elapsed: t.elapsed + (t.running ? Date.now() - t.startTs : 0),
        running: false // Siempre falso al restaurar
      }])
    )
  };
  localStorage.setItem('asamblea_app_v2', JSON.stringify(toSave));
}

function loadState() {
  try {
    const raw = localStorage.getItem('asamblea_app_v2');
    if (raw) {
      const saved = JSON.parse(raw);
      state.discursos = saved.discursos || [];
      state.darkMode  = saved.darkMode  || false;
      state.fontSize  = saved.fontSize  || 100;
      state.header    = saved.header    || { ...HEADER_DEFAULT };
      // Restaurar timers
      state.timers = {};
      if (saved.timersData) {
        Object.entries(saved.timersData).forEach(([id, t]) => {
          state.timers[id] = { elapsed: t.elapsed || 0, running: false, interval: null, startTs: 0 };
        });
      }
      return true;
    }
  } catch(e) { console.warn('Error al cargar estado:', e); }
  return false;
}

// ============================================================
// HELPERS
// ============================================================
function generateId() {
  return 'id_' + Date.now() + '_' + Math.random().toString(36).slice(2,7);
}

function formatTime(ms) {
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) return `${pad(h)}:${pad(m)}:${pad(s)}`;
  return `${pad(m)}:${pad(s)}`;
}

function pad(n) { return String(n).padStart(2, '0'); }

function formatHora(ts) {
  if (!ts) return '—';
  const d = new Date(ts);
  return d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function showToast(msg, duration = 2500) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), duration);
}

function getTimer(id) {
  if (!state.timers[id]) {
    state.timers[id] = { elapsed: 0, running: false, interval: null, startTs: 0 };
  }
  return state.timers[id];
}

// ============================================================
// RENDER
// ============================================================
function render() {
  renderSession('manana');
  renderSession('tarde');
  applyDarkMode();
  applyFontSize();
  applyHeader();
}

function renderSession(sesion) {
  const list = document.getElementById('list-' + sesion);
  if (!list) return;
  list.innerHTML = '';
  const items = state.discursos.filter(d => d.sesion === sesion);
  items.forEach(d => {
    list.appendChild(createCard(d));
  });
}

function createCard(d) {
  const timer = getTimer(d.id);
  const elapsed = timer.elapsed + (timer.running ? Date.now() - timer.startTs : 0);
  const isDone = !!d.horaFin;
  const isRunning = timer.running;

  const card = document.createElement('div');
  card.className = 'disco-card' + (isRunning ? ' running' : '') + (isDone && !isRunning ? ' done' : '');
  card.id = 'card-' + d.id;

  const emoji = TIPO_EMOJI[d.tipo] || '🎤';

  card.innerHTML = `
    <div class="disco-card-head">
      <div class="disco-tipo-badge" title="${d.tipo}">${emoji}</div>
      <div class="disco-info">
        <div class="disco-tema">${escapeHtml(d.tema)}</div>
        <div class="disco-orador-display">
          ${d.orador
            ? `<svg viewBox="0 0 24 24" width="11" height="11"><path fill="currentColor" d="M12 12c2.7 0 5-2.3 5-5s-2.3-5-5-5-5 2.3-5 5 2.3 5 5 5zm0 2c-3.3 0-10 1.7-10 5v2h20v-2c0-3.3-6.7-5-10-5z"/></svg> ${escapeHtml(d.orador)}`
            : '<span style="opacity:0.5">Sin orador asignado</span>'
          }
          ${d.duracion ? ` &nbsp;·&nbsp; ~${d.duracion} min` : ''}
        </div>
      </div>
      <div class="disco-card-actions">
        <button class="btn btn-share btn-sm" onclick="App.shareDiscurso('${d.id}')" title="Copiar al portapapeles">
          <svg viewBox="0 0 24 24" width="14" height="14"><path fill="currentColor" d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>
        </button>
        <button class="btn btn-ghost btn-sm" onclick="App.editDisco('${d.id}')" title="Editar">✏️</button>
        <button class="btn btn-danger btn-sm" onclick="App.deleteDisco('${d.id}')" title="Eliminar">🗑️</button>
      </div>
    </div>

    <div class="disco-fields">
      <div class="disco-field">
        <label>🎤 Orador</label>
        <input type="text" value="${escapeHtml(d.orador || '')}" placeholder="Nombre..." 
               onchange="App.updateField('${d.id}', 'orador', this.value)" />
      </div>
      <div class="disco-field timer-display" id="timer-display-${d.id}">
        <label>⏱ Tiempo</label>
        <span id="timer-${d.id}">${formatTime(elapsed)}</span>
      </div>
      <div class="disco-field">
        <label>🕐 Hora inicio</label>
        <span id="inicio-${d.id}">${d.horaInicio ? formatHora(d.horaInicio) : '—'}</span>
      </div>
      <div class="disco-field">
        <label>🕐 Hora fin</label>
        <span id="fin-${d.id}">${d.horaFin ? formatHora(d.horaFin) : '—'}</span>
      </div>
      <div class="disco-field full">
        <label>📝 Observaciones</label>
        <textarea class="disco-obs" placeholder="Notas, comentarios..."
          onchange="App.updateField('${d.id}', 'obs', this.value)">${escapeHtml(d.obs || '')}</textarea>
      </div>
    </div>

    <div class="disco-timer-controls">
      ${isRunning
        ? `<button class="btn-stop" onclick="App.stopTimer('${d.id}')">
             <svg viewBox="0 0 24 24" width="12" height="12"><path fill="currentColor" d="M6 6h12v12H6z"/></svg>
             Stop
           </button>`
        : `<button class="btn-start" onclick="App.startTimer('${d.id}')">
             <svg viewBox="0 0 24 24" width="12" height="12"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>
             Start
           </button>`
      }
      <button class="btn-reset" onclick="App.resetTimer('${d.id}')">↺ Reset</button>
    </div>
  `;

  return card;
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ============================================================
// TIMER LOGIC
// ============================================================
function startTimerInterval(id) {
  const timer = getTimer(id);
  if (timer.interval) clearInterval(timer.interval);

  timer.interval = setInterval(() => {
    const el = document.getElementById('timer-' + id);
    if (el) {
      const elapsed = timer.elapsed + (Date.now() - timer.startTs);
      el.textContent = formatTime(elapsed);
    }
  }, 500);
}

// ============================================================
// APP NAMESPACE
// ============================================================
const App = {

  // --- Inicializar ---
  init() {
    const loaded = loadState();
    if (!loaded || state.discursos.length === 0) {
      // Primera vez: cargar programa predeterminado
      state.discursos = PROGRAMA_INICIAL.map(p => ({
        id: generateId(),
        sesion: p.sesion,
        tipo: p.tipo,
        tema: p.tema,
        orador: '',
        duracion: p.duracion,
        horaInicio: null,
        horaFin: null,
        obs: '',
      }));
      // Pequeño delay para que los IDs sean únicos
      state.discursos = state.discursos.map((d, i) => ({
        ...d,
        id: 'id_init_' + i + '_' + Date.now()
      }));
    }
    render();
  },

  // --- Cronómetro: Start ---
  startTimer(id) {
    const timer = getTimer(id);
    if (timer.running) return;

    const disco = state.discursos.find(d => d.id === id);
    if (!disco) return;

    timer.running = true;
    timer.startTs = Date.now();
    if (!disco.horaInicio) {
      disco.horaInicio = Date.now();
    }
    startTimerInterval(id);
    saveState();
    rerenderCard(id);
    showToast('⏱ Cronómetro iniciado');
  },

  // --- Cronómetro: Stop ---
  stopTimer(id) {
    const timer = getTimer(id);
    if (!timer.running) return;

    const disco = state.discursos.find(d => d.id === id);
    if (!disco) return;

    timer.elapsed += Date.now() - timer.startTs;
    timer.running = false;
    if (timer.interval) clearInterval(timer.interval);
    disco.horaFin = Date.now();
    saveState();
    rerenderCard(id);
    showToast('⏹ Cronómetro detenido');
  },

  // --- Cronómetro: Reset ---
  resetTimer(id) {
    if (!confirm('¿Reiniciar cronómetro de este discurso?')) return;
    const timer = getTimer(id);
    if (timer.interval) clearInterval(timer.interval);
    state.timers[id] = { elapsed: 0, running: false, interval: null, startTs: 0 };

    const disco = state.discursos.find(d => d.id === id);
    if (disco) { disco.horaInicio = null; disco.horaFin = null; }
    saveState();
    rerenderCard(id);
    showToast('↺ Cronómetro reiniciado');
  },

  // --- Actualizar campo ---
  updateField(id, field, value) {
    const disco = state.discursos.find(d => d.id === id);
    if (disco) { disco[field] = value; saveState(); }
  },

  // --- Mostrar modal para agregar ---
  addDiscoForm() {
    document.getElementById('editId').value = '';
    document.getElementById('modalTitle').textContent = 'Nuevo Discurso';
    document.getElementById('formTema').value = '';
    document.getElementById('formOrador').value = '';
    document.getElementById('formSesion').value = 'manana';
    document.getElementById('formTipo').value = 'discurso';
    document.getElementById('formDuracion').value = '';
    document.getElementById('modalOverlay').classList.add('open');
    setTimeout(() => document.getElementById('formTema').focus(), 100);
  },

  // --- Editar discurso existente ---
  editDisco(id) {
    const disco = state.discursos.find(d => d.id === id);
    if (!disco) return;
    document.getElementById('editId').value = id;
    document.getElementById('modalTitle').textContent = 'Editar Discurso';
    document.getElementById('formTema').value = disco.tema;
    document.getElementById('formOrador').value = disco.orador || '';
    document.getElementById('formSesion').value = disco.sesion;
    document.getElementById('formTipo').value = disco.tipo;
    document.getElementById('formDuracion').value = disco.duracion || '';
    document.getElementById('modalOverlay').classList.add('open');
  },

  // --- Guardar desde modal ---
  saveDiscoForm() {
    const tema = document.getElementById('formTema').value.trim();
    if (!tema) { showToast('⚠️ El tema es obligatorio'); return; }

    const id = document.getElementById('editId').value;
    if (id) {
      // Editar
      const disco = state.discursos.find(d => d.id === id);
      if (disco) {
        disco.tema     = tema;
        disco.orador   = document.getElementById('formOrador').value.trim();
        disco.sesion   = document.getElementById('formSesion').value;
        disco.tipo     = document.getElementById('formTipo').value;
        disco.duracion = parseInt(document.getElementById('formDuracion').value) || 0;
      }
      showToast('✏️ Discurso actualizado');
    } else {
      // Nuevo
      const newDisco = {
        id:         generateId(),
        tema:       tema,
        orador:     document.getElementById('formOrador').value.trim(),
        sesion:     document.getElementById('formSesion').value,
        tipo:       document.getElementById('formTipo').value,
        duracion:   parseInt(document.getElementById('formDuracion').value) || 0,
        horaInicio: null,
        horaFin:    null,
        obs:        '',
      };
      state.discursos.push(newDisco);
      showToast('✅ Discurso agregado');
    }
    saveState();
    this.closeModal();
    render();
  },

  // --- Eliminar ---
  deleteDisco(id) {
    if (!confirm('¿Eliminar este discurso?')) return;
    const timer = state.timers[id];
    if (timer && timer.interval) clearInterval(timer.interval);
    delete state.timers[id];
    state.discursos = state.discursos.filter(d => d.id !== id);
    saveState();
    render();
    showToast('🗑️ Discurso eliminado');
  },

  // --- Compartir discurso (copiar al portapapeles) ---
  shareDiscurso(id) {
    const disco = state.discursos.find(d => d.id === id);
    if (!disco) return;

    const timer = getTimer(id);
    const elapsed = timer.elapsed;

    // Construir el texto con solo los campos que tienen datos
    const sesionLabel = disco.sesion === 'manana' ? '🌅 Mañana' : '🌤️ Tarde';
    const lines = [];

    lines.push('📋 *' + disco.tema + '*');
    lines.push('Sesión: ' + sesionLabel);

    if (disco.orador)    lines.push('🎤 Orador: ' + disco.orador);
    if (disco.horaInicio) lines.push('🕐 Inicio: ' + formatHora(disco.horaInicio));
    if (disco.horaFin)    lines.push('🕐 Fin:    ' + formatHora(disco.horaFin));
    if (elapsed > 0)      lines.push('⏱ Tiempo: ' + formatTime(elapsed));
    if (disco.obs && disco.obs.trim()) lines.push('📝 Obs: ' + disco.obs.trim());

    // Pie con nombre de la asamblea
    lines.push('');
    lines.push('— ' + (state.header.badge || 'Asamblea de Circuito'));

    const texto = lines.join('\n');

    // Copiar al portapapeles
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(texto)
        .then(() => {
          showToast('📋 ¡Copiado al portapapeles!');
          // Feedback visual en el botón
          const card = document.getElementById('card-' + id);
          if (card) {
            const btn = card.querySelector('.btn-share');
            if (btn) {
              btn.classList.add('copied');
              setTimeout(() => btn.classList.remove('copied'), 1800);
            }
          }
        })
        .catch(() => fallbackCopy(texto));
    } else {
      fallbackCopy(texto);
    }
  },

  // --- Cerrar modal ---
  closeModal() {
    document.getElementById('modalOverlay').classList.remove('open');
  },

  // --- Tamaño de texto ---
  changeFontSize(delta) {
    // Pasos de 5%, rango 70% a 150%
    const next = state.fontSize + (delta * 5);
    if (next < 70 || next > 150) {
      showToast(next < 70 ? '⚠️ Tamaño mínimo alcanzado' : '⚠️ Tamaño máximo alcanzado');
      return;
    }
    state.fontSize = next;
    applyFontSize();
    saveState();
    showToast('🔤 Texto al ' + state.fontSize + '%');
  },

  // --- Abrir modal de encabezado ---
  openEditHeader() {
    document.getElementById('hBadge').value  = state.header.badge  || HEADER_DEFAULT.badge;
    document.getElementById('hTitle').value  = state.header.title  || HEADER_DEFAULT.title;
    document.getElementById('hVerse').value  = state.header.verse  || HEADER_DEFAULT.verse;
    document.getElementById('modalHeader').classList.add('open');
    setTimeout(() => document.getElementById('hTitle').focus(), 100);
  },

  // --- Guardar encabezado ---
  saveHeader() {
    const badge = document.getElementById('hBadge').value.trim();
    const title = document.getElementById('hTitle').value.trim();
    const verse = document.getElementById('hVerse').value.trim();
    if (!title) { showToast('⚠️ El título no puede estar vacío'); return; }
    state.header = { badge, title, verse };
    applyHeader();
    saveState();
    this.closeHeaderModal();
    showToast('✅ Encabezado actualizado');
  },

  // --- Restablecer encabezado por defecto ---
  resetHeader() {
    if (!confirm('¿Restablecer el encabezado original?')) return;
    state.header = { ...HEADER_DEFAULT };
    applyHeader();
    saveState();
    this.closeHeaderModal();
    showToast('↺ Encabezado restablecido');
  },

  // --- Cerrar modal de encabezado ---
  closeHeaderModal() {
    document.getElementById('modalHeader').classList.remove('open');
  },

  // --- (legacy) click directo en header --- 
  editHeader(field) {
    this.openEditHeader();
  },

  // --- Modo oscuro ---
  toggleDarkMode() {
    state.darkMode = !state.darkMode;
    applyDarkMode();
    saveState();
    showToast(state.darkMode ? '🌙 Modo oscuro' : '☀️ Modo claro');
  },

  // --- Limpiar todo ---
  clearAll() {
    if (!confirm('¿Limpiar TODOS los datos? Esto reinicia todas las horas y observaciones (el programa queda).')) return;
    // Reiniciar timers y campos
    Object.values(state.timers).forEach(t => { if (t.interval) clearInterval(t.interval); });
    state.timers = {};
    state.discursos.forEach(d => {
      d.horaInicio = null;
      d.horaFin = null;
      d.orador = '';
      d.obs = '';
    });
    saveState();
    render();
    showToast('🧹 Datos limpiados');
  },

  // --- Exportar CSV ---
  exportCSV() {
    const headers = ['Sesión','Tipo','Tema','Orador','Hora Inicio','Hora Fin','Tiempo Total','Duración Est. (min)','Observaciones'];
    const rows = state.discursos.map(d => {
      const timer = getTimer(d.id);
      const elapsed = timer.elapsed;
      return [
        d.sesion === 'manana' ? 'Mañana' : 'Tarde',
        d.tipo,
        d.tema,
        d.orador || '',
        d.horaInicio ? formatHora(d.horaInicio) : '',
        d.horaFin ? formatHora(d.horaFin) : '',
        elapsed > 0 ? formatTime(elapsed) : '',
        d.duracion || '',
        d.obs || '',
      ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(',');
    });
    const csv = '\uFEFF' + [headers.join(','), ...rows].join('\n'); // BOM para Excel
    downloadFile(csv, 'asamblea-circuito-2025.csv', 'text/csv;charset=utf-8;');
    showToast('📊 CSV exportado');
  },

  // --- Exportar PDF ---
  exportPDF() {
    try {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
      const W = 210, M = 15;
      let y = 0;

      // Encabezado
      doc.setFillColor(45, 122, 45);
      doc.rect(0, 0, W, 28, 'F');
      doc.setTextColor(255,255,255);
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.text('"Tienen que adorarlo con espíritu y con verdad"', W/2, 11, { align: 'center' });
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text('Juan 4:24  ·  Asamblea de Circuito 2025-2026', W/2, 18, { align: 'center' });
      doc.text('Informe generado: ' + new Date().toLocaleString('es-AR'), W/2, 24, { align: 'center' });
      y = 36;

      const sesiones = [
        { key: 'manana', label: '🌅  Sesión de la Mañana' },
        { key: 'tarde',  label: '🌤️  Sesión de la Tarde' },
      ];

      sesiones.forEach(ses => {
        const items = state.discursos.filter(d => d.sesion === ses.key);
        if (items.length === 0) return;

        // Título sesión
        doc.setFillColor(240, 247, 240);
        doc.rect(M, y, W - M*2, 8, 'F');
        doc.setTextColor(30, 92, 30);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text(ses.label, M + 3, y + 5.5);
        y += 11;

        items.forEach((d, idx) => {
          const timer = getTimer(d.id);
          const elapsed = timer.elapsed;

          if (y > 260) { doc.addPage(); y = 15; }

          // Fondo alternado
          if (idx % 2 === 0) {
            doc.setFillColor(250, 252, 250);
            doc.rect(M, y, W - M*2, 22, 'F');
          }
          doc.setDrawColor(200, 225, 200);
          doc.rect(M, y, W - M*2, 22);

          doc.setTextColor(20, 40, 20);
          doc.setFontSize(9);
          doc.setFont('helvetica', 'bold');
          doc.text((idx+1) + '. ' + d.tema, M + 3, y + 5);

          doc.setFont('helvetica', 'normal');
          doc.setTextColor(80, 80, 80);
          doc.setFontSize(8);
          const col1 = M + 3;
          const col2 = M + 65;
          const col3 = M + 120;

          doc.text('Orador: ' + (d.orador || '—'), col1, y + 11);
          doc.text('Hora inicio: ' + (d.horaInicio ? formatHora(d.horaInicio) : '—'), col2, y + 11);
          doc.text('Hora fin: ' + (d.horaFin ? formatHora(d.horaFin) : '—'), col3, y + 11);

          doc.text('Tiempo total: ' + (elapsed > 0 ? formatTime(elapsed) : '—'), col1, y + 17);
          doc.text('Est: ~' + (d.duracion || '?') + ' min', col2, y + 17);
          if (d.obs) doc.text('Obs: ' + d.obs.slice(0, 50), col3, y + 17);

          y += 24;
        });
        y += 4;
      });

      // Pie
      doc.setFontSize(7);
      doc.setTextColor(150,150,150);
      doc.text('Generado por Asamblea App PWA', W/2, 290, { align: 'center' });

      doc.save('asamblea-circuito-2025.pdf');
      showToast('📄 PDF exportado');
    } catch(e) {
      console.error(e);
      showToast('⚠️ Error al generar PDF. Verifica la conexión.');
    }
  },

};

// ============================================================
// HELPERS GLOBALES
// ============================================================
function applyFontSize() {
  document.documentElement.style.fontSize = (state.fontSize / 100) + 'rem';
  // Actualizar label
  const label = document.getElementById('fontSizeLabel');
  if (label) label.textContent = state.fontSize + '%';
}

function applyHeader() {
  const badge = document.getElementById('headerBadge');
  const title = document.getElementById('headerTitle');
  const verse = document.getElementById('headerVerse');
  if (badge) badge.textContent = (state.header.badge || HEADER_DEFAULT.badge) + ' ✎';
  if (title) title.textContent = state.header.title || HEADER_DEFAULT.title;
  if (verse) verse.textContent = state.header.verse || HEADER_DEFAULT.verse;
}

function applyDarkMode() {
  document.body.classList.toggle('dark', state.darkMode);
  const icon = document.getElementById('darkIcon');
  if (icon) {
    icon.innerHTML = state.darkMode
      ? '<path fill="currentColor" d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58a.996.996 0 0 0-1.41 0 .996.996 0 0 0 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37a.996.996 0 0 0-1.41 0 .996.996 0 0 0 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0a.996.996 0 0 0 0-1.41l-1.06-1.06zm1.06-12.37l-1.06 1.06a.996.996 0 0 0 0 1.41c.39.39 1.03.39 1.41 0l1.06-1.06a.996.996 0 0 0 0-1.41.996.996 0 0 0-1.41 0zM7.05 18.36l-1.06 1.06a.996.996 0 0 0 0 1.41c.39.39 1.03.39 1.41 0l1.06-1.06a.996.996 0 0 0 0-1.41.996.996 0 0 0-1.41 0z"/>'
      : '<path fill="currentColor" d="M12 3a9 9 0 1 0 9 9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 0 1-4.4 2.26 5.403 5.403 0 0 1-3.14-9.8c-.44-.06-.9-.1-1.36-.1z"/>';
  }
}

function rerenderCard(id) {
  const disco = state.discursos.find(d => d.id === id);
  if (!disco) return;
  const existing = document.getElementById('card-' + id);
  if (existing) {
    const newCard = createCard(disco);
    existing.replaceWith(newCard);
  }
}

function downloadFile(content, filename, mime) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// Fallback para copiar en navegadores que no soportan clipboard API
function fallbackCopy(text) {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.cssText = 'position:fixed;top:-999px;left:-999px;opacity:0;';
  document.body.appendChild(ta);
  ta.focus();
  ta.select();
  try {
    document.execCommand('copy');
    showToast('📋 ¡Copiado al portapapeles!');
  } catch(e) {
    // Último recurso: mostrar el texto en un prompt para copiar manualmente
    window.prompt('Seleccioná y copiá el texto:', text);
  }
  document.body.removeChild(ta);
}

// Cerrar modal con Escape
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') App.closeModal();
});

// ============================================================
// ARRANQUE
// ============================================================
document.addEventListener('DOMContentLoaded', () => App.init());
