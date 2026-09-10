import assert from 'node:assert/strict';
import test from 'node:test';

process.env.DB_HOST = 'database';
process.env.DB_NAME = 'test';
process.env.DB_USER = 'test';
process.env.DB_PASSWORD = 'test';
process.env.NODE_ENV = 'test';

const { validId, validTask, validTaskUpdate } = await import('../src/index.js');

test('acepta una tarea válida y elimina espacios innecesarios', () => {
  assert.deepEqual(validTask({ title: '  Configurar Docker  ' }), { title: 'Configurar Docker' });
});

test('rechaza tareas sin título o que exceden la longitud permitida', () => {
  assert.equal(validTask({ title: '' }), null);
  assert.equal(validTask({ title: ' '.repeat(8) }), null);
  assert.equal(validTask({ title: 'a'.repeat(256) }), null);
});

test('valida el identificador y los datos de actualización', () => {
  assert.equal(validId('3'), 3);
  assert.equal(validId('0'), null);
  assert.deepEqual(
    validTaskUpdate({ title: '  Actualizar API ', completed: true }),
    { title: 'Actualizar API', completed: true },
  );
  assert.equal(validTaskUpdate({ title: 'Actualizar API' }), null);
});
