import { callAPI } from './fetchTodos.js';

class TodoService {
  getTodos() {
    callAPI('/todos').then(data => todoApp.render(data));
  }

  addTodo(item) {
    callAPI('/todos', {
      method: 'POST',
      body: JSON.stringify(item),
      headers: {
        'Content-Type': 'application/json; charset=UTF-8',
      },
    }).then(data => todoApp.render(data));
  }

  deleteTodo(id) {
    callAPI(`/todos/?id=${id}`, {
      method: 'DELETE',
    }).then(data => {
      todoApp.render(data);
    });
  }

  handleAllCompleted() {
    callAPI('/todos/toggle-completed').then(data => {
      todoApp.render(data);
    });
  }

  handleClearCompleted() {
    callAPI('/todos/clear-completed').then(data => {
      todoApp.render(data);
    });
  }

  handleFilter(e) {
    switch (e.target.id) {
      case 'All':
        callAPI('/todos').then(data => todoApp.renderTodoList(data));
        break;

      case 'Active':
        callAPI('/todos')
          .then(data => data.filter(todo => todo.completed === false))
          .then(data => todoApp.renderTodoList(data));
        break;

      case 'Completed':
        callAPI('/todos')
          .then(data => data.filter(todo => todo.completed === true))
          .then(data => todoApp.renderTodoList(data));
        break;

      default:
        break;
    }
  }

  handleSubmit(e) {
    e.preventDefault();
    const input = document.querySelector('#mainInput');
    const inputText = input.value.trim();
    if (inputText !== '') {
      todoService.addTodo(inputText);
    } else {
      alert('Write task description please!');
    }

    const form = input.closest('form');
    form.reset();
  }

  handleDelete(e) {
    if (e.target.nodeName === 'BUTTON') {
      const itemId = e.target.parentNode.id;
      todoService.deleteTodo(itemId);
    }
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

    form.append(input);
    form.addEventListener('submit', todoService.handleSubmit);

    return form;
  }
}

class LabelForForm {
  constructor() {
    this.label = this.createLabel();
  }

  createLabel() {
    const label = document.createElement('label');
    label.classList.add('label');
    label.setAttribute('for', 'mainInput');
    label.addEventListener('click', todoService.handleAllCompleted);
    return label;
  }
}

class FooterForm {
  constructor() {
    this.footerForm = this.createFooter();
  }

  createFooter() {
    const footerDiv = document.createElement('div');
    footerDiv.classList.add('footerDiv');
    return footerDiv;
  }
}

class ActiveQuantity {
  constructor() {
    this.quantity = this.createQuantity();
  }

  createQuantity() {
    const quantity = document.createElement('span');
    // const activeTodos = array.filter(todo => todo.completed !== true);
    // quantity.textContent = activeTodos.length + ` item left`;
    quantity.textContent = ` item left`;
    return quantity;
  }
}

class FilterBtns {
  constructor() {
    this.filterBtns = this.createFilterBtns();
  }
  createFilterBtns() {
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
    return filterBtns;
  }
}

class ClearBtn {
  constructor() {
    this.clearBtn = this.createClearBtn();
  }

  createClearBtn() {
    const btnClear = document.createElement('button');
    btnClear.type = 'button';
    btnClear.classList.add('clearBtn');
    btnClear.textContent = 'Clear completed';
    btnClear.id = 'clear';
    btnClear.addEventListener('click', todoService.handleClearCompleted);
    return btnClear;
  }
}

class TodoItem {
  constructor({ id, description, completed }) {
    this.id = id;
    this.description = description;
    this.completed = completed;
    this.item = this.createLi();
  }

  createLi() {
    const itemTodo = document.createElement('li');
    itemTodo.classList.add('todoItem');
    itemTodo.id = this.id;

    const isCompleted = document.createElement('input');
    isCompleted.type = 'checkbox';
    isCompleted.id = 'check';
    isCompleted.completed = this.completed;
    this.completed
      ? isCompleted.classList.add('custom-checkbox', 'extra')
      : isCompleted.classList.add('custom-checkbox');

    const label = document.createElement('label');
    label.setAttribute('for', 'check');
    label.setAttribute('id', 'label');

    const text = document.createElement('p');
    this.completed
      ? text.classList.add('description', 'todoCompleted')
      : text.classList.add('description');
    text.textContent = this.description;

    const button = document.createElement('button');
    button.type = 'button';
    button.classList.add('btn');
    button.textContent = '×';

    itemTodo.append(isCompleted, label, text, button);
    itemTodo.addEventListener('click', this.handleCompleteTodo.bind(this));
    itemTodo.addEventListener('dblclick', this.handleEditingMode.bind(this));
    return itemTodo;
  }

