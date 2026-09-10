const form = document.querySelector('#user-form');
const list = document.querySelector('#user-list');
const message = document.querySelector('#message');
const idInput = document.querySelector('#user-id');
const submitButton = document.querySelector('#submit-button');
const cancelButton = document.querySelector('#cancel-button');

function resetForm() {
  form.reset();
  idInput.value = '';
  submitButton.textContent = 'Agregar usuario';
  cancelButton.hidden = true;
}

function editUser(user) {
  idInput.value = user.id;
  form.elements.name.value = user.name;
  form.elements.email.value = user.email;
  submitButton.textContent = 'Guardar cambios';
  cancelButton.hidden = false;
  form.elements.name.focus();
}

async function request(url, options) {
  const response = await fetch(url, options);
  if (response.status === 204) return null;
  const body = await response.json();
  if (!response.ok) throw new Error(body.error || 'Ocurrió un error.');
  return body;
}

async function loadUsers() {
  try {
    const users = await request('/api/users');
    list.replaceChildren(...users.map((user) => {
      const item = document.createElement('li');
      const details = document.createElement('span');
      const name = document.createElement('strong');
      const email = document.createElement('small');
      name.textContent = user.name;
      email.textContent = user.email;
      details.append(name, email);
      const editButton = document.createElement('button');
      editButton.textContent = 'Editar';
      editButton.className = 'edit';
      editButton.onclick = () => editUser(user);
      const deleteButton = document.createElement('button');
      deleteButton.textContent = 'Eliminar';
      deleteButton.className = 'delete';
      deleteButton.onclick = async () => { await request(`/api/users/${user.id}`, { method: 'DELETE' }); loadUsers(); };
      item.append(details, editButton, deleteButton);
      return item;
    }));
  } catch (error) { message.textContent = error.message; }
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(form));
  const id = data.id;
  delete data.id;
  try {
    await request(id ? `/api/users/${id}` : '/api/users', { method: id ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    resetForm(); message.textContent = id ? 'Usuario actualizado.' : 'Usuario agregado.'; loadUsers();
  } catch (error) { message.textContent = error.message; }
});

cancelButton.addEventListener('click', resetForm);
loadUsers();
