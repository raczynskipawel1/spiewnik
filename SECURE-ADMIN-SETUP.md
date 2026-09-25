# Bezpieczny panel administratora

W Vercel > Project > Settings > Environment Variables dodaj:

- `ADMIN_PASSWORD` — hasło panelu administratora (bez prefiksu NEXT_PUBLIC)
- `SUPABASE_SERVICE_ROLE_KEY` — klucz service_role z Supabase (nigdy NEXT_PUBLIC)

`NEXT_PUBLIC_SONGBOOK_PASSWORD`, `NEXT_PUBLIC_SUPABASE_URL` i `NEXT_PUBLIC_SUPABASE_ANON_KEY` zostają bez zmian.

Po wdrożeniu i sprawdzeniu panelu usuń z Supabase publiczne polityki INSERT/UPDATE/DELETE dla roli anon. Odczyt SELECT może zostać publiczny, jeśli śpiewnik ma go używać w przeglądarce.
