import { useCallback, useEffect, useState } from 'react';

export default function TaskList() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [editingTask, setEditingTask] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const loadTasks = useCallback(async () => {
    setIsLoading(true);

    try {
      const response = await fetch('/api/tasks');
      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'No fue posible cargar las tareas.');

      setTasks(data);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  function resetEditor() {
    setTitle('');
    setEditingTask(null);
  }

  function startEditing(task) {
    setTitle(task.title);
    setEditingTask(task);
    setMessage(`Editando: ${task.title}`);
  }

  async function saveTask(event) {
    event.preventDefault();
    const taskTitle = title.trim();

    if (!taskTitle) {
      setMessage('Escribe un título para guardar la tarea.');
      return;
    }

    setIsSubmitting(true);
    setMessage('');

    try {
      const response = await fetch(
        editingTask ? `/api/tasks/${editingTask.id}` : '/api/tasks',
        {
          method: editingTask ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(
            editingTask
              ? { title: taskTitle, completed: Boolean(editingTask.completed) }
              : { title: taskTitle },
          ),
        },
      );
      const data = response.status === 204 ? null : await response.json();

      if (!response.ok) throw new Error(data?.error || 'No fue posible guardar la tarea.');

      const action = editingTask ? 'actualizada' : 'creada';
      resetEditor();
      setMessage(`Tarea ${action} correctamente.`);
      await loadTasks();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function toggleTask(task) {
    setIsSubmitting(true);
    setMessage('');

    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: task.title, completed: !Boolean(task.completed) }),
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'No fue posible actualizar la tarea.');

      setMessage(task.completed ? 'Tarea marcada como pendiente.' : 'Tarea completada.');
      await loadTasks();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function deleteTask(task) {
    if (!window.confirm(`¿Eliminar la tarea “${task.title}”?`)) return;

    setIsSubmitting(true);
    setMessage('');

    try {
      const response = await fetch(`/api/tasks/${task.id}`, { method: 'DELETE' });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'No fue posible eliminar la tarea.');
      }

      if (editingTask?.id === task.id) resetEditor();
      setMessage('Tarea eliminada.');
      await loadTasks();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="task-panel" aria-labelledby="tasks-title">
      <div className="panel-heading">
        <div>
          <p className="section-label">Tablero de trabajo</p>
          <h2 id="tasks-title">Mis tareas</h2>
        </div>
        <span className="task-count">{tasks.length} {tasks.length === 1 ? 'tarea' : 'tareas'}</span>
      </div>

      <form className="task-form" onSubmit={saveTask}>
        <label htmlFor="title">{editingTask ? 'Editar tarea' : 'Nueva tarea'}</label>
        <div className="input-row">
          <input
            id="title"
            name="title"
            maxLength="255"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Ej. revisar la conexión a MySQL"
            required
          />
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Guardando…' : editingTask ? 'Guardar cambios' : 'Agregar tarea'}
          </button>
          {editingTask && (
            <button className="cancel-edit" type="button" onClick={resetEditor} disabled={isSubmitting}>
              Cancelar
            </button>
          )}
        </div>
      </form>

      <p className="message" role="status">{message}</p>

      {isLoading ? (
        <p className="empty-state">Cargando tareas…</p>
      ) : tasks.length === 0 ? (
        <p className="empty-state">Aún no hay tareas registradas.</p>
      ) : (
        <ul className="task-list" aria-live="polite">
          {tasks.map((task) => (
            <li key={task.id} className={task.completed ? 'is-completed' : ''}>
              <button
                className="task-mark"
                type="button"
                onClick={() => toggleTask(task)}
                disabled={isSubmitting}
                aria-label={task.completed ? `Marcar ${task.title} como pendiente` : `Marcar ${task.title} como completada`}
              >
                {task.completed ? '✓' : '○'}
              </button>
              <span className="task-title">{task.title}</span>
              <div className="task-actions">
                <small>{task.completed ? 'Completada' : 'Pendiente'}</small>
                <button type="button" className="edit-task" onClick={() => startEditing(task)} disabled={isSubmitting}>Editar</button>
                <button type="button" className="delete-task" onClick={() => deleteTask(task)} disabled={isSubmitting}>Eliminar</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
