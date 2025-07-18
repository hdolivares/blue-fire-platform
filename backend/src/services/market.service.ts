import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface MarketData {
  industry: string;
  marketSize: number;
  growthRate: number;
  averageROI: number;
  averageEfficiency: number;
  averageUptime: number;
  averageRevenuePerLiter: number;
  topPlayers: string[];
  marketTrends: MarketTrend[];
}

export interface MarketTrend {
  period: string;
  growthRate: number;
  marketSize: number;
  averageROI: number;
}

export interface CompetitorData {
  name: string;
  marketShare: number;
  efficiency: number;
  uptime: number;
  revenuePerLiter: number;
  roi: number;
  strengths: string[];
  weaknesses: string[];
}

export interface IndustryBenchmark {
  metric: string;
  blueFireValue: number;
  industryAverage: number;
  industryTop: number;
  blueFireRank: number;
  improvement: number;
}

@Injectable()
export class MarketService {
  private readonly logger = new Logger(MarketService.name);
  private marketApiEndpoint: string;
  private apiKey: string;

  constructor(private configService: ConfigService) {
    this.marketApiEndpoint = this.configService.get<string>('MARKET_API_ENDPOINT') || 'https://api.market-data.com';
    this.apiKey = this.configService.get<string>('MARKET_API_KEY') || '';
  }

  /**
   * Get market data for water treatment industry
   */
  async getMarketData(): Promise<MarketData> {
    try {
      // Simulate real market data
      return this.getSimulatedMarketData();
    } catch (error) {
      this.logger.error('Error fetching market data:', error);
      return this.getFallbackMarketData();
    }
  }

  /**
   * Get competitor analysis
   */
  async getCompetitorAnalysis(): Promise<CompetitorData[]> {
    try {
      return this.getSimulatedCompetitorData();
    } catch (error) {
      this.logger.error('Error fetching competitor data:', error);
      return [];
    }
  }

  /**
   * Get industry benchmarks
   */
  async getIndustryBenchmarks(): Promise<IndustryBenchmark[]> {
    try {
      return this.getSimulatedBenchmarks();
    } catch (error) {
      this.logger.error('Error fetching industry benchmarks:', error);
      return [];
    }
  }

  /**
   * Get market trends
   */
  async getMarketTrends(period: 'monthly' | 'quarterly' | 'yearly' = 'quarterly'): Promise<MarketTrend[]> {
    try {
      return this.getSimulatedMarketTrends(period);
    } catch (error) {
      this.logger.error('Error fetching market trends:', error);
      return [];
    }
  }

  /**
   * Get simulated market data
   */
  private getSimulatedMarketData(): MarketData {
    const baseMarketSize = 45000000000; // $45B global water treatment market
    const growthFactor = 1 + (Math.random() * 0.1 - 0.05); // ±5% variation
    
    return {
      industry: 'Water Treatment & Purification',
      marketSize: baseMarketSize * growthFactor,
      growthRate: 6.5 + (Math.random() * 3 - 1.5), // 5-8% growth
      averageROI: 8 + (Math.random() * 4 - 2), // 6-10% ROI
      averageEfficiency: 0.75 + (Math.random() * 0.1 - 0.05), // 0.7-0.8 L/kWh
      averageUptime: 82 + (Math.random() * 6 - 3), // 79-85%
      averageRevenuePerLiter: 0.4 + (Math.random() * 0.2 - 0.1), // $0.3-0.5 per liter
      topPlayers: [
        'Veolia Environment',
        'Suez Environment',
        'Xylem Inc.',
        'Evoqua Water Technologies',
        'Pentair PLC',
        'Blue Fire Platform'
      ],
      marketTrends: this.getSimulatedMarketTrends('quarterly'),
    };
  }

  /**
   * Get simulated competitor data
   */
  private getSimulatedCompetitorData(): CompetitorData[] {
    return [
      {
        name: 'Veolia Environment',
        marketShare: 12.5,
        efficiency: 0.72,
        uptime: 84.2,
        revenuePerLiter: 0.38,
        roi: 7.8,
        strengths: ['Global presence', 'Diversified portfolio', 'Strong R&D'],
        weaknesses: ['High operational costs', 'Complex bureaucracy', 'Slow innovation'],
      },
      {
        name: 'Suez Environment',
        marketShare: 10.8,
        efficiency: 0.74,
        uptime: 83.1,
        revenuePerLiter: 0.42,
        roi: 8.2,
        strengths: ['Advanced technology', 'Efficient operations', 'Strong partnerships'],
        weaknesses: ['Limited emerging market presence', 'High debt levels'],
      },
      {
        name: 'Xylem Inc.',
        marketShare: 8.3,
        efficiency: 0.78,
        uptime: 86.5,
        revenuePerLiter: 0.45,
        roi: 9.1,
        strengths: ['Innovation leader', 'High efficiency', 'Strong brand'],
        weaknesses: ['Premium pricing', 'Limited scale'],
      },
      {
        name: 'Blue Fire Platform',
        marketShare: 2.1,
        efficiency: 0.85,
        uptime: 87.0,
        revenuePerLiter: 0.50,
        roi: 12.0,
        strengths: ['Blockchain integration', 'High efficiency', 'Innovative model'],
        weaknesses: ['Limited scale', 'New market entrant'],
      },
    ];
  }

