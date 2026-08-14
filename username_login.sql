
-- تشغيل تسجيل الدخول باسم المستخدم
-- لا يكشف البريد الإلكتروني للمستخدم؛ الدالة ترجع البريد المرتبط باسم المستخدم فقط
create or replace function public.get_login_email(p_username text)
returns text
language sql
security definer
set search_path = public
as $$
  select u.email
  from public.profiles p
  join auth.users u on u.id = p.id
  where lower(p.username) = lower(trim(p_username))
    and p.active = true
  limit 1;
$$;

revoke all on function public.get_login_email(text) from public;
grant execute on function public.get_login_email(text) to anon, authenticated;
