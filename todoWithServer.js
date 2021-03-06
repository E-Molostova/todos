import { callAPI } from './fetchTodos.js';

class TodoService {
  getTodos() {
    callAPI('/todos', {
      method: 'GET',
    }).then(data => todoApp.render(data));
  }

  addTodo(text) {
    callAPI('/todos', {
      method: 'POST',
      body: JSON.stringify(text),
    }).then(data => todoApp.render(data));
  }

  deleteTodo(id) {
    callAPI('/todos', {
      query: { id },
      method: 'DELETE',
    }).then(data => {
      todoApp.render(data);
    });
  }

  clearCompleted() {
    callAPI('/todos/clear-completed', {
      method: 'DELETE',
    }).then(data => {
      todoApp.render(data);
    });
  }

  todoOneCompleted(id, completed) {
    callAPI(`/todos`, {
      method: 'PUT',
      query: { id },
      body: JSON.stringify({ id, completed: !completed }),
    }).then(data => {
      todoApp.render(data);
    });
  }

  todoAllCompleted() {
    callAPI('/todos/toggle-completed', {
      method: 'PUT',
    }).then(data => {
      todoApp.render(data);
    });
  }

  toChangeText(id, description) {
    callAPI(`/todos`, {
      method: 'PUT',
      query: { id },
      body: JSON.stringify({ id, description }),
    }).then(data => todoApp.render(data));
  }
}

const todoService = new TodoService();

class TodoHandlers {
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

  handleCompleteTodo(e) {
    if (e.target.nodeName === 'LABEL') {
      const targetId = e.target.parentNode.id;
      const completed = e.target.closest('li').children[0].completed;
      todoService.todoOneCompleted(targetId, completed);
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

      target.addEventListener('keydown', todoHandlers.handleEnterAndEscape);
      target.addEventListener('blur', todoHandlers.handleBlur);
    }
  }

  handleEnterAndEscape(e) {
    if (e.keyCode === 13) {
      todoHandlers.handleChanges(e);
    }

    if (e.keyCode === 27) {
      callAPI('/todos').then(data => todoApp.renderTodoList(data));
    }
  }

  handleBlur(e) {
    todoHandlers.handleChanges(e);
  }

  handleChanges(e) {
    const targetId = e.target.parentNode.id;
    const btn = e.target.parentNode.children[3];
    btn.classList.remove('editable');
    const newDescription = e.target.innerText;
    todoService.toChangeText(targetId, newDescription);
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
}

const todoHandlers = new TodoHandlers();

class Form {
  constructor() {
    this.layout = this.createForm();
  }

  createForm() {
    const form = document.createElement('form');
    form.classList.add('form');

    form.addEventListener('submit', todoHandlers.handleSubmit);
    return form;
  }
}

class MainInput {
  constructor() {
    this.layout = this.createInput();
  }

  createInput() {
    const input = document.createElement('input');
    input.id = 'mainInput';
    input.type = 'text';
    input.autocomplete = 'off';
    input.placeholder = 'What needs to be done?';
    input.classList.add('mainInput');
    return input;
  }
}

class FormTitle {
  constructor() {
    this.layout = this.createTitle();
  }

  createTitle() {
    const title = document.createElement('h1');
    title.textContent = 'Todos';
    title.classList.add('title');
    return title;
  }
}

class LabelForForm {
  constructor() {
    this.layout = this.createLabel();
  }

  createLabel() {
    const label = document.createElement('label');
    label.classList.add('label');
    label.setAttribute('for', 'mainInput');

    label.addEventListener('click', todoService.todoAllCompleted);
    return label;
  }
}

class TodoItem {
  constructor({ id, description, completed }) {
    this.id = id;
    this.description = description;
    this.completed = completed;
    this.layout = this.createLi();
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
    button.textContent = '??';
    button.addEventListener('click', todoHandlers.handleDelete);

    itemTodo.append(isCompleted, label, text, button);
    itemTodo.addEventListener('click', todoHandlers.handleCompleteTodo);
    itemTodo.addEventListener('dblclick', todoHandlers.handleEditingMode);
    return itemTodo;
  }
}

class TodoList {
  constructor() {
    this.layout = this.createTodoList();
  }

  createTodoList() {
    const todoList = document.createElement('ul');
    todoList.classList.add('todoList');
    return todoList;
  }
}

class FooterForm {
  constructor() {
    this.layout = this.createFooter();
  }

  createFooter() {
    const footerDiv = document.createElement('div');
    footerDiv.classList.add('footerDiv');
    return footerDiv;
  }
}

class ActiveQuantity {
  constructor() {
    this.layout = this.createQuantity();
  }

  createQuantity() {
    const quantity = document.createElement('span');
    return quantity;
  }
}

class FilterBtns {
  constructor() {
    this.layout = this.createFilterBtns();
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
    filterBtns.addEventListener('click', todoHandlers.handleFilter);
    return filterBtns;
  }
}

class ClearBtn {
  constructor() {
    this.layout = this.createClearBtn();
  }

  createClearBtn() {
    const btnClear = document.createElement('button');
    btnClear.type = 'button';
    btnClear.classList.add('clearBtn');
    btnClear.textContent = 'Clear completed';
    btnClear.id = 'clear';
    btnClear.addEventListener('click', todoService.clearCompleted);
    return btnClear;
  }
}

class App {
  constructor() {
    this.title = new FormTitle();
    this.form = new Form();
    this.label = new LabelForForm();
    this.input = new MainInput();
    this.list = new TodoList();
    this.footerForm = new FooterForm();
    this.quantity = new ActiveQuantity();
    this.filterBtns = new FilterBtns();
    this.clearBtn = new ClearBtn();
  }

  start() {
    document.body.prepend(
      this.title.layout,
      this.form.layout,
      this.label.layout,
      this.list.layout,
      this.footerForm.layout,
    );
    this.form.layout.appendChild(this.input.layout);
    this.footerForm.layout.append(
      this.quantity.layout,
      this.filterBtns.layout,
      this.clearBtn.layout,
    );
    todoService.getTodos();
  }

  render(array) {
    this.renderTodoList(array);
    this.renderFooterForm(array);
    this.checkForLabel(array);
  }

  renderTodoList(array) {
    this.list.layout.innerHTML = '';
    if (array.length !== 0) {
      const todos = array.map(todo => {
        const itemTodo = new TodoItem({
          id: todo.id,
          description: todo.description,
          completed: todo.completed,
        });
        return itemTodo.layout;
      });
      this.list.layout.append(...todos);
    }
  }

  renderFooterForm(array) {
    if (array.length === 0) {
      this.footerForm.layout.style.display = 'none';
      this.label.layout.style.display = 'none';
    } else {
      this.footerForm.layout.style.display = 'flex';
      this.label.layout.style.display = 'flex';
    }

    const activeTodos = array.filter(todo => todo.completed !== true);
    this.quantity.layout.textContent = activeTodos.length + ` item left`;

    const isAnyCompleted = array.some(todo => todo.completed === true);
    if (isAnyCompleted) {
      this.clearBtn.layout?.classList.add('clearBtnShow');
    } else {
      this.clearBtn.layout?.classList.remove('clearBtnShow');
    }
  }

  checkForLabel(array) {
    if (array.every(todo => todo.completed === true)) {
      this.label.layout.classList.add('extra');
    } else {
      this.label.layout.classList.remove('extra');
    }
  }
}

const todoApp = new App();
todoApp.start();
