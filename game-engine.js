// ========== СИСТЕМА СИГНАЛОВ ==========

class SignalSystem {
    constructor() {
        this.signals = [];
        this.lastAnalysis = {};
        this.setupSignals();
    }

    setupSignals() {
        // Авто-генерация сигналов каждые 2 часа
        setInterval(() => this.generateSignals(), 2 * 60 * 60 * 1000);
        this.generateSignals(); // Первый запуск
    }

    async generateSignals() {
        try {
            const marketData = await this.fetchMarketAnalysis();
            const newSignals = this.analyzeMarket(marketData);
            
            this.signals = [...newSignals, ...this.signals].slice(0, 20); // Храним 20 последних
            
            // Сохраняем в localStorage
            localStorage.setItem('crypto_signals', JSON.stringify(this.signals));
            
            console.log('🔔 Сгенерированы новые сигналы:', newSignals.length);
            
        } catch (error) {
            console.warn('Ошибка генерации сигналов:', error);
            this.generateDemoSignals();
        }
    }

    async fetchMarketAnalysis() {
        // Используем CoinGecko API для получения данных
        const response = await fetch(
            'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&page=1&sparkline=true&price_change_percentage=1h,24h,7d'
        );
        return await response.json();
    }

    analyzeMarket(marketData) {
        const signals = [];

        marketData.forEach(coin => {
            const signal = this.analyzeCoin(coin);
            if (signal) {
                signals.push(signal);
            }
        });

        return signals;
    }

    analyzeCoin(coin) {
        const priceChange24h = coin.price_change_percentage_24h;
        const priceChange7d = coin.price_change_percentage_7d_in_currency;
        const volume = coin.total_volume;
        const marketCap = coin.market_cap;
        
        // Анализ тренда
        const trend = this.calculateTrend(coin.sparkline_in_7d?.price);
        
        // Генерация сигнала на основе анализа
        if (priceChange24h > 8 && volume > 100000000) {
            return this.createSignal(coin, 'BUY', 'Сильный восходящий тренд', trend);
        } else if (priceChange24h < -6 && volume > 50000000) {
            return this.createSignal(coin, 'SELL', 'Коррекция после роста', trend);
        } else if (Math.abs(priceChange24h) < 2 && volume > 200000000) {
            return this.createSignal(coin, 'HOLD', 'Консолидация перед движением', trend);
        }

        return null;
    }

    calculateTrend(sparklineData) {
        if (!sparklineData || sparklineData.length < 10) return 'NEUTRAL';
        
        const recent = sparklineData.slice(-10);
        const first = recent[0];
        const last = recent[recent.length - 1];
        
        const change = ((last - first) / first) * 100;
        
        if (change > 3) return 'BULLISH';
        if (change < -3) return 'BEARISH';
        return 'NEUTRAL';
    }

    createSignal(coin, action, reason, trend) {
        const currentPrice = coin.current_price;
        let targets = [];
        let stopLoss = 0;

        // Расчет целей и стоп-лосса
        if (action === 'BUY') {
            targets = [
                currentPrice * 1.03,  // +3%
                currentPrice * 1.06,  // +6%
                currentPrice * 1.10   // +10%
            ];
            stopLoss = currentPrice * 0.95; // -5%
        } else if (action === 'SELL') {
            targets = [
                currentPrice * 0.97,  // -3%
                currentPrice * 0.94,  // -6%
                currentPrice * 0.90   // -10%
            ];
            stopLoss = currentPrice * 1.05; // +5%
        } else {
            targets = [currentPrice * 1.02, currentPrice * 0.98];
            stopLoss = currentPrice;
        }

        return {
            id: Date.now(),
            symbol: coin.symbol.toUpperCase(),
            name: coin.name,
            action: action,
            currentPrice: currentPrice,
            targets: targets,
            stopLoss: stopLoss,
            reason: reason,
            trend: trend,
            confidence: this.calculateConfidence(coin),
            timestamp: new Date().toISOString(),
            expiration: Date.now() + (24 * 60 * 60 * 1000) // 24 часа
        };
    }

    calculateConfidence(coin) {
        let confidence = 50; // Базовая уверенность
        
        // Объем увеличивает уверенность
        if (coin.total_volume > 1000000000) confidence += 20;
        else if (coin.total_volume > 500000000) confidence += 10;
        
        // Волатильность уменьшает уверенность
        const volatility = Math.abs(coin.price_change_percentage_24h);
        if (volatility > 15) confidence -= 15;
        else if (volatility > 10) confidence -= 10;
        
        return Math.max(10, Math.min(95, confidence));
    }

    generateDemoSignals() {
        // Демо-сигналы если API недоступно
        this.signals = [
            {
                id: 1,
                symbol: 'BTC',
                name: 'Bitcoin',
                action: 'BUY',
                currentPrice: 45000,
                targets: [46350, 47700, 49500],
                stopLoss: 42750,
                reason: 'Пробитие ключевого уровня сопротивления',
                trend: 'BULLISH',
                confidence: 75,
                timestamp: new Date().toISOString()
            },
            {
                id: 2,
                symbol: 'ETH',
                name: 'Ethereum',
                action: 'HOLD',
                currentPrice: 3000,
                targets: [3060, 2940],
                stopLoss: 3000,
                reason: 'Консолидация в узком диапазоне',
                trend: 'NEUTRAL',
                confidence: 60,
                timestamp: new Date().toISOString()
            }
        ];
    }

    getSignals(limit = 5) {
        const now = Date.now();
        // Фильтруем просроченные сигналы
        const validSignals = this.signals.filter(signal => 
            signal.expiration > now
        );
        return validSignals.slice(0, limit);
    }

    getSignalForAsset(symbol) {
        return this.signals.find(signal => 
            signal.symbol === symbol.toUpperCase() && 
            signal.expiration > Date.now()
        );
    }
}

// Добавляем систему сигналов в GalacticEngine
GalacticEngine.prototype.initSignalSystem = function() {
    this.signalSystem = new SignalSystem();
};

GalacticEngine.prototype.getSignals = function(limit = 5) {
    return this.signalSystem ? this.signalSystem.getSignals(limit) : [];
};

GalacticEngine.prototype.getAssetSignal = function(symbol) {
    return this.signalSystem ? this.signalSystem.getSignalForAsset(symbol) : null;
};