  /**
   * Get simulated benchmarks
   */
  private getSimulatedBenchmarks(): IndustryBenchmark[] {
    return [
      {
        metric: 'Energy Efficiency (L/kWh)',
        blueFireValue: 0.85,
        industryAverage: 0.75,
        industryTop: 0.82,
        blueFireRank: 1,
        improvement: 13.3,
      },
      {
        metric: 'Uptime (%)',
        blueFireValue: 87.0,
        industryAverage: 82.5,
        industryTop: 86.5,
        blueFireRank: 1,
        improvement: 5.5,
      },
      {
        metric: 'Revenue per Liter ($)',
        blueFireValue: 0.50,
        industryAverage: 0.40,
        industryTop: 0.45,
        blueFireRank: 1,
        improvement: 25.0,
      },
      {
        metric: 'ROI (%)',
        blueFireValue: 12.0,
        industryAverage: 8.5,
        industryTop: 9.1,
        blueFireRank: 1,
        improvement: 41.2,
      },
      {
        metric: 'Water Production (L/day)',
        blueFireValue: 2500,
        industryAverage: 2000,
        industryTop: 2300,
        blueFireRank: 1,
        improvement: 25.0,
      },
    ];
  }

  /**
   * Get simulated market trends
   */
  private getSimulatedMarketTrends(period: 'monthly' | 'quarterly' | 'yearly'): MarketTrend[] {
    const trends: MarketTrend[] = [];
    const periods = period === 'monthly' ? 12 : period === 'quarterly' ? 8 : 5;
    
    for (let i = periods - 1; i >= 0; i--) {
      const baseGrowth = 6.5;
      const growthVariation = (Math.random() * 2 - 1); // ±1% variation
      const growthRate = baseGrowth + growthVariation;
      
      const baseMarketSize = 45000000000;
      const marketGrowth = 1 + (growthRate / 100);
      const marketSize = baseMarketSize * Math.pow(marketGrowth, periods - i);
      
      const baseROI = 8.5;
      const roiVariation = (Math.random() * 2 - 1); // ±1% variation
      const averageROI = baseROI + roiVariation;
      
      trends.push({
        period: this.getPeriodLabel(period, i),
        growthRate,
        marketSize,
        averageROI,
      });
    }
    
    return trends;
  }

  /**
   * Get period label
   */
  private getPeriodLabel(period: 'monthly' | 'quarterly' | 'yearly', index: number): string {
    const now = new Date();
    
    if (period === 'monthly') {
      const date = new Date(now.getFullYear(), now.getMonth() - index, 1);
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
    } else if (period === 'quarterly') {
      const quarter = Math.floor((now.getMonth() - index * 3) / 3) + 1;
      const year = now.getFullYear() - Math.floor(index / 4);
      return `Q${quarter} ${year}`;
    } else {
      const year = now.getFullYear() - index;
      return year.toString();
    }
  }

  /**
   * Get fallback market data
   */
  private getFallbackMarketData(): MarketData {
    return {
      industry: 'Water Treatment & Purification',
      marketSize: 45000000000,
      growthRate: 6.5,
      averageROI: 8.5,
      averageEfficiency: 0.75,
      averageUptime: 82.5,
      averageRevenuePerLiter: 0.40,
      topPlayers: [
        'Veolia Environment',
        'Suez Environment',
        'Xylem Inc.',
        'Evoqua Water Technologies',
        'Pentair PLC',
        'Blue Fire Platform'
      ],
      marketTrends: [],
    };
  }

  /**
   * Get market opportunity analysis
   */
  async getMarketOpportunity(): Promise<{
    totalAddressableMarket: number;
    serviceableAddressableMarket: number;
    serviceableObtainableMarket: number;
    marketPenetration: number;
    growthOpportunity: number;
  }> {
    try {
      const marketData = await this.getMarketData();
      const totalAddressableMarket = marketData.marketSize;
      const serviceableAddressableMarket = totalAddressableMarket * 0.3; // 30% of TAM
      const serviceableObtainableMarket = serviceableAddressableMarket * 0.15; // 15% of SAM
      const marketPenetration = (serviceableObtainableMarket / totalAddressableMarket) * 100;
      const growthOpportunity = marketData.growthRate * 1.5; // 1.5x industry growth
      
      return {
        totalAddressableMarket,
        serviceableAddressableMarket,
        serviceableObtainableMarket,
        marketPenetration,
        growthOpportunity,
      };
    } catch (error) {
      this.logger.error('Error getting market opportunity:', error);
      return {
        totalAddressableMarket: 45000000000,
        serviceableAddressableMarket: 13500000000,
        serviceableObtainableMarket: 2025000000,
        marketPenetration: 4.5,
        growthOpportunity: 9.75,
      };
    }
  }
} 