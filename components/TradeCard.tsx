import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { TrendingUp, TrendingDown, LineChart as LineChartIcon, BookOpen, BarChart3, Sparkles, Building2, ChevronDown, ChevronUp, RefreshCw } from "lucide-react";
import { Button } from "./ui/button";
import { AnimatedPrice, AnimatedChange, PricePulseIndicator } from "./AnimatedPrice";
import { SocialShare } from "./SocialShare";
import { motion } from "motion/react";
import { useState, useEffect } from "react";
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface TradeCardProps {
  trade: any;
  index: number;
  livePrice: any;
  activeModule: string;
  onSelectStock?: (symbol: string) => void;
  onLogEvent: (event: string, data: any) => void;
}

export function TradeCard({ trade, index, livePrice, activeModule, onSelectStock, onLogEvent }: TradeCardProps) {
  const [expandedTradingGuidance, setExpandedTradingGuidance] = useState(false);
  const [expandedTechnicalAnalysis, setExpandedTechnicalAnalysis] = useState(false);
  const [expandedRationale, setExpandedRationale] = useState(false);
  const [expandedFundamentalAnalysis, setExpandedFundamentalAnalysis] = useState(false);
  
  // 📊 Grok fundamental analysis
  const [fundamentalData, setFundamentalData] = useState<any>(null);
  const [loadingFundamental, setLoadingFundamental] = useState(false);
  
  const currentPrice = livePrice?.price || trade.entry;
  const priceChange = livePrice ? ((currentPrice - trade.entry) / trade.entry) * 100 : 0;
  
  // Fetch fundamental analysis when expanded
  useEffect(() => {
    if (expandedFundamentalAnalysis && !fundamentalData && !loadingFundamental) {
      fetchFundamentalAnalysis();
    }
  }, [expandedFundamentalAnalysis]);
  
  const fetchFundamentalAnalysis = async () => {
    setLoadingFundamental(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-30a5a587/fundamental-analysis/${trade.symbol}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          }
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setFundamentalData(data.analysis);
        }
      }
    } catch (error) {
      console.error(`Error fetching fundamental analysis for ${trade.symbol}:`, error);
    } finally {
      setLoadingFundamental(false);
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Card className="border border-gray-200 bg-white hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <Badge className={trade.direction === 'long' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}>
                  {trade.direction === 'long' ? (
                    <><TrendingUp className="w-3 h-3 mr-1" />LONG</>
                  ) : (
                    <><TrendingDown className="w-3 h-3 mr-1" />SHORT</>
                  )}
                </Badge>
                
                {trade.type === 'intraday' && (
                  <Badge className="bg-orange-600 text-white">Intraday</Badge>
                )}
                {trade.type === 'swing' && (
                  <Badge className="bg-blue-600 text-white">Swing</Badge>
                )}
                {trade.type === 'longterm' && (
                  <Badge className="bg-purple-600 text-white">Long Term</Badge>
                )}
                
                <CardTitle className="text-2xl">{trade.symbol}</CardTitle>
                {livePrice && <PricePulseIndicator isLive={true} />}
              </div>
              <CardDescription className="text-sm">
                {trade.strategy || trade.patternType}
              </CardDescription>
            </div>
            
            <div className="text-right flex flex-col items-end gap-2">
              {livePrice ? (
                <div className="space-y-1">
                  <div className="text-xs text-gray-500">Current Price</div>
                  <AnimatedPrice 
                    value={currentPrice} 
                    decimals={2} 
                    prefix="$" 
                    size="lg"
                    className="text-2xl font-bold"
                  />
                  <div className="flex items-center justify-end gap-1">
                    <AnimatedChange value={priceChange} size="sm" showArrow={true} />
                  </div>
                </div>
              ) : (
                <div>
                  <div className="text-xs text-gray-500 mb-1">Entry Price</div>
                  <div className="text-2xl font-bold">${trade.entry.toFixed(2)}</div>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Support & Resistance Levels */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-red-50/50 rounded-lg border border-red-200">
              <div className="text-red-700 mb-2 font-semibold flex items-center gap-1">
                <span className="text-sm">📉 Support Levels</span>
              </div>
              <div className="space-y-1">
                {(trade.support || [trade.stopLoss * 0.98, trade.stopLoss * 0.99, trade.stopLoss]).map((level, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-gray-600 font-medium">S{i + 1}:</span>
                    <span className="text-black font-bold">${level.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="p-3 bg-green-50/50 rounded-lg border border-green-200">
              <div className="text-green-700 mb-2 font-semibold flex items-center gap-1">
                <span className="text-sm">📈 Resistance Levels</span>
              </div>
              <div className="space-y-1">
                {(trade.resistance || [trade.takeProfit, trade.takeProfit * 1.01, trade.takeProfit * 1.02]).map((level, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-gray-600 font-medium">R{i + 1}:</span>
                    <span className="text-black font-bold">${level.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Grok Fundamental Analysis */}
          {expandedFundamentalAnalysis && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="p-3 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 rounded-lg border-2 border-emerald-300 shadow-sm"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-gradient-to-br from-emerald-500 to-teal-500 rounded">
                    <Building2 className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-gray-900">📊 Fundamental Analysis</div>
                    <div className="text-xs text-gray-600">Powered by Grok AI</div>
                  </div>
                </div>
              </div>
              
              {loadingFundamental ? (
                <div className="flex items-center justify-center py-6">
                  <RefreshCw className="w-6 h-6 text-emerald-600 animate-spin mr-2" />
                  <span className="text-sm text-gray-600">Analyzing fundamentals...</span>
                </div>
              ) : fundamentalData ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 bg-white rounded-md border border-emerald-200">
                      <div className="text-gray-600 font-medium mb-1">💰 Market Cap</div>
                      <div className="text-gray-900 font-medium">{fundamentalData.marketCap || 'N/A'}</div>
                    </div>
                    
                    <div className="p-2 bg-white rounded-md border border-emerald-200">
                      <div className="text-gray-600 font-medium mb-1">📈 P/E Ratio</div>
                      <div className="text-gray-900 font-medium">{fundamentalData.peRatio || 'N/A'}</div>
                    </div>
                    
                    <div className="p-2 bg-white rounded-md border border-emerald-200">
                      <div className="text-gray-600 font-medium mb-1">📊 Revenue Growth</div>
                      <div className={`font-medium ${fundamentalData.revenueGrowthYoY?.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                        {fundamentalData.revenueGrowthYoY || 'N/A'}
                      </div>
                    </div>
                    
                    <div className="p-2 bg-white rounded-md border border-emerald-200">
                      <div className="text-gray-600 font-medium mb-1">💵 EPS (TTM)</div>
                      <div className="text-gray-900 font-medium">{fundamentalData.eps || 'N/A'}</div>
                    </div>
                    
                    <div className="p-2 bg-white rounded-md border border-emerald-200">
                      <div className="text-gray-600 font-medium mb-1">💹 Profit Margin</div>
                      <div className="text-gray-900 font-medium">{fundamentalData.profitMargin || 'N/A'}</div>
                    </div>
                    
                    <div className="p-2 bg-white rounded-md border border-emerald-200">
                      <div className="text-gray-600 font-medium mb-1">📉 Debt/Equity</div>
                      <div className="text-gray-900 font-medium">{fundamentalData.debtToEquity || 'N/A'}</div>
                    </div>
                  </div>
                  
                  {fundamentalData.septPerspective && (
                    <div className="p-2 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-md border border-emerald-300">
                      <div className="text-emerald-700 font-bold mb-1 text-xs">🎯 SEPT Perspective</div>
                      <div className="text-gray-900 text-xs leading-relaxed font-medium">{fundamentalData.septPerspective}</div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-4 text-sm text-gray-600">
                  Click to load fundamental analysis
                </div>
              )}
            </motion.div>
          )}
          
          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 min-w-[120px]"
              onClick={() => {
                if (onSelectStock) {
                  onSelectStock(trade.symbol);
                }
                onLogEvent('view_chart', {
                  contentType: 'trade_idea_chart',
                  contentTitle: trade.symbol,
                  metadata: { module: activeModule, symbol: trade.symbol }
                });
              }}
            >
              <LineChartIcon className="w-4 h-4 mr-1" />
              Chart
            </Button>
            
            <Button
              variant={expandedFundamentalAnalysis ? "default" : "outline"}
              size="sm"
              className="flex-1 min-w-[180px]"
              onClick={() => {
                setExpandedFundamentalAnalysis(!expandedFundamentalAnalysis);
                onLogEvent('view_fundamental_analysis', {
                  contentType: 'fundamental_analysis',
                  contentTitle: trade.symbol,
                  metadata: { module: activeModule, symbol: trade.symbol }
                });
              }}
            >
              <Building2 className="w-4 h-4 mr-1" />
              Fundamental Analysis
              {expandedFundamentalAnalysis ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />}
            </Button>
            
            <SocialShare
              tradeIdea={{
                symbol: trade.symbol,
                direction: trade.direction,
                entry: trade.entry,
                target: trade.takeProfit,
                stop: trade.stopLoss,
                setup: trade.strategy || trade.patternType || '',
                confidence: trade.confidence
              }}
            />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
