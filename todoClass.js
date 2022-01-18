function uuidv4() {
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
    (
      c ^
      (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
    ).toString(16),
  );
}

class TodoItem {
  constructor(text) {
    this.id = uuidv4();
    this.description = text;
    this.checked = false;
  }
}

class App {
  constructor() {
    this.todoArray = JSON.parse(window.localStorage.getItem('todoList')) || [];
  }

  render() {
    this.createForm();
    this.createTodoList(this.todoArray);
    this.createFoorterForm();
    this.setLocalStorageAndChecks(this.todoArray);
  }

  parseLocalStorage() {
    return JSON.parse(localStorage.getItem('todoList')) || [];
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
    todoList.addEventListener('click', this.handleCompleteAndDelete.bind(this));
    todoList.addEventListener('dblclick', this.handleChangeText.bind(this));
    form.appendChild(todoList);
    return form;
  }

  createTodoList(array) {
    const todoListRef = document.querySelector('.todoList');
    if (todoListRef) {
      todoListRef.innerHTML = '';
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
        button.textContent = '×';

        itemTodo.append(completed, label, text, button);

        return itemTodo;
      });
      todoListRef.append(...todoItems);
      return todoListRef;
    }
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
      const newTodo = new TodoItem(input.value.trim());
      const todoArray = this.parseLocalStorage();
      const newTodoArray = [...todoArray, newTodo];
      this.setLocalStorageAndChecks(newTodoArray);
      this.createTodoList(newTodoArray);
    } else {
      alert('Write task description please!');
    }

    const form = input.parentNode;
    form.reset();
  }

  handleCompleteAndDelete(e) {
    let todoArray = this.parseLocalStorage();

    if (e.target.nodeName === 'BUTTON') {
      const itemId = e.target.parentNode.id;

      const newTodoArray = todoArray.filter(todo => {
        return todo.id !== itemId;
      });
      this.setLocalStorageAndChecks(newTodoArray);
      this.createTodoList(newTodoArray);
    }

    if (e.target.nodeName === 'LABEL') {
      const targetId = e.target.closest('li').id;
      const newTodoArray = todoArray.map(todo => {
        if (todo.id === targetId) {
          todo.checked = !todo.checked;
        }
        return todo;
      });
      this.setLocalStorageAndChecks(newTodoArray);
      this.createTodoList(newTodoArray);
    }
  }

  setLocalStorageAndChecks(array) {
    localStorage.setItem('todoList', JSON.stringify(array));

    this.checkIsCompleted(array);
    this.showQuantityActiveTodo(array);
    this.checkAndShowCompleted();
    this.checkToShowFooter(array);
  }

  handleAllCompleted() {
    const todoArray = this.parseLocalStorage();
    const isAnyActive = todoArray.some(todo => todo.checked === false);

    if (isAnyActive) {
      const newTodoArray = todoArray.map(todo => {
        todo.checked = true;
        return todo;
      });
      this.setLocalStorageAndChecks(newTodoArray);
      this.createTodoList(newTodoArray);
    } else {
      const newTodoArray = todoArray.map(todo => {
        todo.checked = false;
        return todo;
      });
      this.setLocalStorageAndChecks(newTodoArray);
      this.createTodoList(newTodoArray);
    }
  }

  handleChangeText(e) {
    if (e.target.tagName === 'P') {
      //   const event = e;
      const target = e.target;
      console.log(e.target);
      const targetItem = e.target.parentNode;
      const targetId = targetItem.id;
      const isChecked = targetItem.children[0].checked;
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

      const todoArray = this.parseLocalStorage();

      target.addEventListener('keydown', handleEnter);
      target.addEventListener('blur', handleBlur);
      function handleEnter(e) {
        console.log(e.keyCode);
        // const todoArray = this.parseLocalStorage();
        if (e.keyCode === 13) {
          handleChanges();
        }
        if (e.keyCode === 27) {
          this.setLocalStorageAndChecks(todoArray);
          this.createTodoList(todoArray);
        }
      }
      function handleBlur(e) {
        handleChanges();
      }
      function handleChanges() {
        // let todoArray = this.parseLocalStorage();
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
        console.log(newTodoArray);
        this.setLocalStorageAndChecks(newTodoArray);
        this.createTodoList(newTodoArray);
      }
    }
  }

  handleFilter(e) {
    const todoArray = this.parseLocalStorage();

    switch (e.target.id) {
      case 'All':
        this.createTodoList(todoArray);
        break;

      case 'Active':
        const todos = todoArray.filter(todo => todo.checked === false);
        this.createTodoList(todos);
        break;

      case 'Completed':
        const todosToShow = todoArray.filter(todo => todo.checked === true);
        this.createTodoList(todosToShow);
        break;

      default:
        break;
    }
  }

  handleClearCompleted() {
    const todoArray = this.parseLocalStorage();
    const newTodoArray = todoArray.filter(todo => todo.checked === false);
    this.setLocalStorageAndChecks(newTodoArray);
    this.createTodoList(newTodoArray);
  }

  checkAndShowCompleted() {
    const todoArray = this.parseLocalStorage();
    const isAnyCompleted = todoArray.some(todo => todo.checked === true);
    const btnClearRef = document.querySelector('.clearBtn');

    if (isAnyCompleted) {
      btnClearRef.classList.add('clearBtnShow');
    } else {
      btnClearRef?.classList.remove('clearBtnShow');
    }
  }

  showQuantityActiveTodo(array) {
    const quantityRef = document.querySelector('span');
    const activeTodos = array.filter(todo => todo.checked !== true);
    if (quantityRef) {
      quantityRef.textContent = activeTodos.length + ` item left`;
    }
  }

  checkToShowFooter(array) {
    const footerForm = document.querySelector('.footerDiv');

    if (array.length === 0) {
      footerForm.style.display = 'none';
    } else {
      footerForm.style.display = 'flex';
    }
  }

  checkIsCompleted(todos) {
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
}

const todoApp = new App();
todoApp.render();
