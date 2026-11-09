import { validate } from '../src/config/env.validation';
describe('validate', () => {
  const valid = {NODE_ENV:'test',API_PORT:'3001',CORS_ORIGIN:'http://localhost:3000',DATABASE_URL:'postgresql://user:pass@localhost:5432/db',REDIS_URL:'redis://localhost:6379',RATE_LIMIT_TTL:'60000',RATE_LIMIT_LIMIT:'100'};
  it('aceita configuração válida e converte números',()=>expect(validate(valid).API_PORT).toBe(3001));
  it('rejeita configuração incompleta',()=>expect(()=>validate({...valid,DATABASE_URL:''})).toThrow('Configuração de ambiente inválida'));
});
