import { Hono } from "npm:hono";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// ===========================
// GROK FUNDAMENTAL ANALYSIS FOR TICKER
// ===========================
// Analyzes company fundamentals using Grok AI
// Caches results for 24 hours
app.post('/make-server-30a5a587/fundamental-analysis/:symbol', async (c) => {
  console.log('📊 Fundamental Analysis request for ticker');
  
  try {
    const symbol = c.req.param('symbol')?.toUpperCase();
    
    if (!symbol) {
      return c.json({
        success: false,
        message: 'Symbol is required'
      }, 400);
    }
    
    // Check cache first (24 hour TTL)
    const cacheKey = `fundamental:${symbol}`;
    const cached = await kv.get(cacheKey);
    
    if (cached && cached.timestamp) {
      const age = Date.now() - new Date(cached.timestamp).getTime();
      const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
      
      if (age < TWENTY_FOUR_HOURS) {
        console.log(`✅ Returning cached fundamental analysis for ${symbol} (${Math.round(age / 3600000)}h old)`);
        return c.json({
          success: true,
          symbol,
          analysis: cached.analysis,
          cached: true,
          timestamp: cached.timestamp
        });
      }
    }
    
    // Generate new fundamental analysis with Grok
    console.log(`🤖 Generating fundamental analysis for ${symbol} with Grok...`);
    
    // Get Grok API key
    const grokApiKey = Deno.env.get('XAI_GROK_API_KEY');
    if (!grokApiKey) {
      console.error('❌ XAI_GROK_API_KEY not found');
      return c.json({
        success: false,
        message: 'Grok API key not configured'
      }, 500);
    }
    
    // Get current price data for context
    const priceData = await kv.get(`price:${symbol}`);
    const currentPrice = priceData?.price || 'N/A';
    
    // Call Grok API
    const grokResponse = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${grokApiKey}`
      },
      body: JSON.stringify({
        model: 'grok-beta',
        messages: [
          {
            role: 'system',
            content: `You are a fundamental analysis expert for SEPT Trading. Analyze stocks comprehensively.

**OUTPUT FORMAT (JSON):**
{
  "marketCap": "e.g. $3.2T or $45.2B",
  "peRatio": "e.g. 32.4 or N/A",
  "revenueGrowthYoY": "e.g. +126% or -5%",
  "eps": "e.g. $6.42 or -$0.23",
  "profitMargin": "e.g. 26.5% or -2.1%",
  "debtToEquity": "e.g. 0.45 or 2.3",
  "sector": "e.g. Technology, Healthcare, Energy",
  "industry": "e.g. Semiconductors, Biotechnology",
  "summary": "2-3 sentence fundamental summary focusing on key strengths/weaknesses",
  "septPerspective": "How fundamentals support or contradict the technical setup. Be direct and actionable."
}

**RULES:**
- Use real, current data (not outdated)
- If data unavailable, use "N/A" but explain why in summary
- Keep summary concise and focused on what traders need to know
- SEPT Perspective should tie fundamentals to price action`
          },
          {
            role: 'user',
            content: `Provide comprehensive fundamental analysis for ${symbol}. Current price: $${currentPrice}.

Focus on:
- Market cap, P/E ratio, revenue growth, EPS, profit margin, debt/equity
- Sector and industry classification
- Key fundamental strengths or weaknesses
- How fundamentals align with current price levels

Return ONLY valid JSON. No markdown, no explanation.`
          }
        ],
        temperature: 0.7,
        max_tokens: 800
      })
    });
    
    if (!grokResponse.ok) {
      const errorText = await grokResponse.text();
      console.error('❌ Grok API error:', errorText);
      throw new Error(`Grok API error: ${grokResponse.status} ${errorText}`);
    }
    
    const grokData = await grokResponse.json();
    const grokContent = grokData.choices?.[0]?.message?.content || '';
    
    console.log('🤖 Grok raw response:', grokContent.substring(0, 200));
    
    // Parse JSON from Grok response
    let analysis;
    try {
      // Remove markdown code blocks if present
      const jsonMatch = grokContent.match(/```json\s*([\s\S]*?)\s*```/) || 
                       grokContent.match(/```\s*([\s\S]*?)\s*```/);
      const jsonText = jsonMatch ? jsonMatch[1] : grokContent;
      analysis = JSON.parse(jsonText.trim());
    } catch (parseError) {
      console.error('❌ Failed to parse Grok JSON:', parseError);
      console.error('Raw content:', grokContent);
      
      // Fallback: create structured response from text
      analysis = {
        marketCap: 'N/A',
        peRatio: 'N/A',
        revenueGrowthYoY: 'N/A',
        eps: 'N/A',
        profitMargin: 'N/A',
        debtToEquity: 'N/A',
        sector: 'Unknown',
        industry: 'Unknown',
        summary: grokContent.substring(0, 200),
        septPerspective: 'Fundamental data unavailable at this time.'
      };
    }
    
    // Cache the result
    const result = {
      analysis,
      timestamp: new Date().toISOString()
    };
    
    await kv.set(cacheKey, result);
    console.log(`✅ Cached fundamental analysis for ${symbol}`);
    
    return c.json({
      success: true,
      symbol,
      analysis,
      cached: false,
      timestamp: result.timestamp
    });
    
  } catch (error: any) {
    console.error('❌ Error generating fundamental analysis:', error);
    return c.json({
      success: false,
      message: `Error: ${error.message}`
    }, 500);
  }
});

export default app;
