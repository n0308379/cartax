create type perfil_escola     as enum ('admin', 'secretaria', 'instrutor', 'revisor');
create type estado_escola     as enum ('pendente', 'ativa', 'suspensa');
create type estado_associacao as enum ('convidado', 'ativa', 'recusada', 'terminada');

create table profiles (
  id                 uuid primary key references auth.users on delete cascade,
  alcunha            text not null,
  declara_16_anos    boolean not null default false,
  aceitou_termos_em  timestamptz,
  versao_termos      text,
  papel_plataforma   text check (papel_plataforma in ('admin', 'conteudo')),
  revisor_certificado boolean not null default false,
  criado_em          timestamptz not null default now()
);

create table schools (
  id                        uuid primary key default gen_random_uuid(),
  nome                      text not null,
  nipc                      text not null unique,
  morada                    text,
  alvara_referencia         text,
  estado                    estado_escola not null default 'pendente',
  verificacao               jsonb,            -- resultado da certidão e do alvará, data da consulta
  opcao_pedir_historico     boolean not null default false,
  opcao_secretaria_detalhe  boolean not null default false,
  criado_em                 timestamptz not null default now()
);

create table school_members (
  school_id  uuid references schools on delete cascade,
  user_id    uuid references auth.users on delete cascade,
  perfil     perfil_escola not null,
  ativo      boolean not null default true,
  primary key (school_id, user_id)
);

create table school_invites (
  id          uuid primary key default gen_random_uuid(),
  school_id   uuid not null references schools on delete cascade,
  email       text not null,
  perfil      perfil_escola not null,
  token_hash  text not null unique,
  expira_em   timestamptz not null default now() + interval '7 days',
  aceite_em   timestamptz,
  criado_por  uuid references auth.users
);

create table enrollment_codes (            -- convites a alunos (código ou link)
  codigo     text primary key,
  school_id  uuid not null references schools on delete cascade,
  class_id   uuid,
  expira_em  timestamptz not null
);

create table enrollments (
  id                  uuid primary key default gen_random_uuid(),
  student_id          uuid not null references auth.users on delete cascade,
  school_id           uuid not null references schools on delete cascade,
  estado              estado_associacao not null default 'convidado',
  partilha_historico  boolean not null default false,
  aceite_em           timestamptz,
  terminada_em        timestamptz
);
create unique index uma_escola_ativa on enrollments (student_id) where estado = 'ativa';

create table classes (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references schools on delete cascade,
  nome text not null
);
create table class_students (class_id uuid references classes on delete cascade, student_id uuid references auth.users on delete cascade, primary key (class_id, student_id));
create table instructor_students (school_id uuid references schools on delete cascade, instructor_id uuid references auth.users, student_id uuid references auth.users on delete cascade, primary key (school_id, instructor_id, student_id));

create type estado_versao as enum ('rascunho', 'em_revisao', 'aprovada', 'rejeitada', 'publicada', 'retirada', 'a_rever');
create type tipo_cena     as enum ('ilustracao', 'fotografia', 'video');

create table levels (
  id uuid primary key default gen_random_uuid(),
  nome text not null, ordem int not null,
  school_id uuid references schools        -- vazio = conteúdo base
);

create table questions (
  id                    uuid primary key default gen_random_uuid(),
  codigo                text not null unique,           -- ex.: PRIO-014
  level_id              uuid not null references levels,
  tema                  text not null,
  tipo                  text not null check (tipo in ('situacao', 'sinal', 'conhecimento')),
  tipo_cena             tipo_cena,
  dificuldade           smallint check (dificuldade between 1 and 3),
  school_id             uuid references schools,
  versao_publicada_id   uuid,
  criado_por            uuid references auth.users,
  criado_em             timestamptz not null default now()
);

