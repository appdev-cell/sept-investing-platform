# SEPT Investing Platform - Deployment Checklist

## ✅ Pre-Deployment Verification

### 1. Environment Setup
- [ ] Node.js 18+ or Bun installed
- [ ] Supabase CLI installed (`npm install -g supabase`)
- [ ] Git configured with SSH keys
- [ ] All required API keys obtained

### 2. API Keys Required
- [ ] SUPABASE_URL
- [ ] SUPABASE_ANON_KEY
- [ ] SUPABASE_SERVICE_ROLE_KEY
- [ ] SUPABASE_DB_URL
- [ ] TWELVE_DATA_API_KEY (free tier = 610 calls/min)
- [ ] OPENAI_API_KEY (GPT-4o access)
- [ ] GOOGLE_GEMINI_API_KEY (Gemini 2.0 Flash)
- [ ] XAI_GROK_API_KEY (Grok beta access)
- [ ] ANTHROPIC_API_KEY (Claude 3.5 - optional)
- [ ] ADMIN_PASSWORD (your choice)
- [ ] CRON_SECRET (your choice)

### 3. Supabase Project Setup
- [ ] Supabase project created
- [ ] Project ID noted
- [ ] Database password secured
- [ ] API keys copied to safe location

## 💻 Installation Steps

### Step 1: Clone Repository
```bash
git clone https://github.com/appdev-cell/sept-investing-platform.git
cd sept-investing-platform
```

### Step 2: Install Dependencies
```bash
npm install
# or if using Bun
bun install
```

### Step 3: Configure Environment
Create `.env` file in project root:

```env
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
SUPABASE_DB_URL=postgresql://...

# Market Data
TWELVE_DATA_API_KEY=your_twelve_data_key
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_key

# AI Models
OPENAI_API_KEY=sk-...
GOOGLE_GEMINI_API_KEY=your_gemini_key
XAI_GROK_API_KEY=your_grok_key
ANTHROPIC_API_KEY=your_anthropic_key

# Security
ADMIN_PASSWORD=your_secure_password
CRON_SECRET=your_cron_secret
```

### Step 4: Update Supabase Info
Edit `/utils/supabase/info.tsx` with your project details:

```typescript
export const projectId = 'your-project-id';
export const publicAnonKey = 'your-anon-key';
```

### Step 5: Deploy Database Schema

1. Open Supabase Dashboard > SQL Editor
2. Create new query
3. Copy entire contents of `/supabase/schema.sql`
4. Execute query
5. Verify tables created:
   - users
   - trades
   - analytics_events
   - market_data
   - trade_ideas
   - briefs
   - And 20+ more tables

### Step 6: Deploy Supabase Edge Functions

```bash
# Link your Supabase project
supabase link --project-ref your-project-id

# Deploy main server function
supabase functions deploy make-server-30a5a587

# Deploy cron functions
supabase functions deploy market-brief-cron
supabase functions deploy market-sync-cron
supabase functions deploy trade-ideas-cron

# Set environment variables for functions
supabase secrets set OPENAI_API_KEY=your_key
supabase secrets set TWELVE_DATA_API_KEY=your_key
supabase secrets set XAI_GROK_API_KEY=your_key
supabase secrets set GOOGLE_GEMINI_API_KEY=your_key
supabase secrets set ADMIN_PASSWORD=your_password
supabase secrets set CRON_SECRET=your_secret
```

### Step 7: Configure Cron Jobs

In Supabase Dashboard > Database > Cron Jobs:

#### Morning Brief Generation
```sql
SELECT cron.schedule(
  'morning-brief-generation',
  '0 6 * * 1-5',  -- 6 AM ET, Monday-Friday
  $$
  SELECT net.http_post(
    url := 'https://your-project.supabase.co/functions/v1/market-brief-cron',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb
  );
  $$
);
```

#### Evening Wrap Generation
```sql
SELECT cron.schedule(
  'evening-wrap-generation',
  '0 17 * * 1-5',  -- 5 PM ET, Monday-Friday
  $$
  SELECT net.http_post(
    url := 'https://your-project.supabase.co/functions/v1/make-server-30a5a587/cron/generate-evening-wrap',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer YOUR_ANON_KEY", "X-Cron-Secret": "YOUR_CRON_SECRET"}'::jsonb
  );
  $$
);
```

#### Trade Ideas Generation (3x daily)
```sql
SELECT cron.schedule(
  'trade-ideas-generation',
  '0 8,11,14 * * 1-5',  -- 8 AM, 11 AM, 2 PM ET
  $$
  SELECT net.http_post(
    url := 'https://your-project.supabase.co/functions/v1/make-server-30a5a587/cron/generate-trade-ideas-full-pipeline',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer YOUR_ANON_KEY", "X-Cron-Secret": "YOUR_CRON_SECRET"}'::jsonb
  );
  $$
);
```

