import { canonicalizeUrl } from '../lib/canonicalize';

function expectEq(a: string, b: string) {
  if (a !== b) throw new Error(`Expected ${b} got ${a}`);
}

const c1 = canonicalizeUrl('https://example.com/x?utm_source=ads&b=2&a=1#hash');
expectEq(c1, 'https://example.com/x?a=1&b=2');

const c2 = canonicalizeUrl('https://www.tiktok.com/@user/video/12345/?utm_campaign=x');
expectEq(c2, 'https://www.tiktok.com/@user/video/12345');

console.log('canonicalize.test ok');


