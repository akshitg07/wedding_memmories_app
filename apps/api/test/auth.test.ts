import { describe, expect, it } from 'vitest'; import { loginSchema } from '../src/auth/auth.js';
describe('login validation',()=>{ it('requires strong input',()=>{ expect(()=>loginSchema.parse({username:'guest',password:'secret123'})).not.toThrow(); expect(()=>loginSchema.parse({username:'g',password:'x'})).toThrow(); }); });