  handleCompleteTodo(e) {
    if (e.target.nodeName === 'LABEL') {
      const targetId = e.target.closest('li').id;
      const completed = e.target.closest('li').children[0].completed;
      callAPI(`/todos/?id=${targetId}`, {
        method: 'PUT',
        body: JSON.stringify({ id: targetId, completed: !completed }),
        headers: {
          'Content-Type': 'application/json; charset=UTF-8',
        },
      }).then(data => {
        todoApp.render(data);
      });
    }
  }

  handleEditingMode(e) {
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
      callAPI('/todos').then(data => todoApp.renderTodoList(data));
    }
  }

  handleBlur(e) {
    this.handleChanges(e);
  }

  handleChanges(e) {
    const targetId = e.target.parentNode.id;
    const btn = e.target.parentNode.children[3];
    btn.classList.remove('editable');
    const newDescription = e.target.innerText;
    callAPI(`/todos/?id=${targetId}`, {
      method: 'PUT',
      body: JSON.stringify({ id: targetId, description: newDescription }),
      headers: {
        'Content-Type': 'application/json; charset=UTF-8',
      },
    }).then(data => todoApp.render(data));
  }
}

class App {
  constructor() {
    this.form = new Form();
    this.label = new LabelForForm();
    this.footerForm = new FooterForm();
    this.quantity = new ActiveQuantity();
    this.filterBtns = new FilterBtns();
    this.clearBtn = new ClearBtn();
  }

  start() {
    this.form.form.append(this.label.label);
    document.body.appendChild(this.footerForm.footerForm);
    this.footerForm.footerForm.append(
      this.quantity.quantity,
      this.filterBtns.filterBtns,
      this.clearBtn.clearBtn,
    );
    callAPI('/todos').then(data => {
      this.createTodoList(data);
      this.createFooterForm(data);
      this.checksForRefresh(data);
    });
  }
  render(array) {
    this.renderTodoList(array);
    this.renderFooterForm(array);
    this.checksForRefresh(array);
  }

  handleSubmit(e) {
    e.preventDefault();
    const input = document.querySelector('#mainInput');
    const inputText = input.value.trim();
    if (inputText !== '') {
      todoService.addTodo(inputText);
    } else {
      alert('Write task description please!');
    }

    const form = input.closest('form');
    form.reset();
  }

  createTodoList(array) {
    if (array.length !== 0) {
      const todoList = document.createElement('ul');
      todoList.addEventListener('click', todoService.handleDelete);
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
        completed: todo.completed,
      });
      return itemTodo.item;
    });
    return todoItems;
  }

  createFooterForm(array) {}

  renderFooterForm(array) {
    const footerDivRef = document.querySelector('.footerDiv');

    const quantity = document.querySelector('span');
    const activeTodos = array.filter(todo => todo.completed !== true);
    quantity.textContent = activeTodos.length + ` item left`;

    const btnClear = document.querySelector('#clear');
    const isAnyCompleted = array.some(todo => todo.completed === true);
    if (isAnyCompleted) {
      btnClear?.classList.add('clearBtnShow');
    } else {
      btnClear?.classList.remove('clearBtnShow');
    }
    footerDivRef.prepend(quantity);
    footerDivRef.append(btnClear);
  }

  checksForRefresh(array) {
    if (array.length === 0) {
      this.footerForm.footerForm.style.display = 'none';
    } else {
      this.footerForm.footerForm.style.display = 'flex';
    }

    if (array.length === 0) {
      this.label.label.style.display = 'none';
    } else {
      this.label.label.style.display = 'flex';
    }

    const inputRef = document.querySelector('.mainInput');
    if (array.every(todo => todo.completed === true)) {
      inputRef.classList.add('extra');
    } else {
      inputRef.classList.remove('extra');
    }

    // const btnClear = footerForm.querySelector('.clearBtn');
    // const isAnyCompleted = array.some(todo => todo.completed === true);
    // if (isAnyCompleted) {
    //   btnClear?.classList.add('clearBtnShow');
    // } else {
    //   btnClear?.classList.remove('clearBtnShow');
    // }
  }
}

const todoApp = new App();
todoApp.start();
