-- The site has no sign-in: only the anonymous role may call the stats functions.
revoke execute on function public.add_visit(text, text, text, text, text) from authenticated;
revoke execute on function public.add_rating(int) from authenticated;
revoke execute on function public.visit_summary() from authenticated;
revoke execute on function public.rating_summary() from authenticated;
