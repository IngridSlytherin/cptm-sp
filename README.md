# Status dos Trilhos de São Paulo

MVP funcional e independente para acompanhar linhas de trem e metrô do Estado de São Paulo. A aplicação cadastra linhas, coleta estados por um provider desacoplado, persiste alterações no PostgreSQL, mantém metadados de coleta no Redis e apresenta os resultados no Next.js.

> Este é um serviço independente. As informações são obtidas de fontes públicas e podem sofrer atrasos. Não há vínculo oficial com o Governo do Estado de São Paulo ou com as operadoras.

## Recursos do MVP

- 13 linhas metropolitanas cadastradas por seed;
- estados operacionais tipados, histórico somente quando há alteração relevante e encerramento do evento anterior;
- provider mock determinístico com cenários normal, incidente, fonte indisponível e dado antigo;
- provider oficial preparado, porém desativado até existir URL e contrato documentados;
- coleta automática, manual, com timeout e proteção contra concorrência;
- último conjunto normalizado, sucesso, falha e lock no Redis, com degradação caso o cache caia;
- endpoints de linhas, histórico, resumo e saúde da fonte documentados no Swagger;
- dashboard responsivo, detalhe de linha, freshness, SEO e acessibilidade básica.

## Arquitetura

```text
Internet
   ↓
Cloudflare ou DNS
   ↓
Nginx
   ├── Next.js
   └── NestJS
          ├── PostgreSQL
          └── Redis
```

O monorepo usa npm workspaces: `apps/web` (Next.js), `apps/api` (NestJS) e `packages/shared` (tipos compartilhados). O Nginx é a única entrada pública em produção. PostgreSQL e Redis não publicam portas no Compose de produção.

## Pré-requisitos

- Node.js 22 LTS e npm 10+
- Docker Engine com Docker Compose v2
- Git
- Para execução sem Docker: PostgreSQL 17 e Redis 7

## Instalação local

```bash
cp .env.example .env
# edite .env e defina senhas locais
npm install
npm run prisma:generate
npm run prisma:migrate
npm run dev
```

Abra `http://localhost:3000`, `http://localhost:3000/health`, API em `http://localhost:3001/api/v1/health` e Swagger em `http://localhost:3001/api/docs`.

Para execução sem Docker, ajuste `DATABASE_URL` e `REDIS_URL` para `localhost`, inicie PostgreSQL/Redis e use `npm run dev`. Os atalhos `npm run dev:web` e `npm run dev:api` iniciam cada aplicação separadamente.

## Variáveis de ambiente

Copie `.env.example` para `.env`. Preencha obrigatoriamente `POSTGRES_PASSWORD`, `DATABASE_URL`, `REDIS_PASSWORD` e `REDIS_URL`; em produção também configure `DOMAIN`, `NEXT_PUBLIC_API_URL` e `CORS_ORIGIN` com o domínio HTTPS real. `DATABASE_URL` e `REDIS_URL` devem repetir as credenciais escolhidas. Nunca versione `.env`.

No navegador, `NEXT_PUBLIC_API_URL` é público por definição e nunca deve conter segredo. Para acesso direto local use `http://localhost:3001/api/v1`; atrás do Nginx em produção use `/api/v1`.

## Docker

```bash
docker compose config
npm run docker:up
npm run docker:logs
npm run docker:down
```

Em desenvolvimento: web `3000`, API `3001`, PostgreSQL `5432`, Redis `6379` e Nginx opcional `8080`. Em produção:

```bash
docker compose -f docker-compose.prod.yml config
docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml ps
```

Somente as portas 80 e 443 do Nginx são publicadas em produção. A porta 443 fica reservada até a configuração do certificado real.

## Prisma, dados e validação

```bash
npm run prisma:generate
npm run prisma:migrate
npm run prisma:studio
npm run prisma:seed --workspace=@rail-status/api
npm run lint
npm test
npm run build
```

O seed cria três linhas inteiramente fictícias, identificadas com códigos `DEV-*`, somente para desenvolvimento e teste de infraestrutura. Elas não representam informações operacionais reais.

Em produção, aplique migrations de forma não interativa antes da aplicação: `docker compose -f docker-compose.prod.yml run --rm api npx prisma migrate deploy --schema apps/api/prisma/schema.prisma`.

## Preparação do VPS OVHcloud (Ubuntu 24.04)

1. Crie o VPS, mantenha uma sessão administrativa aberta e configure uma chave SSH.
2. Execute, revisando cada script: `sudo infrastructure/scripts/setup-server.sh`, `sudo infrastructure/scripts/install-docker.sh`, `sudo infrastructure/scripts/create-deploy-user.sh deploy` e `sudo infrastructure/scripts/configure-firewall.sh`.
3. Teste o login SSH do usuário `deploy` antes de sair da sessão root. O grupo Docker equivale a privilégios administrativos.
4. Clone o repositório em `/opt/rail-status` (ou diretório do usuário), crie `.env` com permissões `600`, aplique migrations e rode `infrastructure/scripts/start-containers.sh`.
5. Não há deploy automático no CI; atualização e rollback ainda são operações manuais.

### Domínio, DNS e HTTPS

Crie registros DNS `A` (e `AAAA`, se houver IPv6 configurado) apontando o domínio para o IP público do VPS. Se usar Cloudflare, inicialmente deixe o proxy desligado até validar a emissão do certificado. Troque `server_name _` em `infrastructure/nginx/nginx.prod.conf` pelo domínio.

