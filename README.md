# Gailan Auctions V4
1. Put the Supabase URL and anon/publishable key in public/config.js.
2. Deploy the public folder to Cloudflare Pages.
3. Never put a Supabase service_role/secret key in the browser.
4. The SQL/RLS from the chat must already be applied.
5. Admin can add/edit/delete cars; normal users are read-only and see only their own cars.
