-- Resources tab: video library + quick "check your understanding" quizzes.
-- All three tables are public, read-only content (not user data) —
-- managed via the Supabase dashboard or a separate seed script, never
-- written to by the app itself. Two aggregate counters on
-- resources_quiz_questions support an anonymous "N people got this
-- right" stat; they are NOT a per-user attempt/history table.

create table resources_videos (
  id uuid primary key default gen_random_uuid(),
  youtube_id text not null,
  title_en text,
  title_so text,
  topic text,
  order_index int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table resources_quiz_questions (
  id uuid primary key default gen_random_uuid(),
  video_id uuid not null references resources_videos(id) on delete cascade,
  question_en text,
  question_so text,
  order_index int not null default 0,
  -- Anonymous aggregate comprehension stats, incremented only via the
  -- increment_quiz_stat() function below — never written to directly.
  answered_count int not null default 0,
  correct_count int not null default 0
);

create table resources_quiz_choices (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references resources_quiz_questions(id) on delete cascade,
  choice_en text,
  choice_so text,
  is_correct boolean not null default false,
  order_index int not null default 0
);

alter table resources_videos enable row level security;
alter table resources_quiz_questions enable row level security;
alter table resources_quiz_choices enable row level security;

-- Read-only access to active videos and their nested questions/choices.
-- No insert/update/delete policies for any client role — content is
-- managed via the dashboard or a separate seed script.
create policy "Public read of active videos"
  on resources_videos for select
  to anon, authenticated
  using (is_active = true);

create policy "Public read of questions for active videos"
  on resources_quiz_questions for select
  to anon, authenticated
  using (
    exists (
      select 1 from resources_videos
      where resources_videos.id = resources_quiz_questions.video_id
        and resources_videos.is_active = true
    )
  );

create policy "Public read of choices for active videos"
  on resources_quiz_choices for select
  to anon, authenticated
  using (
    exists (
      select 1
      from resources_quiz_questions
      join resources_videos on resources_videos.id = resources_quiz_questions.video_id
      where resources_quiz_questions.id = resources_quiz_choices.question_id
        and resources_videos.is_active = true
    )
  );

-- Narrow, controlled write path for the anonymous aggregate comprehension
-- counter: SECURITY DEFINER lets it update resources_quiz_questions
-- despite anon having no UPDATE grant on the table itself, and it only
-- ever does one atomic increment — no answer content, no identity.
create function increment_quiz_stat(p_question_id uuid, p_is_correct boolean)
returns void
language sql
security definer
set search_path = public
as $$
  update resources_quiz_questions
  set answered_count = answered_count + 1,
      correct_count = correct_count + (case when p_is_correct then 1 else 0 end)
  where id = p_question_id;
$$;

revoke all on function increment_quiz_stat(uuid, boolean) from public;
grant execute on function increment_quiz_stat(uuid, boolean) to anon, authenticated;

-- Seed: the video library that was previously hardcoded in Resources.jsx.
-- No quiz questions for these yet, except one clearly-marked placeholder
-- on the first video so the feature is testable end-to-end before real
-- quiz content is authored.
insert into resources_videos (youtube_id, title_en, order_index) values
  ('bP6SplioHw4', 'Minnesota K-12 Education Credit and Subtraction', 0),
  ('N4h4_C4YllI', 'A Day in the Life of a Tax Return', 1),
  ('kvXVuoH_XJA', 'File Your Homeowners Property Tax Refund Online', 2),
  ('2yWwTdEMRwQ', 'Where''s My Refund?', 3),
  ('IHzm_2kvN-0', 'Renters Filing a Property Tax Refund', 4),
  ('dusHTs6TrXY', 'What to Do If You Owe State Income Taxes', 5);

with placeholder_question as (
  insert into resources_quiz_questions (video_id, question_en, question_so, order_index)
  select id, 'What is this video mainly about?', 'Muqaalkani wuxuu ku saabsan yahay maxay?', 0
  from resources_videos
  where youtube_id = 'bP6SplioHw4'
  returning id
)
insert into resources_quiz_choices (question_id, choice_en, choice_so, is_correct, order_index)
select id, choice_en, choice_so, is_correct, order_index
from placeholder_question
cross join (values
  ('A Minnesota education tax credit', 'Credit-ka canshuurta waxbarashada ee Minnesota', true, 0),
  ('How to file a federal extension', 'Sida loo codsado dheeraad federaal', false, 1),
  ('How to renew a passport', 'Sida loo cusboonaysiiyo baasaboor', false, 2)
) as choices(choice_en, choice_so, is_correct, order_index);
