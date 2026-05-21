create or replace function public.keep_branded_invoice_alive()
returns json
language sql
security definer
set search_path = public
as $$
  select json_build_object(
    'ok', true,
    'project', 'branded-invoice',
    'time', now()
  );
$$;

grant execute on function public.keep_branded_invoice_alive() to anon;
grant execute on function public.keep_branded_invoice_alive() to authenticated;
grant execute on function public.keep_branded_invoice_alive() to service_role;