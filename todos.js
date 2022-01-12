const form = document.createElement('form');
form.classList.add('form');
document.body.prepend(form);

const input = document.createElement('input');
input.type = 'text';
input.autocomplete = 'off';
input.placeholder = 'what needs to be done?';
input.classList.add('input');
form.appendChild(input);

const todoList = document.createElement('ul');
form.appendChild(todoList);

form.addEventListener('submit', handleTodoAdd);
todoList.addEventListener('click', handleCompleteAndDelete);

const randomInteger = () => {
  return Math.floor(Math.random() * (10000 - 1 + 1) + 1);
};

let todoArray;

!localStorage.todoList
  ? (todoArray = [])
  : (todoArray = JSON.parse(localStorage.getItem('todoList')));

function setLocalStorage(todos) {
  localStorage.setItem('todoList', JSON.stringify(todos));
  const activeTodos = todoArray.filter(todo => {
    return todo.checked !== true;
  });
  quantity.textContent = activeTodos.length + ` item left`;
}

makeTodoList(todoArray);

function handleTodoAdd(e) {
  e.stopPropagation();
  e.preventDefault();

  const newTodo = {
    id: randomInteger(),
    description: input.value,
    checked: false,
  };

  todoArray.push(newTodo);
  setLocalStorage(todoArray);
  makeTodoList(todoArray);

  form.reset();
}

function makeTodoList(array) {
  todoList.innerHTML = '';
  const todoItems = array.map(todo => {
    const itemTodo = document.createElement('li');
    itemTodo.classList.add('todoItem');
    itemTodo.id = todo.id;

    const completed = document.createElement('input');
    completed.type = 'checkbox';
    completed.classList.add('custom-checkbox');
    completed.id = 'check';
    completed.checked = todo.checked;

    const label = document.createElement('label');
    label.setAttribute('for', 'check');

    const text = document.createElement('p');
    todo.checked
      ? text.classList.add('description', 'todoCompleted')
      : text.classList.add('description');
    text.textContent = todo.description;

    const button = document.createElement('button');
    button.type = 'button';
    button.classList.add('btn');
    button.textContent = 'x';

    itemTodo.append(completed, label, text, button);
    return itemTodo;
  });

  todoList.append(...todoItems);
}

function handleCompleteAndDelete(e) {
  e.stopPropagation();

  if (e.currentTarget === e.target) {
    return;
  }

  if (e.target.nodeName === 'BUTTON') {
    const itemId = e.target.parentNode.id;

    todoArray = todoArray.filter(todo => {
      return todo.id !== Number(itemId);
    });
    setLocalStorage(todoArray);
    makeTodoList(todoArray);
    // const activeTodos = todoArray.filter(todo => {
    //   return todo.checked !== true;
    // });
    // quantity.textContent = activeTodos.length + ` item left`;
  }

  if (e.target.nodeName === 'LABEL') {
    const itemId = e.target.closest('li').id;
    const targetItem = todoArray.filter(todo => {
      return todo.id === Number(itemId);
    });
    targetItem[0].checked = !targetItem[0].checked;

    e.target.closest('li').children[2].classList.toggle('todoCompleted');
    setLocalStorage(todoArray);
    makeTodoList(todoArray);

    // const activeTodos = todoArray.filter(todo => {
    //   return todo.checked !== true;
    // });
    // quantity.textContent = activeTodos.length + ` item left`;
  }
}

const allCompleted = document.createElement('button');
allCompleted.classList.add('allCompleted');
allCompleted.textContent = '+';
form.prepend(allCompleted);

const footerDiv = document.createElement('div');
footerDiv.classList.add('footerDiv');
form.append(footerDiv);

const quantity = document.createElement('span');
const activeTodos = todoArray.filter(todo => {
  return todo.checked !== true;
});
quantity.textContent = activeTodos.length + ` item left`;

const filterBtns = document.createElement('div');
const btnAll = document.createElement('button');
btnAll.type = 'button';
btnAll.classList.add('filterBtn');
btnAll.textContent = 'All';
btnAll.id = 'All';
const btnActive = document.createElement('button');
btnActive.type = 'button';
btnActive.classList.add('filterBtn');
btnActive.textContent = 'Active';
btnActive.id = 'Active';
const btnCompleted = document.createElement('button');
btnCompleted.type = 'button';
btnCompleted.classList.add('filterBtn');
btnCompleted.textContent = 'Completed';
btnCompleted.id = 'Completed';
filterBtns.append(btnAll, btnActive, btnCompleted);
footerDiv.appendChild(filterBtns);

const btnClear = document.createElement('button');
btnClear.type = 'button';
btnClear.classList.add('clearBtn');
btnClear.textContent = 'Clear completed';
btnClear.id = 'clear';

footerDiv.append(quantity, filterBtns, btnClear);
footerDiv.addEventListener('click', handleFilter);

function handleFilter(e) {
  if (e.target.id === 'All') {
    makeTodoList(todoArray);
  }

  if (e.target.id === 'Active') {
    const todos = todoArray.filter(todo => {
      return todo.checked !== true;
    });
    makeTodoList(todos);
  }

  if (e.target.id === 'Completed') {
    const todos = todoArray.filter(todo => {
      return todo.checked !== false;
    });
    makeTodoList(todos);
  }
}

// allCompleted.addEventListener('click', handleAllCompleted);

// function handleAllCompleted() {
//   // return todoArray.forEach(todo => {
//   //   todo.checked=true
//   // });
//   console.log(
//     todoArray.forEach(todo => {
//       todo.checked = true;
//     }),
//   );
// }
