# ⏱ Asamblea de Circuito 2025-2026 — App de Gestión de Tiempos

> "Tienen que adorarlo con espíritu y con verdad" — Juan 4:24

---

## 📁 Archivos del proyecto

```
asamblea/
├── index.html        ← Página principal
├── styles.css        ← Estilos (tema verde, modo oscuro)
├── app.js            ← Lógica principal + cronómetros + exportación
├── service-worker.js ← Soporte offline (PWA)
├── manifest.json     ← Configuración PWA
└── README.md         ← Este archivo
```

---

## 🚀 Cómo ejecutar localmente

### Opción A — Con Python (recomendado, cualquier PC con Python):
```bash
cd asamblea/
python3 -m http.server 8080
# Abrir: http://localhost:8080
```

### Opción B — Con VS Code:
Instalar extensión "Live Server" → clic derecho en `index.html` → "Open with Live Server"

### Opción C — Abrir directamente:
En la mayoría de navegadores, podés abrir `index.html` directamente (doble clic).
⚠️ El Service Worker solo funciona en servidor HTTP/HTTPS.

---

## 📱 Instalar como PWA (en celular o PC)

1. Abrir la app en **Chrome** o **Edge**
2. En el navegador verás un ícono de "Instalar" (⊕) en la barra de URL
3. También: Menú ⋮ → "Instalar app" o "Agregar a pantalla de inicio"
4. La app quedará instalada y funciona **100% offline**

---

## ⏱ Cómo usar los cronómetros

- **▶ Start**: Inicia el tiempo. Registra automáticamente la **hora de inicio**.
- **⏹ Stop**: Detiene el cronómetro. Registra la **hora de fin**.
- **↺ Reset**: Borra el tiempo y las horas del discurso.
- Los campos **Orador** y **Observaciones** son editables en cualquier momento.
- Todos los datos se guardan automáticamente en el dispositivo (LocalStorage).

---

## 📤 Exportación de datos

### 📊 CSV (compatible con Google Sheets / Excel)
1. Click en botón **CSV** en la barra de herramientas
2. Se descarga `asamblea-circuito-2025.csv`
3. Abrir en Google Sheets: Archivo → Importar → elegir el CSV

### 📄 PDF (informe imprimible)
1. Click en botón **PDF**
2. Se descarga `asamblea-circuito-2025.pdf`
3. Incluye: sesiones, temas, oradores, tiempos reales, observaciones

---

## ⚙️ Funcionalidades principales

- ✅ 20 discursos del programa **precargados automáticamente**
- ✅ Cronómetro independiente por cada discurso
- ✅ Registro de hora de inicio y fin (hora real del dispositivo)
- ✅ Campos editables: orador, observaciones
- ✅ Agregar / editar / eliminar discursos
- ✅ Modo oscuro (botón 🌙 en toolbar)
- ✅ Funciona 100% sin internet
- ✅ Datos persistentes (sobreviven recarga de página)
- ✅ Exportar a CSV y PDF

---

## 🔒 Privacidad

Todos los datos se guardan **localmente en tu dispositivo**.
No se envía ningún dato a servidores externos.

---

© 2025 — Generado con Asamblea App PWA
