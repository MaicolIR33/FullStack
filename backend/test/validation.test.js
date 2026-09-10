import assert from 'node:assert/strict';
import test from 'node:test';

process.env.DB_HOST = 'database';
process.env.DB_NAME = 'test';
process.env.DB_USER = 'test';
process.env.DB_PASSWORD = 'test';
process.env.NODE_ENV = 'test';

const { validId, validUser } = await import('../src/index.js');

test('acepta un usuario válido y normaliza su correo', () => {
  assert.deepEqual(validUser({ name: ' Ada ', email: ' ADA@Example.COM ' }), { name: 'Ada', email: 'ada@example.com' });
});

test('rechaza usuarios incompletos o con correo inválido', () => {
  assert.equal(validUser({ name: '', email: 'ada@example.com' }), null);
  assert.equal(validUser({ name: 'Ada', email: 'sin-correo' }), null);
});

test('acepta solo identificadores positivos enteros', () => {
  assert.equal(validId('4'), 4);
  assert.equal(validId('0'), null);
  assert.equal(validId('4.5'), null);
});
