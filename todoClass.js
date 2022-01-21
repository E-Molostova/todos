function uuidv4() {
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
    (
      c ^
      (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
    ).toString(16),
  );
}

class MyEventEmitter {
  constructor() {
    this.events = {};
  }
  on(event, listener) {
    if (typeof this.events[event] !== 'object') {
      this.events[event] = [];
    }
    this.events[event].push(listener);
    return () => this.removeListener(event, listener);
  }
  off(event, listener) {
    if (typeof this.events[event] === 'object') {
      const idx = this.events[event].indexOf(listener);
      if (idx > -1) {
        this.events[event].splice(idx, 1);
      }
    }
  }
  emit(event, ...args) {
    if (typeof this.events[event] === 'object') {
      this.events[event].forEach(listener => listener.apply(this, args));
    }
  }
}

class TodoService extends MyEventEmitter {
  constructor() {
    super();
    this.on('LocalStorageChange', () => {
      todoApp.render();
    });
  }

  parseLocalStorage() {
    return JSON.parse(localStorage.getItem('todoList')) || [];
  }

  setLocalStorage(array) {
    localStorage.setItem('todoList', JSON.stringify(array));
    this.emit('LocalStorageChange');
  }

  addTodo(e) {
    e.preventDefault();
    const input = document.querySelector('#mainInput');
    if (input.value.trim() !== '') {
      const newTodo = {
        id: uuidv4(),
        description: input.value.trim(),
        checked: false,
      };
      const todoArray = todoService.parseLocalStorage();
      const newTodoArray = [...todoArray, newTodo];
      todoService.setLocalStorage(newTodoArray);
    } else {
      alert('Write task description please!');
    }

    const form = input.closest('form');
    form.reset();
  }

  deleteTodo(e) {
    if (e.target.nodeName === 'BUTTON') {
      const itemId = e.target.parentNode.id;
      let todoArray = todoService.parseLocalStorage();
      const newTodoArray = todoArray.filter(todo => todo.id !== itemId);
      todoService.setLocalStorage(newTodoArray);
    }
  }

  handleAllCompleted() {
    const todoArray = todoService.parseLocalStorage();
    const isAnyActive = todoArray.some(todo => todo.checked === false);

    if (isAnyActive) {
      const newTodoArray = todoArray.map(todo => {
        todo.checked = true;
        return todo;
      });
      todoService.setLocalStorage(newTodoArray);
    } else {
      const newTodoArray = todoArray.map(todo => {
        todo.checked = false;
        return todo;
      });
      todoService.setLocalStorage(newTodoArray);
    }
  }

  handleFilter(e) {
    const todoArray = todoService.parseLocalStorage();

    switch (e.target.id) {
      case 'All':
        todoApp.renderTodoList(todoArray);
        break;

      case 'Active':
        const todos = todoArray.filter(todo => todo.checked === false);
        todoApp.renderTodoList(todos);
        break;

      case 'Completed':
        const todosToShow = todoArray.filter(todo => todo.checked === true);
        todoApp.renderTodoList(todosToShow);
        break;

      default:
        break;
    }
  }

  handleClearCompleted() {
    const todoArray = todoService.parseLocalStorage();
    const newTodoArray = todoArray.filter(todo => todo.checked === false);
    todoService.setLocalStorage(newTodoArray);
  }
}

const todoService = new TodoService();

class Form {
  constructor() {
    this.form = this.createForm();
  }

  createForm() {
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
    label.addEventListener('click', todoService.handleAllCompleted);
    form.append(input, label);
    form.addEventListener('submit', todoService.addTodo);

    return form;
  }
}

class TodoItem {
  constructor({ id, description, checked }) {
    this.id = id;
    this.description = description;
    this.checked = checked;
    this.item = this.createLi();
  }

  createLi() {
    const itemTodo = document.createElement('li');
    itemTodo.classList.add('todoItem');
    itemTodo.id = this.id;

    const completed = document.createElement('input');
    completed.type = 'checkbox';
    completed.id = 'check';
    completed.checked = this.checked;
    this.checked
      ? completed.classList.add('custom-checkbox', 'extra')
      : completed.classList.add('custom-checkbox');

    const label = document.createElement('label');
    label.setAttribute('for', 'check');
    label.setAttribute('id', 'label');

    const text = document.createElement('p');
    this.checked
      ? text.classList.add('description', 'todoCompleted')
      : text.classList.add('description');
    text.textContent = this.description;

    const button = document.createElement('button');
    button.type = 'button';
    button.classList.add('btn');
    button.textContent = '×';

    itemTodo.append(completed, label, text, button);
    itemTodo.addEventListener('click', this.handleCompleteTodo.bind(this));
    itemTodo.addEventListener('dblclick', this.handleChangeText.bind(this));
    return itemTodo;
  }

  handleCompleteTodo(e) {
    if (e.target.nodeName === 'LABEL') {
      const targetId = e.target.closest('li').id;
      const todoArray = todoService.parseLocalStorage();
      const newTodoArray = todoArray.map(todo => {
        if (todo.id === targetId) {
          todo.checked = !todo.checked;
        }
        return todo;
      });
      todoService.setLocalStorage(newTodoArray);
    }
  }

