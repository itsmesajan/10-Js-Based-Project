const STORAGE_KEY = 'notes';
const COLORS = ['blue', 'green', 'amber', 'rose', 'violet'];
const UNDO_TIMEOUT = 5000;

const grid = document.getElementById('notes');
const emptyState = document.getElementById('empty');
const noResults = document.getElementById('no-results');
const searchInput = document.getElementById('search');
const countEl = document.getElementById('count');
const toast = document.getElementById('toast');
const undoBtn = toast.querySelector('.toast-undo');

let pendingDelete = null;
let toastTimer = null;

marked.setOptions({ breaks: true });

loadNotes();

document.querySelectorAll('#add, [data-add]').forEach((btn) => {
  btn.addEventListener('click', createAndFocusNote);
});

searchInput.addEventListener('input', applySearch);

undoBtn.addEventListener('click', undoDelete);

// Global shortcuts: "N" for a new note, "/" to search
document.addEventListener('keydown', (e) => {
  const typing = e.target.closest('input, textarea, [contenteditable]');
  if (typing || e.ctrlKey || e.metaKey || e.altKey) return;

  if (e.key === 'n' || e.key === 'N') {
    e.preventDefault();
    createAndFocusNote();
  } else if (e.key === '/') {
    e.preventDefault();
    searchInput.focus();
  }
});

// Keep "Edited 5m ago" labels fresh
setInterval(() => {
  grid.querySelectorAll('.note').forEach(updateMeta);
}, 60 * 1000);

function loadNotes(){
  let saved = [];
  try {
    saved = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    saved = [];
  }

  saved.forEach((note) => grid.appendChild(createNote(note)));
  refreshUI();
}

function createAndFocusNote(){
  const note = createNote();
  grid.prepend(note);

  searchInput.value = '';
  applySearch();

  note.querySelector('textarea').focus();
  updateLS();
}

function createNote({ title = '', content = '', color = COLORS[0], updatedAt = Date.now() } = {}){
  const note = document.createElement('article');
  note.classList.add('note');
  note.dataset.color = COLORS.includes(color) ? color : COLORS[0];
  note.dataset.updated = updatedAt;

  note.innerHTML = `
    <header class="note-header">
      <input type="text" class="title" placeholder="Untitled" aria-label="Note title" maxlength="80" />
      <div class="actions">
        <button class="icon-btn color" title="Change color" aria-label="Change color"><i class="fas fa-circle"></i></button>
        <button class="icon-btn toggle" title="Edit (Ctrl+Enter)" aria-label="Edit note"><i class="fas fa-pen"></i></button>
        <button class="icon-btn delete" title="Delete" aria-label="Delete note"><i class="fas fa-trash-alt"></i></button>
      </div>
    </header>
    <div class="format-bar" role="toolbar" aria-label="Formatting">
      <button class="icon-btn" data-wrap="**" title="Bold (Ctrl+B)" aria-label="Bold"><i class="fas fa-bold"></i></button>
      <button class="icon-btn" data-wrap="_" title="Italic (Ctrl+I)" aria-label="Italic"><i class="fas fa-italic"></i></button>
      <button class="icon-btn" data-wrap="\`" title="Inline code" aria-label="Inline code"><i class="fas fa-code"></i></button>
      <button class="icon-btn" data-prefix="## " title="Heading" aria-label="Heading"><i class="fas fa-heading"></i></button>
      <button class="icon-btn" data-prefix="- " title="Bullet list" aria-label="Bullet list"><i class="fas fa-list-ul"></i></button>
      <button class="icon-btn" data-prefix="> " title="Quote" aria-label="Quote"><i class="fas fa-quote-left"></i></button>
    </div>
    <div class="preview"></div>
    <textarea placeholder="Start typing… Markdown is supported" aria-label="Note content"></textarea>
    <footer class="note-footer">
      <span class="words"></span>
      <span class="meta"></span>
    </footer>
  `;

  const titleInput = note.querySelector('.title');
  const colorBtn = note.querySelector('.color');
  const toggleBtn = note.querySelector('.toggle');
  const deleteBtn = note.querySelector('.delete');
  const formatBar = note.querySelector('.format-bar');
  const preview = note.querySelector('.preview');
  const textArea = note.querySelector('textarea');

  titleInput.value = title;
  textArea.value = content;
  render();
  setEditing(!content);

  function render(){
    preview.innerHTML = marked(textArea.value);
    updateMeta(note);
  }

  function touch(){
    note.dataset.updated = Date.now();
    updateLS();
    updateMeta(note);
  }

  function setEditing(editing){
    note.classList.toggle('is-editing', editing);
    toggleBtn.innerHTML = editing ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-pen"></i>';
    toggleBtn.title = editing ? 'Preview (Esc)' : 'Edit (Ctrl+Enter)';
    toggleBtn.setAttribute('aria-label', editing ? 'Preview note' : 'Edit note');
  }

  function edit(){
    setEditing(true);
    textArea.focus();
  }

  function showPreview(){
    if (!textArea.value.trim()) return;
    setEditing(false);
  }

  titleInput.addEventListener('input', touch);
  titleInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      edit();
    }
  });

  colorBtn.addEventListener('click', () => {
    const next = COLORS[(COLORS.indexOf(note.dataset.color) + 1) % COLORS.length];
    note.dataset.color = next;
    updateLS();
  });

  toggleBtn.addEventListener('click', () => {
    note.classList.contains('is-editing') ? showPreview() : edit();
  });

  deleteBtn.addEventListener('click', () => deleteNote(note));

  // Clicking the rendered note jumps into edit mode (but let links work)
  preview.addEventListener('click', (e) => {
    if (e.target.closest('a')) return;
    edit();
  });

  // Keep textarea focus when using the toolbar
  formatBar.addEventListener('mousedown', (e) => e.preventDefault());
  formatBar.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    if (btn.dataset.wrap) wrapSelection(textArea, btn.dataset.wrap);
    if (btn.dataset.prefix) prefixLine(textArea, btn.dataset.prefix);
  });

  textArea.addEventListener('input', () => {
    render();
    touch();
  });

  textArea.addEventListener('keydown', (e) => {
    const mod = e.ctrlKey || e.metaKey;

    if (mod && e.key.toLowerCase() === 'b') {
      e.preventDefault();
      wrapSelection(textArea, '**');
    } else if (mod && e.key.toLowerCase() === 'i') {
      e.preventDefault();
      wrapSelection(textArea, '_');
    } else if ((mod && e.key === 'Enter') || e.key === 'Escape') {
      e.preventDefault();
      showPreview();
      toggleBtn.focus();
    }
  });

  // Switch back to preview when focus leaves the note entirely
  note.addEventListener('focusout', (e) => {
    if (!note.contains(e.relatedTarget) && note.classList.contains('is-editing')) {
      showPreview();
    }
  });

  return note;
}

