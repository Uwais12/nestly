import { parseIncomingShare } from '../lib/deeplinks';

function expectEq(a: any, b: any, msg?: string) {
  const aj = JSON.stringify(a);
  const bj = JSON.stringify(b);
  if (aj !== bj) throw new Error(msg ?? `Expected ${bj} got ${aj}`);
}

// preferred
expectEq(parseIncomingShare('nestly://shared?url=https%3A%2F%2Fwww.instagram.com%2Fp%2FABC%2F'), {
  directUrl: 'https://www.instagram.com/p/ABC/',
  hasDataUrlKey: false,
});

// query param root
expectEq(parseIncomingShare('nestly://?url=https%3A%2F%2Fwww.instagram.com%2Fp%2FDEF%2F'), {
  directUrl: 'https://www.instagram.com/p/DEF/',
  hasDataUrlKey: false,
});

// dataUrl via query
expectEq(parseIncomingShare('nestly://?dataUrl=nestlyShareKey#text'), {
  directUrl: undefined,
  hasDataUrlKey: true,
});

// legacy without query
expectEq(parseIncomingShare('nestly://dataUrl=nestlyShareKey#weburl'), {
  directUrl: undefined,
  hasDataUrlKey: true,
});

console.log('deeplinks.parseIncomingShare.test ok');


