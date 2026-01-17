const addBtn = document.getElementById('add');

const notes = JSON.parse(localStorage.getItem('notes'));

if(notes){
  notes.forEach((note) => {
    addNewNote(note.content);
    const lastNote = document.querySelector('.notes:last-child');
    if(lastNote){
      lastNote.querySelector('.title').value = note.title;
    }
  });
}

addBtn.addEventListener('click', () =>{
  addNewNote();
});

function addNewNote(text = ''){
  const note = document.createElement('div');
  note.classList.add('note');

  note.innerHTML = `
    <div class="notes">
      <div class="tools">
        <input type="text" class="title" value="Note App"></input>
        <button class="bold" title="Bold"><i class="fas fa-bold"></i></button>
          <button class="edit" title="Edit"><i class="fas fa-edit"></i></button>
          <button class="delete" title="Delete"><i class="fas fa-trash-alt"></i></button>
      </div>
      <div class="main ${text ? "" : "hidden"}"></div>
      <textarea class="${text ? "hidden" : ""}"></textarea>
    </div>
  `;

  const titleInput = note.querySelector('.title');
  const boldBtn = note.querySelector('.bold');
  const editBtn = note.querySelector('.edit');
  const deleteBtn = note.querySelector('.delete');

  const main = note.querySelector('.main');
  const textArea = note.querySelector('textarea');

  textArea.value= text;
  main.innerHTML = marked(text);



  titleInput.addEventListener('change',()=>{
    updateLS();
  })
  
  editBtn.addEventListener('click', () =>{
    main.classList.toggle('hidden');
    textArea.classList.toggle('hidden');
  });

    boldBtn.addEventListener('click',()=>{
    const selection = window.getSelection();
    const selectedText = selection.toString();

    if(selectedText && !main.classList.contains('hidden')){
      const range = selection.getRangeAt(0);
      const boldText = document.createElement('strong');
      boldText.textContent = selectedText;
      range.deleteContents();
      range.insertNode(boldText);
      updateLS();
    }else if (!main.classList.contains('hidden')) {
      alert('Please select some text to make bold');
    } else {
      alert('Please switch to view mode to make text bold');
    }
  })
  deleteBtn.addEventListener('click', ()=>{
    note.remove();

    updateLS();
  });
  
  
  textArea.addEventListener('input', (e) =>{
    const {value} = e.target;
    
    main.innerHTML = marked(value);
    
    updateLS();
  });

  document.body.appendChild(note);
}

function updateLS(){
  const noteElements = document.querySelectorAll('.notes');

  const notes = [];

  noteElements.forEach((noteElement)=>{
    const title = noteElement.querySelector('.title').value;
    const content = noteElement.querySelector('textarea').value;
    notes.push({title,content});
  });

  localStorage.setItem('notes', JSON.stringify(notes));
}



