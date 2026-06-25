-- "Our Collaborators" page: Somali tax experts + testimonial quotes from
-- people they've helped. Public, read-only content — managed via the
-- Supabase dashboard or a seed script, same pattern as resources_videos.

create table collaborators (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text not null,
  photo_url text,
  title text,
  order_index int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table collaborator_quotes (
  id uuid primary key default gen_random_uuid(),
  collaborator_id uuid not null references collaborators(id) on delete cascade,
  quote_text text not null,
  author_name text,
  order_index int not null default 0
);

alter table collaborators enable row level security;
alter table collaborator_quotes enable row level security;

-- Read-only access to active collaborators and their quotes. No insert/
-- update/delete policies for any client role.
create policy "Public read of active collaborators"
  on collaborators for select
  to anon, authenticated
  using (is_active = true);

create policy "Public read of quotes for active collaborators"
  on collaborator_quotes for select
  to anon, authenticated
  using (
    exists (
      select 1 from collaborators
      where collaborators.id = collaborator_quotes.collaborator_id
        and collaborators.is_active = true
    )
  );

-- Seed: one clearly-marked placeholder so the page is testable before
-- real collaborator photos/names/quotes are added.
with placeholder_collaborator as (
  insert into collaborators (first_name, last_name, photo_url, title, order_index)
  values ('[Placeholder]', 'Expert Name', null, 'Tax Preparer', 0)
  returning id
)
insert into collaborator_quotes (collaborator_id, quote_text, author_name, order_index)
select id, '[Placeholder] This tax expert helped my whole family file correctly for the first time.', 'A grateful client', 0
from placeholder_collaborator;
