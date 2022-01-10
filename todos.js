const form = document.createElement('form');
document.body.prepend(form);

const input = document.createElement('input');
input.type = 'text';
input.autocomplete = 'off';
input.placeholder = 'what needs to be done?';
form.appendChild(input);

const todoList = document.createElement('ul');
form.append(todoList);

form.addEventListener('submit', handleTodoAdd);
// todoList.addEventListener('click', handleClick);

function handleTodoAdd(e) {
  e.preventDefault();

  const liItem = createItem(input.value);
  todoList.append(liItem);

  form.reset();
}

function createItem(text) {
  const liItem = document.createElement('li');
  liItem.classList.add('itemTodo');

  const itemText = document.createElement('p');
  itemText.textContent = text;

  const complete = document.createElement('input');
  complete.setAttribute('type', 'checkbox');

  const deleteBtn = createDeleteBtn(liItem);

  liItem.prepend(complete, itemText);
  return liItem;
}

function createDeleteBtn(liItem) {
  const btn = document.createElement('button');
  btn.type = 'text';
  btn.textContent = 'X';
  liItem.appendChild(btn);
  btn.addEventListener('click', () => liItem.remove());
}

// function handleClick(e) {
//   if (e.currentTarget === e.target) {
//     return;
//   }

//   // if (e.target.nodeName === 'LI') {

//   // }

//   // // const text= e.target.closest('li').closest('p');
//   // console.log(e.target.closest('li'));
//   // const input = e.target.closest('input');

//   // if (input?.checked) {
//   //    e.target.closest('li').classList.toggle('itemCompleted')
//   // }
// }
