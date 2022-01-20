function uuidv4() {
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
    (
      c ^
      (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
    ).toString(16),
  );
}

class TodoService {
  static parseLocalStorage() {
    return JSON.parse(localStorage.getItem('todoList')) || [];
  }

  static setLocalStorageAndChecks(array) {
    localStorage.setItem('todoList', JSON.stringify(array));

    const todoArray = this.parseLocalStorage();
    const isAnyCompleted = todoArray.some(todo => todo.checked === true);
    const btnClearRef = document.querySelector('.clearBtn');
    if (isAnyCompleted) {
      btnClearRef.classList.add('clearBtnShow');
    } else {
      btnClearRef?.classList.remove('clearBtnShow');
    }

    const quantityRef = document.querySelector('span');
    const activeTodos = array.filter(todo => todo.checked !== true);
    if (quantityRef) {
      quantityRef.textContent = activeTodos.length + ` item left`;
    }

    const footerForm = document.querySelector('.footerDiv');
    if (array.length === 0) {
      footerForm.style.display = 'none';
    } else {
      footerForm.style.display = 'flex';
    }

    const inputRef = document.querySelector('.mainInput');
    if (array.every(todo => todo.checked === true)) {
      inputRef.classList.add('extra');
    } else {
      inputRef.classList.remove('extra');
    }

    const labelRef = document.querySelector('.label');
    if (array.length === 0) {
      labelRef.style.display = 'none';
    } else {
      labelRef.style.display = 'flex';
    }
  }
}

class TodoList {
  static createTodoList(array) {
    const todoListRef = document.querySelector('.todoList');

    if (todoListRef) {
      todoListRef.innerHTML = '';

      const todoItems = array.map(todo => {
        const itemTodo = new TodoItem({
          id: todo.id,
          description: todo.description,
          checked: todo.checked,
        });
        return itemTodo.item;
      });
      todoListRef.append(...todoItems);
      return todoListRef;
    }
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
      const todoArray = TodoService.parseLocalStorage();

      const targetId = e.target.closest('li').id;
      const newTodoArray = todoArray.map(todo => {
        if (todo.id === targetId) {
          todo.checked = !todo.checked;
        }
        return todo;
      });

      TodoService.setLocalStorageAndChecks(newTodoArray);
      TodoList.createTodoList(newTodoArray);
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
      const todoArray = TodoService.parseLocalStorage();
      TodoService.setLocalStorageAndChecks(todoArray);
      TodoList.createTodoList(todoArray);
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

    const todoArray = TodoService.parseLocalStorage();
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

    TodoService.setLocalStorageAndChecks(newTodoArray);
    TodoList.createTodoList(newTodoArray);
  }
}

class App {
  constructor() {
    this.todoArray = JSON.parse(localStorage.getItem('todoList')) || [];
  }

  render() {
    this.createForm();
    TodoList.createTodoList(this.todoArray);
    this.createFoorterForm();
    TodoService.setLocalStorageAndChecks(this.todoArray);
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

    form.addEventListener('submit', this.handleTodoAdd.bind(this));

    const label = document.createElement('label');
    label.classList.add('label');
    label.setAttribute('for', 'mainInput');
    label.addEventListener('click', this.handleAllCompleted.bind(this));
    form.append(input, label);

    const todoList = document.createElement('ul');
    todoList.classList.add('todoList');

    todoList.addEventListener('click', this.handleDelete.bind(this));
    form.appendChild(todoList);
    return form;
  }

  createFoorterForm() {
    const footerDiv = document.createElement('div');
    footerDiv.classList.add('footerDiv');
    const form = document.querySelector('.form');
    form.append(footerDiv);

    const quantity = document.createElement('span');
    const activeTodos = this.todoArray.filter(todo => todo.checked !== true);
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
    btnClear.addEventListener('click', this.handleClearCompleted.bind(this));

    footerDiv.append(quantity, filterBtns, btnClear);
    footerDiv.addEventListener('click', this.handleFilter.bind(this));
    return footerDiv;
  }

  handleTodoAdd(e) {
    e.preventDefault();
    const input = document.querySelector('#mainInput');
    if (input.value.trim() !== '') {
      const newTodo = new TodoItem({
        id: uuidv4(),
        description: input.value.trim(),
        checked: false,
      });

      const itemToAdd = {
        id: newTodo.id,
        description: newTodo.description,
        checked: newTodo.checked,
      };
      const todoArray = TodoService.parseLocalStorage();
      const newTodoArray = [...todoArray, itemToAdd];
      TodoService.setLocalStorageAndChecks(newTodoArray);
      TodoList.createTodoList(newTodoArray);
    } else {
      alert('Write task description please!');
    }

    const form = input.parentNode;
    form.reset();
  }

  handleDelete(e) {
    let todoArray = TodoService.parseLocalStorage();

    if (e.target.nodeName === 'BUTTON') {
      const itemId = e.target.parentNode.id;
      const newTodoArray = todoArray.filter(todo => todo.id !== itemId);
      TodoService.setLocalStorageAndChecks(newTodoArray);
      TodoList.createTodoList(newTodoArray);
    }
  }

  handleAllCompleted() {
    const todoArray = TodoService.parseLocalStorage();
    const isAnyActive = todoArray.some(todo => todo.checked === false);

    if (isAnyActive) {
      const newTodoArray = todoArray.map(todo => {
        todo.checked = true;
        return todo;
      });
      TodoService.setLocalStorageAndChecks(newTodoArray);
      TodoList.createTodoList(newTodoArray);
    } else {
      const newTodoArray = todoArray.map(todo => {
        todo.checked = false;
        return todo;
      });
      TodoService.setLocalStorageAndChecks(newTodoArray);
      TodoList.createTodoList(newTodoArray);
    }
  }

  handleFilter(e) {
    const todoArray = TodoService.parseLocalStorage();

    switch (e.target.id) {
      case 'All':
        TodoList.createTodoList(todoArray);
        break;

      case 'Active':
        const todos = todoArray.filter(todo => todo.checked === false);
        TodoList.createTodoList(todos);
        break;

      case 'Completed':
        const todosToShow = todoArray.filter(todo => todo.checked === true);
        TodoList.createTodoList(todosToShow);
        break;

      default:
        break;
    }
  }

  handleClearCompleted() {
    const todoArray = TodoService.parseLocalStorage();
    const newTodoArray = todoArray.filter(todo => todo.checked === false);
    TodoService.setLocalStorageAndChecks(newTodoArray);
    TodoList.createTodoList(newTodoArray);
  }
}

const todoApp = new App();
todoApp.render();