function wrapSelection(textArea, marker){
  const { selectionStart: start, selectionEnd: end, value } = textArea;
  const len = marker.length;
  const alreadyWrapped =
    value.slice(start - len, start) === marker && value.slice(end, end + len) === marker;

  if (alreadyWrapped) {
    textArea.setRangeText(value.slice(start, end), start - len, end + len, 'select');
  } else {
    const selected = value.slice(start, end) || 'text';
    textArea.setRangeText(marker + selected + marker, start, end);
    textArea.setSelectionRange(start + len, start + len + selected.length);
  }

  textArea.dispatchEvent(new Event('input'));
}

function prefixLine(textArea, prefix){
  const { selectionStart, value } = textArea;
  const lineStart = value.lastIndexOf('\n', selectionStart - 1) + 1;

  if (value.startsWith(prefix, lineStart)) {
    textArea.setRangeText('', lineStart, lineStart + prefix.length, 'preserve');
  } else {
    textArea.setRangeText(prefix, lineStart, lineStart, 'preserve');
    if (selectionStart === lineStart) {
      textArea.setSelectionRange(lineStart + prefix.length, lineStart + prefix.length);
    }
  }

  textArea.dispatchEvent(new Event('input'));
}

function deleteNote(note){
  finalizeDelete();

  pendingDelete = { note, nextSibling: note.nextElementSibling };
  note.remove();
  updateLS();

  const name = note.querySelector('.title').value.trim();
  toast.querySelector('.toast-msg').textContent = name ? `Deleted “${name}”` : 'Note deleted';
  toast.classList.add('show');

  clearTimeout(toastTimer);
  toastTimer = setTimeout(finalizeDelete, UNDO_TIMEOUT);
}

function undoDelete(){
  if (!pendingDelete) return;

  const { note, nextSibling } = pendingDelete;
  if (nextSibling && nextSibling.parentNode === grid) {
    grid.insertBefore(note, nextSibling);
  } else {
    grid.appendChild(note);
  }

  finalizeDelete();
  updateLS();
  applySearch();
}

function finalizeDelete(){
  pendingDelete = null;
  clearTimeout(toastTimer);
  toast.classList.remove('show');
}

function applySearch(){
  const query = searchInput.value.trim().toLowerCase();

  grid.querySelectorAll('.note').forEach((note) => {
    const text = `${note.querySelector('.title').value} ${note.querySelector('textarea').value}`.toLowerCase();
    note.classList.toggle('hidden', !!query && !text.includes(query));
  });

  refreshUI();
}

function updateMeta(note){
  const content = note.querySelector('textarea').value.trim();
  const words = content ? content.split(/\s+/).length : 0;

  note.querySelector('.words').textContent = `${words} ${words === 1 ? 'word' : 'words'}`;
  note.querySelector('.meta').textContent = `Edited ${timeAgo(Number(note.dataset.updated))}`;
}

function timeAgo(timestamp){
  const seconds = Math.round((Date.now() - timestamp) / 1000);
  if (!timestamp || seconds < 45) return 'just now';

  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d ago`;

  return new Date(timestamp).toLocaleDateString();
}

function refreshUI(){
  const all = grid.querySelectorAll('.note').length;
  const visible = grid.querySelectorAll('.note:not(.hidden)').length;

  countEl.textContent = all;
  emptyState.classList.toggle('hidden', all > 0);
  noResults.classList.toggle('hidden', all === 0 || visible > 0);
}

function updateLS(){
  const notes = [...grid.querySelectorAll('.note')].map((noteElement) => ({
    title: noteElement.querySelector('.title').value,
    content: noteElement.querySelector('textarea').value,
    color: noteElement.dataset.color,
    updatedAt: Number(noteElement.dataset.updated),
  }));

  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  refreshUI();
}