Depois da propagação, instale Certbot no host (`sudo apt install certbot`), mantenha o caminho `/.well-known/acme-challenge/` acessível e emita um certificado com o modo webroot, usando `infrastructure/nginx/certbot/www`. Monte os certificados reais já previstos no Compose, acrescente ao arquivo de produção um bloco `listen 443 ssl` com os caminhos de `/etc/letsencrypt/live/SEU_DOMINIO/`, teste com `docker compose exec nginx nginx -t` e recarregue o Nginx. Só então redirecione HTTP para HTTPS. Nenhum certificado falso acompanha o projeto. Configure também a renovação (`certbot renew`) e um reload do container após renovação.

## Backup e restauração

```bash
infrastructure/scripts/backup-postgres.sh /opt/rail-status /var/backups/rail-status
infrastructure/scripts/restore-postgres.sh /var/backups/rail-status/ARQUIVO.dump /opt/rail-status
```

A restauração pede confirmação e pode substituir dados conflitantes. Mantenha cópias criptografadas fora do VPS e teste restaurações periodicamente.

## Troubleshooting

- `Configuração de ambiente inválida`: confira URLs, CORS e valores numéricos do `.env`.
- API `degraded`: consulte `/api/v1/health/database`, `/api/v1/health/redis` e `docker compose logs api postgres redis`.
- Container não fica healthy: rode `docker compose ps` e confira se as senhas em URLs correspondem às variáveis dos serviços.
- Erro de CORS: informe origens exatas e separadas por vírgula em `CORS_ORIGIN`, sem curingas.
- Falha de proxy: valide `docker compose exec nginx nginx -t` e confirme que `api` e `web` estão healthy.
- Mudança em `NEXT_PUBLIC_API_URL`: reconstrua a imagem web; a variável é incorporada no build do Next.js.

## Segurança e limitações atuais

Helmet, CORS restrito, validação global, rate limiting, filtro de exceções, logs com campos sensíveis ocultados, usuários não-root e headers do Nginx estão ativos. Não há autenticação, TLS pronto, monitoramento externo, rotação automática de backups ou alta disponibilidade. A coleta manual é livre somente em desenvolvimento; em produção exige `INTERNAL_COLLECTION_KEY` no header `x-internal-key`.

## Configuração do MVP e providers

As variáveis adicionais são:

```dotenv
STATUS_PROVIDER=mock
STATUS_SOURCE_URL=
STATUS_SOURCE_API_KEY=
STATUS_COLLECTION_INTERVAL_SECONDS=300
STATUS_STALE_AFTER_SECONDS=180
STATUS_REQUEST_TIMEOUT_MS=10000
MOCK_STATUS_SCENARIO=normal
INTERNAL_COLLECTION_KEY=
API_INTERNAL_URL=http://localhost:3001/api/v1
```

`API_INTERNAL_URL` é usada pelos Server Components; em containers ela deve apontar para `http://api:3001/api/v1`. `NEXT_PUBLIC_API_URL` é usada pelo navegador e não pode conter segredos.

O provider oficial não interpreta nenhuma resposta ainda. Para implementá-lo com segurança, são necessários: URL oficial confirmada, método HTTP, autenticação, limites de uso, exemplos reais de sucesso e erro, mapeamento dos identificadores das linhas, significado dos estados e campos de data/evento. Definir apenas `STATUS_SOURCE_URL` não ativa uma integração desconhecida.

### Cenários do mock

Escolha um cenário no `.env`, reinicie a API e faça uma coleta:

```dotenv
MOCK_STATUS_SCENARIO=normal
# incident | source-error | stale
```

O cenário `incident` também envia uma linha desconhecida para verificar o isolamento de registros inválidos. Os dados são determinísticos e os testes não acessam a internet.

## Migrations, seed e coleta

Com PostgreSQL e Redis ativos:

```bash
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed --workspace=@rail-status/api
npm run dev
```

Exemplos de consulta:

```bash
curl http://localhost:3001/api/v1/lines
curl http://localhost:3001/api/v1/lines/status
curl http://localhost:3001/api/v1/lines/line-8-diamond
curl "http://localhost:3001/api/v1/lines/line-8-diamond/history?limit=10&page=1"
curl http://localhost:3001/api/v1/status/summary
curl http://localhost:3001/api/v1/status/source-health
curl -X POST http://localhost:3001/api/v1/status/collect
```

Em produção, a coleta manual requer:

```bash
curl -X POST -H "x-internal-key: SUA_CHAVE" https://SEU_DOMINIO/api/v1/status/collect
```

Nunca coloque a chave em scripts versionados ou no frontend. Swagger permanece em `/api/docs`.

## Endpoints do MVP

- `GET /api/v1/lines`
- `GET /api/v1/lines/status`
- `GET /api/v1/lines/:code`
- `GET /api/v1/lines/:code/history?from=&to=&status=&limit=&page=`
- `GET /api/v1/status/summary`
- `GET /api/v1/status/source-health`
- `POST /api/v1/status/collect`

O PostgreSQL é a fonte persistente. Uma falha de provider nunca converte linhas para `NORMAL`: o último estado permanece disponível e as respostas passam a indicar `source_error`. `stale` usa a data informada pela fonte, quando disponível, ou a última coleta como fallback.

## Limitações e próximos passos

- integração oficial aguardando contrato documentado;
- nenhuma autenticação de usuários ou painel administrativo;
- sem notificações, mapas, gráficos ou aplicativo móvel;
- o agendamento roda dentro da API; para múltiplas réplicas, o Redis reduz coletas duplicadas, mas recomenda-se futuramente um worker dedicado;
- manter validação periódica de nomes, operadoras e identidade visual das linhas;
- adicionar observabilidade, retenção de histórico e testes end-to-end no pipeline antes de produção.
