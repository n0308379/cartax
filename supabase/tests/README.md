# Testes das regras de acesso

Correm o esquema em Postgres 17 (PGlite, em memória) com um esquema `auth` simulado.

```
npm i @electric-sql/pglite@0.3.8
node supabase/tests/rls.test.js
```
