-- Contact/feedback form submissions.

create table public.contact_submissions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  message text not null,
  created_at timestamptz not null default now()
);

alter table public.contact_submissions enable row level security;

-- Anyone (signed in or not) can submit the contact form; only admins can read them.
create policy "Anyone can submit the contact form"
  on public.contact_submissions for insert
  with check (true);

create policy "Contact submissions are viewable by admin"
  on public.contact_submissions for select
  using (public.is_admin());
