const form = document.getElementById('form');
const input = document.getElementById('input');
const todosUL = document.getElementById('todos');

const todos = JSON.parse(localStorage.getItem('todos'));

if (todos) {
  todos.forEach(todo=>{
    addTodo(todo);
  });
}

form.addEventListener('submit', (e) =>{
  e.preventDefault();

  addTodo();
});

function addTodo(todo){
    let todoText = input.value;

  if(todo){
    todoText = todo.text;
  }

  if(todoText) {
    const todoEl = document.createElement('li');

    if (todo && todo.completed){
      todoEl.classList.add('completed');
    }
    todoEl.innerHTML = todoText;

    todoEl.addEventListener('click', () =>{
      todoEl.classList.toggle('completed');

      sortTodos();
      updateLS();
    });

    todoEl.addEventListener('contextmenu',(e)=>{
      e.preventDefault();

      todoEl.remove();

      updateLS();
    });

    todosUL.appendChild(todoEl);
  
    input.value="";

    sortTodos();
    updateLS();
  }
}

function updateLS(){
  const todosEl =document.querySelectorAll('li');

  const todos =[];

  todosEl.forEach((todosEl) =>{
    todos.push({
      text: todosEl.innerText,
      completed: todosEl.classList.contains('completed'),
    });
  });

  localStorage.setItem('todos',JSON.stringify(todos));
}

function sortTodos(){
  const todosArray = Array.from(todosUL.children);

  todosArray.sort((a,b)=>{
    const aCompleted = a.classList.contains('completed');
    const bCompleted = b.classList.contains('completed');

    return aCompleted-bCompleted;
  });

  todosUL.innerHTML = '';
  todosArray.forEach((todo) => todosUL.appendChild(todo));
}