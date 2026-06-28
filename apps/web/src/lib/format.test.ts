import { describe, expect, it } from 'vitest';
const mb=(n:number)=>`${(n/1024/1024).toFixed(1)} MB`;
describe('formatting',()=>{ it('formats megabytes',()=>expect(mb(1048576)).toBe('1.0 MB')); });