  handleChangeText(e) {
    if (e.target.tagName === 'P') {
      const target = e.target;
      const targetItem = e.target.parentNode;
      const label = targetItem.children[1];
      label.style.display = 'none';
      const btn = targetItem.children[3];
      btn.classList.add('editable');

      target.setAttribute('contenteditable', 'true');

      const editInput = document.createElement('input');
      target.appendChild(editInput);
      editInput.focus();
      editInput.value = target.innerText;
      target.innerText = editInput.value;

      let [r, s] = [document.createRange(), window.getSelection()];
      r.selectNodeContents(e.target);
      r.collapse(false);
      s.removeAllRanges();
      s.addRange(r);

      target.addEventListener('keydown', this.handleEnterAndEscape.bind(this));
      target.addEventListener('blur', this.handleBlur.bind(this));
    }
  }

  handleEnterAndEscape(e) {
    if (e.keyCode === 13) {
      this.handleChanges(e);
    }

    if (e.keyCode === 27) {
      const todoArray = todoService.parseLocalStorage();
      todoService.setLocalStorage(todoArray);
    }
  }

  handleBlur(e) {
    this.handleChanges(e);
  }

  handleChanges(e) {
    const targetId = e.target.parentNode.id;
    const isChecked = e.target.parentNode.children[0].checked;
    const btn = e.target.parentNode.children[3];
    btn.classList.remove('editable');

    const todoArray = todoService.parseLocalStorage();
    const newTodo = {
      id: targetId,
      description: e.target.innerText,
      checked: isChecked,
    };
    const newTodoArray = todoArray.map(todo => {
      if (todo.id === targetId) {
        todo = newTodo;
      }
      return todo;
    });
    todoService.setLocalStorage(newTodoArray);
  }
}

class App {
  constructor() {
    this.form = new Form();
  }

  start() {
    this.todoArray = todoService.parseLocalStorage();
    this.createTodoList(this.todoArray);
    this.createFooterForm(this.todoArray);
  }

  render() {
    this.todoArray = todoService.parseLocalStorage();
    this.renderTodoList(this.todoArray);
    this.renderFooterForm(this.todoArray);
    this.checksForRefresh(this.todoArray);
  }

  createTodoList(array) {
    if (array.length !== 0) {
      const todoList = document.createElement('ul');
      todoList.addEventListener('click', todoService.deleteTodo);
      todoList.classList.add('todoList');
      const form = document.querySelector('form');
      form.appendChild(todoList);
      const todos = this.listLayout(array);
      todoList.append(...todos);
    }
  }

  renderTodoList(array) {
    const todoListRef = document.querySelector('.todoList');
    if (todoListRef) {
      todoListRef.innerHTML = '';
      const todos = this.listLayout(array);
      todoListRef.append(...todos);
    }
  }

  listLayout(array) {
    const todoItems = array.map(todo => {
      const itemTodo = new TodoItem({
        id: todo.id,
        description: todo.description,
        checked: todo.checked,
      });
      return itemTodo.item;
    });
    return todoItems;
  }

  createFooterForm(array) {
    const footerDiv = document.createElement('div');
    footerDiv.classList.add('footerDiv');
    const form = document.querySelector('form');
    form.appendChild(footerDiv);
    this.checksForRefresh(array);

    const quantity = document.createElement('span');
    const activeTodos = array.filter(todo => todo.checked !== true);
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
    filterBtns.addEventListener('click', todoService.handleFilter);

    const btnClear = document.createElement('button');
    btnClear.type = 'button';
    btnClear.classList.add('clearBtn');
    btnClear.textContent = 'Clear completed';
    btnClear.id = 'clear';
    btnClear.addEventListener('click', todoService.handleClearCompleted);
    footerDiv.append(quantity, filterBtns, btnClear);
  }

  renderFooterForm(array) {
    const footerDivRef = document.querySelector('.footerDiv');

    const quantity = document.querySelector('span');
    quantity.innerHTML = '';
    const activeTodos = array.filter(todo => todo.checked !== true);
    quantity.textContent = activeTodos.length + ` item left`;

    const btnClear = document.querySelector('#clear');
    const isAnyCompleted = array.some(todo => todo.checked === true);
    if (isAnyCompleted) {
      btnClear?.classList.add('clearBtnShow');
    } else {
      btnClear?.classList.remove('clearBtnShow');
    }
    footerDivRef.prepend(quantity);
    footerDivRef.append(btnClear);
  }

  checksForRefresh(array) {
    const footerForm = document.querySelector('.footerDiv');
    if (array.length === 0) {
      footerForm.style.display = 'none';
    }
    if (array.length === 0 && footerForm) {
      footerForm.style.display = 'flex';
    }

    const labelRef = document.querySelector('.label');
    if (array.length === 0) {
      labelRef.style.display = 'none';
    } else {
      labelRef.style.display = 'flex';
    }

    const inputRef = document.querySelector('.mainInput');
    if (array.every(todo => todo.checked === true)) {
      inputRef.classList.add('extra');
    } else {
      inputRef.classList.remove('extra');
    }
  }
}

const todoApp = new App();
todoApp.start();
