# Deal Dashboard — Deployment Guide

A shared deal-tracking dashboard for Angeles, Alberto, and Andrés.
Once deployed, accessible to anyone with the link — no Claude account needed.

---

## What you need (all free)

- A [Supabase](https://supabase.com) account (free tier is fine)
- A [Vercel](https://vercel.com) account (free tier is fine)
- A [GitHub](https://github.com) account (to connect Vercel)
- Node.js 18+ installed locally (only needed for the upload step)

---

## Step 1 — Set up Supabase (database)

1. Go to [supabase.com](https://supabase.com) → **Start your project** → sign up/log in
2. Click **New project** → choose a name (e.g. `deal-dashboard`) and a strong password → **Create new project**
3. Wait ~1 minute for the project to initialize
4. In the left sidebar, click **SQL Editor**
5. Click **New query** and paste the contents of `supabase/schema.sql` → click **Run**
6. Click **New query** again, paste the contents of `supabase/seed.sql` → click **Run**
   - This imports all 181 deals from your Excel file
7. Go to **Project Settings** → **API** and copy:
   - **Project URL** (looks like `https://xxxx.supabase.co`)
   - **anon / public** key (long string under "Project API keys")

---

## Step 2 — Deploy to Vercel

1. Go to [github.com](https://github.com) → **New repository** → name it `deal-dashboard` → **Create repository**
2. Upload the contents of this folder to that repository:
   - Drag and drop all files into the GitHub web interface, OR
   - Use: `git init && git add . && git commit -m "init" && git remote add origin <your-repo-url> && git push -u origin main`
3. Go to [vercel.com](https://vercel.com) → **Add New Project** → import the GitHub repo you just created
4. Before clicking Deploy, click **Environment Variables** and add:
   - `NEXT_PUBLIC_SUPABASE_URL` → your Supabase Project URL from Step 1
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` → your Supabase anon key from Step 1
5. Click **Deploy** — it takes about 2 minutes
6. Vercel gives you a URL like `https://deal-dashboard-xxx.vercel.app` — share that with your team

---

## How the team uses it

**Viewing the dashboard:**
- Open the shared link in any browser — no login required
- Filter by deal (Maye, IPO, Arca, etc.), by responsable, or by status
- Search for any investor/buyer by name

**Making weekly updates:**
1. At the top right, click your name (Angeles / Alberto / Andrés) to enter update mode — a blue banner confirms you're active
2. Click any deal card to open the update form
3. Fill in the feedback or new status for that week
4. Optionally set the next follow-up date
5. Click **Guardar actualización** — the card updates instantly

**Status auto-classification:**
When you type feedback in Spanish, the status is automatically set. You can also override it manually:
- 🟢 **En proceso** — NDA firmado, reunión concertada, call pendiente, etc.
- 🟡 **Pendiente** — A la espera, Pendiente de respuesta, etc.
- 🔵 **Con feedback** — Respuesta recibida, sin clasificar claramente
- ⚪ **Sin respuesta** — Email enviado, sin respuesta aún
- 🔴 **Descartado** — No interesados, No encaja, etc.

**Stale deals (⚠ amber warning):**
Any deal with no contact in 30+ days that isn't Descartado or En proceso gets an amber warning icon on its card.

---

## Updating the deal list

To add a new deal (new investor/potencial):
1. Go to Supabase → **Table Editor** → **deals** → **Insert row**
2. Fill in: `deal_name`, `responsable`, `potencial`, and optionally `fecha_envio`
3. The row appears on the dashboard immediately

---

## Running locally (optional, for development)

```bash
cp .env.local.example .env.local
# Fill in your Supabase URL and anon key in .env.local
npm install
npm run dev
# Open http://localhost:3000
```
