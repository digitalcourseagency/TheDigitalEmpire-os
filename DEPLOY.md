# Deploy to Vercel

## Option 1: Vercel CLI (fastest)
```bash
npm i -g vercel
cd ash-content-os
vercel --prod --team team_jm2RoXkoYjSB4pzRUDJvIfP2
```
When prompted, add env vars:
- NEXT_PUBLIC_SUPABASE_URL = https://oztzizcvebzpzdnhhigd.supabase.co
- NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96dHppemN2ZWJ6cHpkbmhoaWdkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUxNjU1MTMsImV4cCI6MjA5MDc0MTUxM30.DoMKVZjV65VGKEQBPLowycC5PQQwsmCSci4aPag8hVg

## Option 2: GitHub → Vercel (easiest ongoing)
1. Push this folder to a new GitHub repo
2. Go to vercel.com → New Project → Import repo
3. Add the 2 env vars above in Project Settings → Environment Variables
4. Deploy