#### Price Updates (Every 5 minutes during market hours)
```sql
SELECT cron.schedule(
  'price-updates',
  '*/5 * * * 1-5',  -- Every 5 minutes, Monday-Friday
  $$
  SELECT net.http_post(
    url := 'https://your-project.supabase.co/functions/v1/make-server-30a5a587/cron/update-prices',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer YOUR_ANON_KEY", "X-Cron-Secret": "YOUR_CRON_SECRET"}'::jsonb
  );
  $$
);
```

### Step 8: Test Locally

```bash
npm run dev
# or
bun dev
```

Open http://localhost:5173 and verify:
- [ ] App loads without errors
- [ ] Login/signup works
- [ ] Market data displays
- [ ] Trade ideas load
- [ ] Charts render correctly

### Step 9: Deploy to Production

#### Option A: Vercel
```bash
npm install -g vercel
vercel login
vercel
# Follow prompts, add environment variables in Vercel dashboard
```

#### Option B: Netlify
```bash
npm install -g netlify-cli
netlify login
netlify init
netlify deploy --prod
# Add environment variables in Netlify dashboard
```

#### Option C: Supabase Hosting (Coming Soon)
```bash
# Follow Supabase hosting docs when available
```

## 📦 Post-Deployment

### 1. Verify API Connections
- [ ] Visit Admin Portal (admin-portal button)
- [ ] Check API Credit Monitor
- [ ] Verify Twelve Data connection
- [ ] Test AI model responses

### 2. Initialize Data
```bash
# Trigger initial stock discovery
curl -X POST https://your-project.supabase.co/functions/v1/make-server-30a5a587/cron/discover-stocks \
  -H "X-Cron-Secret: YOUR_CRON_SECRET"

# Generate initial trade ideas
curl -X POST https://your-project.supabase.co/functions/v1/make-server-30a5a587/cron/generate-trade-ideas-full-pipeline \
  -H "X-Cron-Secret: YOUR_CRON_SECRET"
```

### 3. Monitor Performance
- [ ] Check Supabase logs for errors
- [ ] Verify cron jobs running
- [ ] Monitor API usage (stay under 610 calls/min)
- [ ] Test user signup/login flow
- [ ] Verify email notifications (if configured)

### 4. Security Checklist
- [ ] Environment variables not committed to Git
- [ ] Admin password is strong
- [ ] Cron secret is unique
- [ ] Supabase RLS policies enabled
- [ ] API keys rotated from defaults

## 🐛 Troubleshooting

### Issue: Build fails
**Solution**: Check Node version (18+), clear node_modules, reinstall

### Issue: Supabase functions fail
**Solution**: Verify environment variables set with `supabase secrets list`

### Issue: No trade ideas generated
**Solution**: 
1. Check API keys are valid
2. Verify stock discovery ran successfully
3. Check Supabase function logs
4. Ensure sufficient API credits (Twelve Data, OpenAI, etc.)

### Issue: Charts not loading
**Solution**: Verify TradingView script loaded, check browser console

### Issue: Prices not updating
**Solution**: 
1. Check Twelve Data API key
2. Verify cron jobs running
3. Check API rate limits (610/min)

### Issue: Fundamental analysis not working
**Solution**: 
1. Verify XAI_GROK_API_KEY set
2. Check Grok API quota
3. Verify 24-hour cache working

## 📊 Monitoring & Maintenance

### Daily Checks
- [ ] Morning Brief generated (6 AM ET)
- [ ] Trade Ideas updated (8 AM, 11 AM, 2 PM ET)
- [ ] Evening Wrap generated (5 PM ET)
- [ ] No error spikes in logs

### Weekly Checks
- [ ] API usage within limits
- [ ] Database size reasonable
- [ ] No stale cache data
- [ ] User feedback reviewed

### Monthly Checks
- [ ] API costs reviewed
- [ ] Performance metrics analyzed
- [ ] Security audit
- [ ] Backup verification

## 🔗 Important URLs

- **Production**: https://your-domain.com
- **Supabase Dashboard**: https://app.supabase.com/project/your-project-id
- **GitHub Repo**: https://github.com/appdev-cell/sept-investing-platform
- **Admin Portal**: https://your-domain.com (click admin-portal button)

## 📞 Support

For issues:
1. Check logs in Supabase Dashboard
2. Review BACKUP_STATUS.md for file structure
3. Check troubleshooting section above
4. Contact: appdev@septinvesting.com

---

**✅ Deployment Complete!** Your SEPT Investing Platform is now live.
