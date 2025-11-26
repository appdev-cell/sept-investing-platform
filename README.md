# SEPT Investing Platform

A comprehensive trading and investment platform providing traders with daily market analysis, trade ideas, and lessons following strict SEPT methodology.

## 🚀 Key Features

### Core Trading Features
- **Daily Market Analysis**: Automated Morning Brief (6 AM ET) and Evening Wrap (5 PM ET)
- **AI-Powered Trade Ideas**: 4-AI hybrid system using Gemini 2.0 Flash, Grok, and GPT-4o
- **Advanced Charting**: Fully functional TradingView integration
- **Trade Journal**: CSV bulk import with strategy tracking
- **Technical Signal System**: Color-coded labels based on EMA crossovers across multiple timeframes

### Market Intelligence
- **Real-Time Market Data**: Integration with Twelve Data API
- **Technical Indicators**: 100% RSI, EMA9, EMA21, MACD coverage across all stocks
- **Smart Caching**: 15-minute TTL technical indicator caching
- **Economic Calendar**: Real-time event tracking and analysis
- **Earnings Analysis**: Detailed earnings results with actionable insights

### Social & Community
- **Social Trading Hub**: Follow and copy professional traders
- **Content Feed System**: Share insights and analysis
- **Referral Program**: Built-in affiliate system
- **Professional Trader Tiers**: Tiered access system for expert traders

### AI & Automation
- **AI Marketing Automation**: Intelligent campaign management
- **AI Playbook Generation**: Personalized trading playbooks
- **Automatic Brief Generation**: Scheduled morning and evening market reports
- **Sentiment Analysis**: Real-time market sentiment with Grok
- **Fundamental Analysis**: Grok-powered company analysis for every ticker

### Platform Features
- **Multi-Language Support**: Comprehensive i18n implementation
- **Minimalist Design**: Clean black, white, and gray aesthetic
- **Admin Dashboard**: Complete platform management
- **API Credit Monitoring**: Real-time usage tracking and optimization

## 🏗️ Architecture

### Frontend
- **Framework**: React with TypeScript
- **Styling**: Tailwind CSS v4.0
- **UI Components**: shadcn/ui component library
- **State Management**: React Context API
- **Charts**: TradingView, Recharts

### Backend
- **Runtime**: Deno on Supabase Edge Functions
- **Web Server**: Hono
- **Database**: PostgreSQL (Supabase)
- **Storage**: Supabase Storage for blob data
- **Authentication**: Supabase Auth

### APIs & Data Sources
- **Market Data**: Twelve Data API (primary)
- **AI Models**: 
  - Gemini 2.0 Flash (bulk stock screening)
  - Grok (real-time sentiment analysis & fundamental analysis)
  - GPT-4o (trade generation & technical analysis)

### Caching & Optimization
- **Technical Indicators**: 15-minute TTL cache
- **API Rate Limiting**: Optimized to stay within 610 calls/minute
- **Batch Processing**: Reduces API usage from 400 to 0 calls on cached runs
- **Fundamental Data**: 24-hour cache for company analysis

## 📋 Prerequisites

