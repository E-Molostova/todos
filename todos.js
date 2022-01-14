function createForm() {
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
  label.classList.add('label');
  label.setAttribute('for', 'mainInput');
  form.append(input, label);

  const todoList = document.createElement('ul');
  todoList.classList.add('todoList');
  form.appendChild(todoList);
  return form;
}

function createTodoList(todos) {
  const todoListRef = document.querySelector('.todoList');
  todoListRef.innerHTML = '';
  const todoItems = todos.map(todo => {
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
  todoListRef.append(...todoItems);

  return todoListRef;
}

function createFooterForm() {
  const todoArray = parseLocalStorage();

  const footerDiv = document.createElement('div');
  footerDiv.classList.add('footerDiv');
  form.append(footerDiv);

  const quantity = document.createElement('span');
  const activeTodos = todoArray.filter(todo => todo.checked !== true);
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
  return footerDiv;
}

function parseLocalStorage() {
  return JSON.parse(localStorage.getItem('todoList')) || [];
}

function setLocalStorageAndChecks(todos) {
  localStorage.setItem('todoList', JSON.stringify(todos));

  checkAndShowCompleted();
  showQuantityActiveTodo(todos);
  checkIsCompleted(todos);
}

function handleTodoAdd(e) {
  e.preventDefault();

  const todoArray = parseLocalStorage();
  const input = document.querySelector('.mainInput');

  const newTodo = {
    id: uuidv4(),
    description: input.value,
    checked: false,
  };
  todoArray.push(newTodo);
  setLocalStorageAndChecks(todoArray);
  createTodoList(todoArray);

  form.reset();
}

function handleCompleteAndDelete(e) {
  let todoArray = parseLocalStorage();

  if (e.target.nodeName === 'BUTTON') {
    const itemId = e.target.parentNode.id;

    todoArray = todoArray.filter(todo => {
      return todo.id !== itemId;
    });
    setLocalStorageAndChecks(todoArray);
    createTodoList(todoArray);
  }

  if (e.target.nodeName === 'LABEL') {
    const itemId = e.target.closest('li').id;

    const targetItem = todoArray.filter(todo => {
      return todo.id === itemId;
    });
    targetItem[0].checked = !targetItem[0].checked;
    e.target.closest('li').children[2].classList.toggle('todoCompleted');

    setLocalStorageAndChecks(todoArray);
    createTodoList(todoArray);
  }
}

function handleAllCompleted() {
  let todoArray = parseLocalStorage();
  const isAnyActive = todoArray.some(todo => todo.checked === false);

  if (isAnyActive) {
    todoArray = todoArray.map(todo => {
      todo.checked = true;
      return todo;
    });
    setLocalStorageAndChecks(todoArray);
    createTodoList(todoArray);
  } else {
    todoArray = todoArray.map(todo => {
      todo.checked = false;
      return todo;
    });
    setLocalStorageAndChecks(todoArray);
    createTodoList(todoArray);
  }
}

function handleFilter(e) {
  const todoArray = parseLocalStorage();

  switch (e.target.id) {
    case 'All':
      createTodoList(todoArray);
      break;

    case 'Active':
      const todos = todoArray.filter(todo => todo.checked === false);
      createTodoList(todos);
      break;

    case 'Completed':
      const todosToShow = todoArray.filter(todo => todo.checked === true);
      createTodoList(todosToShow);
      break;

    default:
      break;
  }
}

function handleClearCompleted() {
  let todoArray = parseLocalStorage();
  todoArray = todoArray.filter(todo => {
    return todo.checked === false;
  });
  setLocalStorageAndChecks(todoArray);
  createTodoList(todoArray);
}

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
    target.addEventListener('blur', handleBlur);
    function handleEnter(e) {
      if (e.keyCode === 13) {
        handleChanges();
      }
    }
    function handleBlur(e) {
      handleChanges();
    }
    function handleChanges() {
      let todoArray = parseLocalStorage();
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
      setLocalStorageAndChecks(todoArray);
      createTodoList(todoArray);
    }
  }
}

function checkAndShowCompleted() {
  const todoArray = parseLocalStorage();
  const isAnyCompleted = todoArray.some(todo => todo.checked === true);
  const btnClearRef = document.querySelector('.clearBtn');

  if (isAnyCompleted) {
    btnClearRef.classList.add('clearBtnShow');
  } else {
    btnClearRef?.classList.remove('clearBtnShow');
  }
}

function showQuantityActiveTodo(todos) {
  const quantityRef = document.querySelector('span');
  const activeTodos = todos.filter(todo => todo.checked !== true);
  if (quantityRef) {
    quantityRef.textContent = activeTodos.length + ` item left`;
  }
}

function checkIsCompleted(todos) {
  const inputRef = document.querySelector('.mainInput');

  if (todos.every(todo => todo.checked === true)) {
    inputRef.classList.add('extra');
  } else {
    inputRef.classList.remove('extra');
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
const todoArray = parseLocalStorage();
const form = createForm();
const todoList = createTodoList(todoArray);
const footerDiv = createFooterForm();
checkAndShowCompleted();

const btnClearRef = document.querySelector('.clearBtn');
const labelRef = document.querySelector('.label');

form.addEventListener('submit', handleTodoAdd);
todoList.addEventListener('click', handleCompleteAndDelete);
todoList.addEventListener('dblclick', handleChangeText);
labelRef.addEventListener('click', handleAllCompleted);
footerDiv.addEventListener('click', handleFilter);
btnClearRef.addEventListener('click', handleClearCompleted);
