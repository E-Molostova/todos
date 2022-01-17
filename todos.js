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
    button.textContent = '×';

    itemTodo.append(completed, label, text, button);

    return itemTodo;
  });
  todoListRef.append(...todoItems);
  return todoListRef;
}

function createFooterForm() {
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

  checkIsCompleted(todos);
  showQuantityActiveTodo(todos);
  checkAndShowCompleted();
  checkToShowFooter(todos);
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

  const newTodoArray = [...todoArray, newTodo];
  setLocalStorageAndChecks(newTodoArray);
  createTodoList(newTodoArray);

  form.reset();
}

function handleCompleteAndDelete(e) {
  let todoArray = parseLocalStorage();

  if (e.target.nodeName === 'BUTTON') {
    const itemId = e.target.parentNode.id;

    const newTodoArray = todoArray.filter(todo => {
      return todo.id !== itemId;
    });
    setLocalStorageAndChecks(newTodoArray);
    createTodoList(newTodoArray);
  }

  if (e.target.nodeName === 'LABEL') {
    const targetId = e.target.closest('li').id;
    const newTodoArray = todoArray.map(todo => {
      if (todo.id === targetId) {
        todo.checked = !todo.checked;
      }
      return todo;
    });
    setLocalStorageAndChecks(newTodoArray);
    createTodoList(newTodoArray);
  }
}

function handleAllCompleted() {
  const todoArray = parseLocalStorage();
  const isAnyActive = todoArray.some(todo => todo.checked === false);

  if (isAnyActive) {
    const newTodoArray = todoArray.map(todo => {
      todo.checked = true;
      return todo;
    });
    setLocalStorageAndChecks(newTodoArray);
    createTodoList(newTodoArray);
  } else {
    const newTodoArray = todoArray.map(todo => {
      todo.checked = false;
      return todo;
    });
    setLocalStorageAndChecks(newTodoArray);
    createTodoList(newTodoArray);
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
  const todoArray = parseLocalStorage();
  const newTodoArray = todoArray.filter(todo => todo.checked === false);
  setLocalStorageAndChecks(newTodoArray);
  createTodoList(newTodoArray);
}

function handleChangeText(e) {
  if (e.target.tagName === 'P') {
    const target = e.target;
    const targetId = e.target.parentNode.id;
    const isChecked = e.target.parentNode.children[0].checked;
    const label = e.target.parentNode.children[1];
    label.style.display = 'none';
    const btn = e.target.parentNode.children[3];
    btn.classList.add('editable');

    target.setAttribute('contenteditable', 'true');

    const editInput = document.createElement('input');
    target.appendChild(editInput);
    editInput.value = target.innerText;
    target.innerText = editInput.value;

    target.addEventListener('keydown', handleEnter);
    target.addEventListener('blur', handleBlur);
    function handleEnter(e) {
      const todoArray = parseLocalStorage();
      if (e.keyCode === 13) {
        handleChanges();
      }
      if (e.keyCode === 27) {
        setLocalStorageAndChecks(todoArray);
        createTodoList(todoArray);
      }
    }
    function handleBlur(e) {
      handleChanges();
    }
    function handleChanges() {
      let todoArray = parseLocalStorage();
      btn.classList.remove('editable');
      const newTodo = {
        id: targetId,
        description: target.innerText,
        checked: isChecked,
      };
      const newTodoArray = todoArray.map(todo => {
        if (todo.id === targetId) {
          todo = newTodo;
        }
        return todo;
      });
      setLocalStorageAndChecks(newTodoArray);
      createTodoList(newTodoArray);
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

function checkToShowFooter(todos) {
  const footerForm = document.querySelector('.footerDiv');

  if (todos.length === 0) {
    footerForm.style.display = 'none';
  } else {
    footerForm.style.display = 'flex';
  }
}

function checkIsCompleted(todos) {
  const inputRef = document.querySelector('.mainInput');

  if (todos.every(todo => todo.checked === true)) {
    inputRef.classList.add('extra');
  } else {
    inputRef.classList.remove('extra');
  }

  const labelRef = document.querySelector('.label');

  if (todos.length === 0) {
    labelRef.style.display = 'none';
  } else {
    labelRef.style.display = 'flex';
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

const form = createForm();
const todoArray = parseLocalStorage();
const todoList = createTodoList(todoArray);
const footerDiv = createFooterForm();
setLocalStorageAndChecks(todoArray);

const btnClearRef = document.querySelector('.clearBtn');
const labelRef = document.querySelector('.label');

form.addEventListener('submit', handleTodoAdd);
todoList.addEventListener('click', handleCompleteAndDelete);
todoList.addEventListener('dblclick', handleChangeText);
labelRef.addEventListener('click', handleAllCompleted);
footerDiv.addEventListener('click', handleFilter);
btnClearRef.addEventListener('click', handleClearCompleted);
