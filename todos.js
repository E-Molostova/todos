const form = document.createElement('form');
form.classList.add('form');
document.body.prepend(form);

const input = document.createElement('input');
input.id = 'mainInput';
input.type = 'text';
input.autocomplete = 'off';
input.placeholder = 'What needs to be done?';
input.classList.add('mainInput');

const label = document.createElement('label');
label.setAttribute('for', 'mainInput');
form.append(input, label);

const todoList = document.createElement('ul');
form.appendChild(todoList);

form.addEventListener('submit', handleTodoAdd);
todoList.addEventListener('click', handleCompleteAndDelete);
todoList.addEventListener('dblclick', handleChangeText);

let todoArray;

!localStorage.todoList
  ? (todoArray = [])
  : (todoArray = JSON.parse(localStorage.getItem('todoList')));

function setLocalStorage(todos) {
  localStorage.setItem('todoList', JSON.stringify(todos));

  const isAnyCompleted = checkCompleted(todoArray);
  showClear(isAnyCompleted);

  const activeTodos = todos.filter(todo => {
    return todo.checked !== true;
  });
  quantity.textContent = activeTodos.length + ` item left`;

  if (todoArray.every(todo => todo.checked === true)) {
    input.classList.add('extra');
  } else {
    input.classList.remove('extra');
  }
}

makeTodoList(todoArray);

function handleTodoAdd(e) {
  e.stopPropagation();
  e.preventDefault();

  const newTodo = {
    id: uuidv4(),
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
    completed.id = 'check';
    completed.checked = todo.checked;
    todo.checked
      ? completed.classList.add('custom-checkbox', 'extra')
      : completed.classList.add('custom-checkbox');

    const label = document.createElement('label');
    label.setAttribute('for', 'check');
    label.setAttribute('id', 'label');

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
      return todo.id !== itemId;
    });
    setLocalStorage(todoArray);
    makeTodoList(todoArray);
  }

  if (e.target.nodeName === 'LABEL') {
    const itemId = e.target.closest('li').id;
    const targetItem = todoArray.filter(todo => {
      return todo.id === itemId;
    });

    targetItem[0].checked = !targetItem[0].checked;

    e.target.closest('li').children[2].classList.toggle('todoCompleted');
    setLocalStorage(todoArray);
    makeTodoList(todoArray);
  }
}

function handleChangeText(e) {
  if (e.target.tagName === 'P') {
    e.target.setAttribute('contenteditable', 'true');
    console.log(e.target.innerText);

    // text.textContent = e.target.textContent;//undefined

    // setLocalStorage(todoArray);
    // makeTodoList(todoArray);
  }
}

label.addEventListener('click', handleAllCompleted);
function handleAllCompleted(e) {
  const isAnyActive = todoArray.some(todo => todo.checked === false);

  if (isAnyActive) {
    todoArray = todoArray.map(todo => {
      todo.checked = true;
      return todo;
    });
    setLocalStorage(todoArray);
    makeTodoList(todoArray);
  } else {
    todoArray = todoArray.map(todo => {
      todo.checked = false;
      return todo;
    });
    setLocalStorage(todoArray);
    makeTodoList(todoArray);
  }
}

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
  switch (e.target.id) {
    case 'All':
      makeTodoList(todoArray);
      break;

    case 'Active':
      const todos = todoArray.filter(todo => {
        return todo.checked === false;
      });
      makeTodoList(todos);
      break;

    case 'Completed':
      const todosToShow = todoArray.filter(todo => {
        return todo.checked === true;
      });
      makeTodoList(todosToShow);
      break;

    default:
      break;
  }
}

function checkCompleted(array) {
  const isAnyCompleted = array.some(todo => todo.checked === true);
  return isAnyCompleted;
}

function showClear(isAnyCompleted) {
  if (isAnyCompleted) {
    btnClear.classList.add('clearBtnShow');
  } else {
    btnClear.classList.remove('clearBtnShow');
  }
}
const isAnyCompleted = checkCompleted(todoArray);
showClear(isAnyCompleted);

btnClear.addEventListener('click', handleClearCompleted);

function handleClearCompleted() {
  todoArray = todoArray.filter(todo => {
    return todo.checked === false;
  });
  setLocalStorage(todoArray);
  makeTodoList(todoArray);
}

// const textRefs = document.querySelectorAll('.description');
// const textArray = [...textRefs];
// console.log(textArray);
// // textRefs.addEventListener('dblclick', handleChangeText);

// // function handleChangeText(e) {
// //   console.log(e.target);
// // }

function uuidv4() {
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
    (
      c ^
      (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
    ).toString(16),
  );
}