- Node.js 18+ or Bun
- Supabase account
- Required API keys:
  - Twelve Data API key
  - OpenAI API key (for GPT-4o)
  - Google Gemini API key
  - X.AI Grok API key
  - Anthropic API key (optional)

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/appdev-cell/sept-investing-platform.git
   cd sept-investing-platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   bun install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   SUPABASE_DB_URL=your_db_url
   
   TWELVE_DATA_API_KEY=your_twelve_data_key
   OPENAI_API_KEY=your_openai_key
   GOOGLE_GEMINI_API_KEY=your_gemini_key
   XAI_GROK_API_KEY=your_grok_key
   ANTHROPIC_API_KEY=your_anthropic_key
   ALPHA_VANTAGE_API_KEY=your_alpha_vantage_key
   ```

4. **Deploy Supabase schema**
   
   Run the SQL schema file in your Supabase dashboard:
   ```bash
   # Navigate to Supabase SQL Editor and run:
   supabase/schema.sql
   ```

5. **Set up cron jobs**
   
   Configure Supabase cron jobs for automated briefs:
   - Morning Brief: `0 6 * * *` (6 AM ET)
   - Evening Wrap: `0 17 * * *` (5 PM ET)
   
   See `CRON_SETUP.md` for detailed instructions.

6. **Deploy Supabase functions**
   ```bash
   supabase functions deploy
   ```

7. **Start the development server**
   ```bash
   npm run dev
   # or
   bun dev
   ```

## 📚 Documentation

- **[START_HERE.md](./START_HERE.md)** - Quick start guide
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - System architecture details
- **[CRON_SETUP.md](./CRON_SETUP.md)** - Automated brief setup
- **[API_OPTIMIZATION_SUMMARY.md](./API_OPTIMIZATION_SUMMARY.md)** - API usage optimization
- **[TWELVE_DATA_API_OPTIMIZATION.md](./TWELVE_DATA_API_OPTIMIZATION.md)** - Twelve Data migration guide
- **[ADMIN_PORTAL_GUIDE.md](./ADMIN_PORTAL_GUIDE.md)** - Admin dashboard usage

## 🎯 Recent Updates (November 2024)

### Layout Refactor
- ✅ Replaced two-column long/short layout with single 3-column grid
- ✅ Cards now display 3 per row without directional separation
- ✅ Responsive design maintained across all breakpoints

### Grok Fundamental Analysis
- ✅ Added comprehensive fundamental analysis for every ticker
- ✅ Includes market cap, P/E ratio, revenue growth, EPS, profit margin, debt/equity
- ✅ Sector and industry classification
- ✅ SEPT perspective tying fundamentals to technical setups
- ✅ 24-hour caching to minimize API usage

### API Optimization
- ✅ Migrated from Yahoo Finance to Twelve Data API
- ✅ Implemented technical indicator caching with 15-minute TTL
- ✅ Optimized to stay within 610 API calls/minute limit
- ✅ Batch processing reduces API usage from 400 to 0 on cached runs

## 🔐 Security

- **Environment Variables**: Never commit `.env` files or API keys
- **Protected Files**: System files in `/supabase/functions/server/kv_store.tsx` are protected
- **Authentication**: Supabase Auth with JWT tokens
- **API Key Management**: Server-side only, never exposed to frontend

## 🎯 API Rate Limits

The platform is optimized for the following limits:
- **Twelve Data**: 610 API calls/minute (free tier)
- **Caching Strategy**: 15-minute TTL for technical indicators
- **Batch Processing**: Reduces redundant API calls by 100% on cached runs
- **Fundamental Cache**: 24-hour TTL for company analysis

## 📊 Project Structure

```
/
├── App.tsx                      # Main application entry
├── components/                  # React components
│   ├── TradeCard.tsx           # Individual trade card component
│   ├── TradeIdeas.tsx          # Trade ideas grid layout
│   ├── ui/                     # shadcn/ui components
│   ├── admin/                  # Admin dashboard components
│   ├── dashboard/              # Trading dashboard components
│   └── ...                     # Feature components
├── supabase/
│   ├── functions/
│   │   └── server/             # Edge function routes
│   │       ├── index.tsx       # Main server routing
│   │       └── fundamental-analysis.tsx  # Grok fundamental analysis
│   └── schema.sql              # Database schema
├── hooks/                       # Custom React hooks
├── lib/                         # Utility libraries
├── translations/                # i18n translations
├── data/                        # Static data and configs
└── styles/                      # Global styles
```

## 🤝 Contributing

This is a private project. For questions or issues, contact the development team.

## 📝 License

Proprietary - All rights reserved

## 💡 Development Notes

### Known Limitations
- Free tier Twelve Data: 610 API calls/minute limit
- Caching TTL: 15 minutes for technicals, 24 hours for fundamentals
- Cron jobs require Supabase Pro plan for production

## 📞 Support

For technical support or questions:
1. Check the documentation in `/docs`
2. Review troubleshooting guides in markdown files
3. Contact: appdev@septinvesting.com

---

**Built with ❤️ for serious traders following SEPT methodology**
