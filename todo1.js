const form = document.createElement('form');
form.classList.add('form');
document.body.prepend(form);

const title = document.createElement('h1');
title.textContent = 'Todos';
title.classList.add('title');
form.prepend(title);

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

function setLSandControls(todos) {
  localStorage.setItem('todoList', JSON.stringify(todos));

  checkAndShowCompleted();
  showQuantityActiveTodo();
  checkIsCompleted();
}

makeTodoList(todoArray);

function handleTodoAdd(e) {
  e.preventDefault();

  const newTodo = {
    id: uuidv4(),
    description: input.value,
    checked: false,
  };
  todoArray.push(newTodo);
  renderTodo();

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

function renderTodo() {
  setLSandControls(todoArray);
  makeTodoList(todoArray);
}

function handleCompleteAndDelete(e) {
  if (e.target.nodeName === 'BUTTON') {
    const itemId = e.target.parentNode.id;

    todoArray = todoArray.filter(todo => {
      return todo.id !== itemId;
    });
    renderTodo();
  }

  if (e.target.nodeName === 'LABEL') {
    const itemId = e.target.closest('li').id;
    const targetItem = todoArray.filter(todo => {
      return todo.id === itemId;
    });
    targetItem[0].checked = !targetItem[0].checked;
    e.target.closest('li').children[2].classList.toggle('todoCompleted');
    renderTodo();
  }
}

label.addEventListener('click', handleAllCompleted);
function handleAllCompleted() {
  const isAnyActive = todoArray.some(todo => todo.checked === false);

  if (isAnyActive) {
    todoArray = todoArray.map(todo => {
      todo.checked = true;
      return todo;
    });
    renderTodo();
  } else {
    todoArray = todoArray.map(todo => {
      todo.checked = false;
      return todo;
    });
    renderTodo();
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

function checkAndShowCompleted() {
  const isAnyCompleted = checkCompleted(todoArray);
  showClear(isAnyCompleted);
}

checkAndShowCompleted();

function showQuantityActiveTodo() {
  const activeTodos = todoArray.filter(todo => {
    return todo.checked !== true;
  });
  quantity.textContent = activeTodos.length + ` item left`;
}

function checkIsCompleted() {
  if (todoArray.every(todo => todo.checked === true)) {
    input.classList.add('extra');
  } else {
    input.classList.remove('extra');
  }
}

btnClear.addEventListener('click', handleClearCompleted);
function handleClearCompleted() {
  todoArray = todoArray.filter(todo => {
    return todo.checked === false;
  });
  renderTodo();
}

todoList.addEventListener('dblclick', handleChangeText);
function handleChangeText(e) {
  if (e.target.tagName === 'P') {
    const target = e.target;
    const idTarget = e.target.parentNode.id;
    const checked = e.target.parentNode.children[0].checked;
    const btn = e.target.parentNode.children[3];
    btn.classList.add('editable');

    target.setAttribute('contenteditable', 'true');

    e.target.parentNode.children[1].style.display = 'none';

    target.classList.add('wrap');
    const editInput = document.createElement('input');
    editInput.setAttribute('autofocus', 'true');
    target.appendChild(editInput);
    editInput.value = target.innerText;

    target.innerHTML = editInput.value;

    target.addEventListener('keydown', handleEnter);
    function handleEnter(e) {
      if (e.keyCode === 13) {
        handleChanges();
      }
    }
    target.addEventListener('blur', handleBlur);
    function handleBlur(e) {
      handleChanges();
    }
    function handleChanges() {
      btn.classList.remove('editable');
      const newTodo = {
        id: idTarget,
        description: target.innerHTML,
        checked,
      };
      todoArray = todoArray.map(todo => {
        if (todo.id === idTarget) {
          todo = newTodo;
        }
        return todo;
      });
      renderTodo();
    }
  }
}

function uuidv4() {
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
    (
      c ^
      (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
    ).toString(16),
  );
}
