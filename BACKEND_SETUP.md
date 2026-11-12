# Backend setup (Supabase)

The app uses Supabase Auth for account sessions and Postgres Row Level Security (RLS) to protect saved recipes. It does not store passwords itself.

## Connect a Supabase project

1. Create a Supabase project.
2. In the project dashboard, find the Project URL and its **publishable** API key.
3. Copy `.env.example` to `.env.local` in this app folder and fill in:

   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
   ```

4. Keep `.env.local` private. Never put a `service_role` or secret key in a `VITE_` variable or in browser code. The publishable key is intended for the browser; RLS is what limits data access.
5. In Supabase **SQL Editor**, run `supabase/migrations/202611110001_saved_recipes.sql`.
6. In **Authentication → URL Configuration**, set the local Site URL to `http://localhost:5173` and allow `http://localhost:5173/**` as a redirect URL. Use the actual port Vite prints if it differs.
7. Keep email confirmation enabled for sign-up. The user must confirm their address before the account can sign in when confirmation is required.
8. Restart Vite after saving `.env.local`.

## What the migration protects

Each saved recipe row belongs to one Auth user. RLS allows a signed-in user to read, insert, and delete only rows whose `user_id` matches their authenticated user ID. Anonymous users have no access. Guest bookmarks stay in that browser; after sign-in, the app attempts to merge them into that user's account.

The recipe catalogue and demo chat remain local/demo data. This setup does not yet add a hosted recipe database, production AI chat, password-reset screen, or deployment configuration.
