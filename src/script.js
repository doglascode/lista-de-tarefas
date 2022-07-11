const createTaskForm = document.querySelector('.form-container');
const alertContainer = document.querySelector('.alert-container');
const overlayContainer = document.querySelector('.overlay-container');
const storagedTasks = localStorage.getItem('tasks');

let tasks = storagedTasks ? JSON.parse(storagedTasks) : [];

function createTaskFormSubmit(event) {
  event.preventDefault();
  const taskName = event.target.querySelector('.input').value;

  if (!taskName) {
    alertContainer.textContent = 'Insira um nome para criar uma nova tarefa';
    return;
  }

  const task = {
    id: generateID(),
    name: taskName,
    status: 'pending'
  };

  tasks.push(task);
  updateLocalStorage();
  renderTaskIntoDOM(task);
  event.target.reset();
  alertContainer.textContent = '';
}

function renderTaskIntoDOM({ id, name, status }) {
  const ulClassName = status === 'pending' ? 'todo-items' : 'done-items';
  const taskListUl = document.querySelector(`.task-list.${ulClassName}`);
  const li = document.createElement('li');

  li.classList.add('item', status);
  li.setAttribute('data-id', id);
  li.innerHTML = `
    <span class="item-text">${name}</span>
    <div class="item-actions" data-id="${id}"></div>
  `;
  createTaskButtons(li);
  taskListUl.appendChild(li);
}

function createTaskButtons(taskElement) {
  const itemActionsDiv = taskElement.querySelector('.item-actions');

  itemActionsDiv.innerHTML = `
    <button data-action="update" class="fa-solid fa-pen-to-square"></button>
    <button data-action="delete" class="fa-solid fa-xmark"></button>
  `;
  itemActionsDiv.addEventListener('click', taskButtonClick);
}

function taskButtonClick({ target }) {
  if (target.nodeName !== 'BUTTON') return;
  
  const taskID = target.offsetParent.dataset.id;
  const actionName = target.dataset.action;
  
  const buttonClickAction = {
    update: createUpdateModal,
    delete: deleteTask
  };

  return buttonClickAction[actionName](taskID);
}

function createUpdateModal(taskID) {
  const updateContainer = document.createElement('div');
  const task = getTaskObject(taskID);

  updateContainer.classList.add('update-container', 'modal-container');
  updateContainer.innerHTML = `
    <h1 class="title">Editar Conteúdo</h1>
    <button class="btn-close fa-solid fa-xmark" tabindex="0"></button>
  `;

  updateContainer.appendChild(createUpdateModalForm(task));
  overlayContainer.appendChild(updateContainer);
  overlayContainer.addEventListener('click', closeOverlayModal);
}

function createUpdateModalForm({ id, name, status }) {
  const form = document.createElement('form');
  const selectDefaultValue = status === 'done' && 'selected';

  form.classList.add('form-container');
  form.setAttribute('data-id', id);
  form.innerHTML = `
    <input class="input" placeholder="${name}"/>
    <select class="select">
      <option value="pending">Não feita</option>
      <option value="done" ${selectDefaultValue}>Concluída</option>
    </select>
    <button type="submit" class="btn" tabindex="0">Salvar Alterações</button>
  `;
  form.addEventListener('submit', updateTaskFormSubmit);

  return form;
}

function updateTaskFormSubmit(event) {
  event.preventDefault();
  const task = getTaskObject(event.target.dataset.id);
  const taskName = event.target.querySelector('.input').value;
  const taskStatus = event.target.querySelector('.select').value;

  task.name = taskName || task.name;
  task.status = taskStatus;

  updateTaskIntoDOM();
  updateLocalStorage();
  closeOverlayModal();
}

function updateTaskIntoDOM() {
  const taskListUl = document.querySelectorAll('ul.task-list');

  taskListUl.forEach(list => list.innerHTML = '');
  start();
}

function closeOverlayModal(event) {
  if (!event) {
    overlayContainer.innerHTML = '';
    return;
  };

  const target = event.target;

  if (target === overlayContainer || target.classList.contains('btn-close')) {
    overlayContainer.innerHTML = '';
    return;
  };
}

function deleteTask(taskID) {
  const taskElement = document.querySelector(`.item[data-id="${taskID}"]`);
  const taskObject = getTaskObject(taskID);

  tasks = tasks.filter(task => task.id !==  taskObject.id);
  taskElement.remove();
  updateLocalStorage();
}

function getTaskObject(taskID) {
  const id = typeof taskID !== 'number' ? Number(taskID) : taskID;
  return tasks.find(task => task.id === id);
}

function generateID() {
  return Math.floor(Math.random() * 1000);
}

function updateLocalStorage() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

function start() {
  tasks.forEach(renderTaskIntoDOM);
}

start();

createTaskForm.addEventListener('submit', createTaskFormSubmit);