create table question_versions (
  id               uuid primary key default gen_random_uuid(),
  question_id      uuid not null references questions on delete cascade,
  numero           int not null,
  enunciado        text not null,
  artigo           text not null,
  regra            text not null,       -- regra numa frase
  exemplo          text not null,
  estado           estado_versao not null default 'rascunho',
  autor_id         uuid not null references auth.users,
  revisor_id       uuid references auth.users,
  aprovada_em      timestamptz,
  motivo_rejeicao  text,
  unique (question_id, numero),
  check (revisor_id is null or revisor_id <> autor_id)     -- quatro olhos
);
alter table questions add foreign key (versao_publicada_id) references question_versions;

create table options (
  id          uuid primary key default gen_random_uuid(),
  version_id  uuid not null references question_versions on delete cascade,
  ordem       smallint not null,
  texto       text not null,
  correta     boolean not null default false,
  explicacao  text              -- obrigatória nas erradas (verificada ao submeter)
);
create unique index uma_correta on options (version_id) where correta;

create table scenes (
  id                  uuid primary key default gen_random_uuid(),
  version_id          uuid not null references question_versions on delete cascade,
  tipo                tipo_cena not null,
  descricao           jsonb,            -- ilustração: descrição da cena para o desenhador
  semente             int,              -- ilustração: variante (1 a 20)
  versao_desenhador   text,
  ficheiro_path       text,             -- fotografia ou vídeo no Storage
  modelo_ia           text,
  prompt              text,
  referencia_path     text,
  elementos_criticos  jsonb not null default '[]',
  inicio_perigo_ms    int,              -- vídeos de perceção de perigo
  estado              estado_versao not null default 'rascunho',
  revisor_id          uuid references auth.users,
  aprovada_em         timestamptz
);

create table reviews (
  id                     uuid primary key default gen_random_uuid(),
  version_id             uuid not null references question_versions on delete cascade,
  revisor_id             uuid not null references auth.users,
  decisao                text not null check (decisao in ('aprovada', 'rejeitada', 'alteracao')),
  comentario             text,
  elementos_confirmados  jsonb,
  criado_em              timestamptz not null default now()
);

create table generation_jobs (                 -- lotes de imagens e vídeos de IA
  id              uuid primary key default gen_random_uuid(),
  version_id      uuid not null references question_versions on delete cascade,
  tipo            text not null check (tipo in ('preview', 'lote_imagens', 'video')),
  modelo          text not null,
  prompt          text not null,
  quantidade      int not null,
  estado          text not null default 'pendente' check (estado in ('pendente', 'a_correr', 'concluido', 'falhou')),
  custo_estimado  numeric(8, 2),
  erro            text,
  criado_por      uuid not null references auth.users,
  criado_em       timestamptz not null default now(),
  terminado_em    timestamptz
);

create table lesson_sessions (id uuid primary key default gen_random_uuid(), student_id uuid not null references auth.users on delete cascade, level_id uuid references levels, inicio timestamptz not null default now(), fim timestamptz, pct_primeira_tentativa numeric(5, 2));
create table answers (id bigint generated always as identity primary key, session_id uuid not null references lesson_sessions on delete cascade, version_id uuid not null references question_versions, scene_id uuid references scenes, option_id uuid references options, certa boolean not null, tentativa smallint not null, criado_em timestamptz not null default now());
create table sim_runs (id uuid primary key default gen_random_uuid(), student_id uuid not null references auth.users on delete cascade, cenario text not null, decisoes jsonb not null, certas int not null, total int not null, criado_em timestamptz not null default now());
create table hazard_runs (id uuid primary key default gen_random_uuid(), student_id uuid not null references auth.users on delete cascade, missao text not null, detecoes jsonb not null, pontos int not null, criado_em timestamptz not null default now());
create table xp_events (id bigint generated always as identity primary key, student_id uuid not null references auth.users on delete cascade, origem text not null, pontos int not null, criado_em timestamptz not null default now());
create table assignments (id uuid primary key default gen_random_uuid(), school_id uuid not null references schools on delete cascade, student_id uuid references auth.users on delete cascade, class_id uuid references classes on delete cascade, level_id uuid references levels, missao text, prazo date, criado_por uuid references auth.users, check (student_id is not null or class_id is not null));
create table friendships (a uuid references auth.users on delete cascade, b uuid references auth.users on delete cascade, aceite boolean not null default false, primary key (a, b));

