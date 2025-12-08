import { ruleTags } from '../rules/tags';

function expect(cond: boolean, message: string) {
  if (!cond) throw new Error(message);
}

// Minimal tests runnable by ts-node or ts-node/register if needed
const res1 = ruleTags('Amazing #foodie menu');
expect(res1.some((r) => r.tag === 'Food'), 'Food tag expected');

const res2 = ruleTags('Quick #workout session');
expect(res2.some((r) => r.tag === 'Fitness'), 'Fitness tag expected');

const res3 = ruleTags('nothing special');
expect(res3.length >= 1, 'Default Inbox expected');

console.log('rules.test ok');


