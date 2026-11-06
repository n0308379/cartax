const { PGlite } = require("@electric-sql/pglite");
const fs = require("fs");
(async () => {
  const db = new PGlite();
  // simulação mínima do esquema auth do Supabase
  await db.exec(`
    create schema auth;
    create table auth.users (id uuid primary key);
    create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
    create role authenticated;
  `);
  await db.exec(fs.readFileSync(__dirname + "/../migrations/0001_inicial.sql", "utf8"));
  await db.exec(`grant usage on schema public, auth to authenticated; grant select, insert on all tables in schema public to authenticated; grant execute on all functions in schema public, auth to authenticated;`);
  const U = { aluno: "00000000-0000-0000-0000-000000000001", outro: "00000000-0000-0000-0000-000000000002", instr: "00000000-0000-0000-0000-000000000003", sec: "00000000-0000-0000-0000-000000000004", admin: "00000000-0000-0000-0000-000000000005", instr2: "00000000-0000-0000-0000-000000000006" };
  for (const id of Object.values(U)) await db.query("insert into auth.users values ($1)", [id]);
  await db.query("insert into profiles (id, alcunha) select id, 'u' from auth.users");
  const esc = (await db.query("insert into schools (nome, nipc, estado) values ('Escola A', '500000000', 'ativa') returning id")).rows[0].id;
  await db.query("insert into school_members values ($1,$2,'instrutor',true),($1,$3,'secretaria',true),($1,$4,'admin',true),($1,$5,'instrutor',true)", [esc, U.instr, U.sec, U.admin, U.instr2]);
  await db.query("insert into instructor_students values ($1,$2,$3)", [esc, U.instr, U.aluno]);
  // sessões: uma antiga (antes da associação) e uma recente
  await db.query("insert into lesson_sessions (student_id, inicio) values ($1, now() - interval '10 days'), ($1, now() - interval '1 hour')", [U.aluno]);
  await db.query("insert into enrollments (student_id, school_id, estado, aceite_em) values ($1, $2, 'ativa', now() - interval '2 days')", [U.aluno, esc]);

  async function como(user, sql, params) {
    await db.exec("set role authenticated");
    await db.query("select set_config('request.jwt.claim.sub', $1, false)", [user]);
    try { return (await db.query(sql, params)).rows; }
    catch (e) { return "ERRO: " + e.message; }
    finally { await db.exec("reset role"); }
  }
  const conta = async (u) => { const r = await como(u, "select count(*)::int n from lesson_sessions"); return typeof r === "string" ? r : r[0].n; };
  const res = [];
  res.push(["aluno vê as suas 2 sessões", await conta(U.aluno), 2]);
  res.push(["outro aluno não vê nada", await conta(U.outro), 0]);
  res.push(["instrutor atribuído vê só a sessão depois da associação", await conta(U.instr), 1]);
  res.push(["instrutor não atribuído não vê", await conta(U.instr2), 0]);
  res.push(["secretaria não vê (opção desligada)", await conta(U.sec), 0]);
  res.push(["admin. da escola vê só depois da associação", await conta(U.admin), 1]);
  await db.query("update schools set opcao_secretaria_detalhe = true");
  res.push(["secretaria vê com a opção ligada", await conta(U.sec), 1]);
  await db.query("update enrollments set partilha_historico = true");
  res.push(["com histórico partilhado, instrutor vê as 2", await conta(U.instr), 2]);
  await db.query("update enrollments set estado = 'terminada'");
  res.push(["associação terminada: instrutor deixa de ver", await conta(U.instr), 0]);
  await db.query("update enrollments set estado = 'ativa'");
  res.push(["aluno não pode criar sessão em nome de outro", (await como(U.aluno, "insert into lesson_sessions (student_id) values ($1)", [U.outro])).toString().startsWith("ERRO"), true]);
  const v = await como(U.instr, "select ver_aluno($1) j", [U.aluno]);
  res.push(["ver_aluno funciona para o instrutor", typeof v !== "string", true]);
  const aud = (await db.query("select count(*)::int n from audit_log where acao = 'ver_aluno'")).rows[0].n;
  res.push(["ver_aluno ficou no registo de auditoria", aud, 1]);
  res.push(["outro aluno não consegue ver_aluno", (await como(U.outro, "select ver_aluno($1)", [U.aluno])).toString().includes("sem acesso"), true]);
  res.push(["aluno não lê o registo de auditoria", (await como(U.aluno, "select count(*)::int n from audit_log"))[0].n, 0]);
  // conteúdo: quatro olhos e uma resposta correta
  const lv = (await db.query("insert into levels (nome, ordem) values ('Prioridades', 1) returning id")).rows[0].id;
  const q = (await db.query("insert into questions (codigo, level_id, tema, tipo) values ('PRIO-001', $1, 'Prioridades', 'situacao') returning id", [lv])).rows[0].id;
  let quatro = "ok"; try { await db.query("insert into question_versions (question_id, numero, enunciado, artigo, regra, exemplo, autor_id, revisor_id) values ($1,1,'e','a','r','x',$2,$2)", [q, U.instr]); } catch (e) { quatro = "recusado"; }
  res.push(["revisor igual ao autor é recusado", quatro, "recusado"]);
  const qv = (await db.query("insert into question_versions (question_id, numero, enunciado, artigo, regra, exemplo, autor_id, estado) values ($1,1,'e','a','r','x',$2,'publicada') returning id", [q, U.instr])).rows[0].id;
  let duas = "ok"; try { await db.query("insert into options (version_id, ordem, texto, correta) values ($1,1,'a',true),($1,2,'b',true)", [qv]); } catch (e) { duas = "recusado"; }
  res.push(["duas opções corretas são recusadas", duas, "recusado"]);
  res.push(["pergunta base publicada é visível a qualquer aluno", (await como(U.outro, "select count(*)::int n from question_versions"))[0].n, 1]);
  let ok = 0; for (const [n, got, exp] of res) { const p = JSON.stringify(got) === JSON.stringify(exp); if (p) ok++; console.log((p ? "OK  " : "FALHA") + " " + n + " (obtido " + JSON.stringify(got) + ")"); }
  console.log(ok + "/" + res.length + " testes passaram");
})();