create table audit_log (
  id          bigint generated always as identity primary key,
  actor_id    uuid,
  acao        text not null,          -- ex.: 'ver_aluno', 'aprovar_versao'
  entidade    text not null,
  entidade_id text,
  school_id   uuid,
  detalhe     jsonb,
  criado_em   timestamptz not null default now()
);

create function eh_membro(escola uuid, perfis perfil_escola[]) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from school_members m
                 where m.school_id = escola and m.user_id = auth.uid()
                   and m.ativo and m.perfil = any(perfis));
$$;

-- Pode ver a atividade do aluno, registada no momento "quando"?
create function pode_ver_atividade(aluno uuid, quando timestamptz) returns boolean
language sql stable security definer set search_path = public as $$
  select aluno = auth.uid() or exists (
    select 1 from enrollments e join schools s on s.id = e.school_id
    where e.student_id = aluno and e.estado = 'ativa'
      and (e.partilha_historico or quando >= e.aceite_em)
      and ( eh_membro(e.school_id, '{admin}')
         or (eh_membro(e.school_id, '{instrutor,revisor}') and exists (
               select 1 from instructor_students i
               where i.school_id = e.school_id and i.instructor_id = auth.uid() and i.student_id = aluno))
         or (s.opcao_secretaria_detalhe and eh_membro(e.school_id, '{secretaria}')) ));
$$;

create function eh_plataforma(papel text) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from profiles p where p.id = auth.uid() and p.papel_plataforma = papel);
$$;

alter table lesson_sessions enable row level security;
create policy ler_sessoes on lesson_sessions for select using (pode_ver_atividade(student_id, inicio));
create policy criar_sessoes on lesson_sessions for insert with check (student_id = auth.uid());

alter table answers enable row level security;
create policy ler_respostas on answers for select using (
  exists (select 1 from lesson_sessions s where s.id = session_id and pode_ver_atividade(s.student_id, criado_em)));
create policy criar_respostas on answers for insert with check (
  exists (select 1 from lesson_sessions s where s.id = session_id and s.student_id = auth.uid()));

alter table enrollments enable row level security;
create policy ler_associacoes on enrollments for select using (
  student_id = auth.uid() or eh_membro(school_id, '{admin,secretaria,instrutor,revisor}'));

alter table question_versions enable row level security;
create policy ler_publicadas on question_versions for select using (
  estado = 'publicada' and exists (select 1 from questions q where q.id = question_id and (
    q.school_id is null
    or eh_membro(q.school_id, '{admin,secretaria,instrutor,revisor}')
    or exists (select 1 from enrollments e where e.school_id = q.school_id and e.student_id = auth.uid() and e.estado = 'ativa'))));
create policy ler_rascunhos on question_versions for select using (
  autor_id = auth.uid() or eh_plataforma('conteudo') or exists (
    select 1 from questions q where q.id = question_id and q.school_id is not null and eh_membro(q.school_id, '{revisor}')));

alter table audit_log enable row level security;
create policy ler_auditoria on audit_log for select using (
  eh_plataforma('admin') or (school_id is not null and eh_membro(school_id, '{admin}')));

create function ver_aluno(aluno uuid) returns jsonb
language plpgsql security definer set search_path = public as $$
declare escola uuid;
begin
  if not pode_ver_atividade(aluno, now()) then raise exception 'sem acesso'; end if;
  select school_id into escola from enrollments where student_id = aluno and estado = 'ativa';
  insert into audit_log (actor_id, acao, entidade, entidade_id, school_id)
  values (auth.uid(), 'ver_aluno', 'aluno', aluno::text, escola);
  return (select jsonb_build_object(
    'alcunha', p.alcunha,
    'xp', (select coalesce(sum(pontos), 0) from xp_events x where x.student_id = aluno and pode_ver_atividade(aluno, x.criado_em))
  ) from profiles p where p.id = aluno);
end $$;
