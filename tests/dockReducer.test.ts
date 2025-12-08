import { __dockReducer as reducer } from '../hooks/useDockState';

function expectEq(a: any, b: any, msg?: string) {
  const aj = JSON.stringify(a);
  const bj = JSON.stringify(b);
  if (aj !== bj) throw new Error(msg ?? `Expected ${bj} got ${aj}`);
}

const s0 = { isDocked: false, reduceMotion: false };
const s1 = reducer(s0, { type: 'dock' } as any);
expectEq(s1.isDocked, true, 'dock should set isDocked=true');
const s2 = reducer(s1, { type: 'undock' } as any);
expectEq(s2.isDocked, false, 'undock should set isDocked=false');

console.log('dockReducer.test ok');


