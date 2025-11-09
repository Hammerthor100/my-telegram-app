import fetch from 'node-fetch';

export async function analyzeMarket(symbol) {
    try {
        // Получаем текущие данные с Binance API
        const priceData = await getPriceData(symbol);
        const indicators = calculateIndicators(priceData);
        
        return generateSignal(symbol, indicators);
    } catch (error) {
        console.error('Ошибка анализа:', error);
        return getDefaultAnalysis(symbol);
    }
}

async function getPriceData(symbol) {
    // Получаем данные с Binance API
    const response = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`);
    const data = await response.json();
    
    // Имитация исторических данных для демо
    const currentPrice = parseFloat(data.lastPrice);
    const priceChange = parseFloat(data.priceChangePercent);
    const volume = parseFloat(data.volume);
    
    return {
        symbol,
        currentPrice,
        priceChange,
        volume,
        high: parseFloat(data.highPrice),
        low: parseFloat(data.lowPrice),
        open: parseFloat(data.openPrice)
    };
}

function calculateIndicators(priceData) {
    // Упрощенные расчеты индикаторов
    const rsi = calculateRSI(priceData);
    const trend = determineTrend(priceData);
    
    return {
        rsi,
        priceChange: priceData.priceChange,
        volume: priceData.volume,
        currentPrice: priceData.currentPrice,
        trend,
        volatility: Math.abs(priceData.priceChange)
    };
}

function calculateRSI(priceData) {
    // Упрощенный RSI для демо
    const baseRsi = 50 + (Math.random() * 20 - 10); // 40-60
    return Math.min(100, Math.max(0, baseRsi + priceData.priceChange * 0.5));
}

function determineTrend(priceData) {
    if (priceData.priceChange > 2) return 'STRONG_BULL';
    if (priceData.priceChange > 0) return 'BULL';
    if (priceData.priceChange < -2) return 'STRONG_BEAR';
    if (priceData.priceChange < 0) return 'BEAR';
    return 'NEUTRAL';
}

function generateSignal(symbol, indicators) {
    const signals = [];
    const reasons = [];
    
    // Анализ RSI
    if (indicators.rsi < 30) {
        signals.push('BUY');
        reasons.push(`RSI (${indicators.rsi.toFixed(1)}) показывает перепроданность - хорошая точка для входа`);
    } else if (indicators.rsi > 70) {
        signals.push('SELL');
        reasons.push(`RSI (${indicators.rsi.toFixed(1)}) показывает перекупленность - возможна коррекция`);
    }
    
    // Анализ тренда
    if (indicators.trend === 'STRONG_BULL') {
        signals.push('BUY');
        reasons.push(`Сильный бычий тренд (+${indicators.priceChange.toFixed(2)}%) - движение вверх`);
    } else if (indicators.trend === 'STRONG_BEAR') {
        signals.push('SELL');
        reasons.push(`Сильный медвежий тренд (${indicators.priceChange.toFixed(2)}%) - давление продавцов`);
    }
    
    // Анализ волатильности
    if (indicators.volatility > 5) {
        reasons.push(`Высокая волатильность (${indicators.volatility.toFixed(2)}%) - осторожность с позициями`);
    }
    
    // Определяем итоговый сигнал
    const buyCount = signals.filter(s => s === 'BUY').length;
    const sellCount = signals.filter(s => s === 'SELL').length;
    
    let finalSignal = 'HOLD';
    let confidence = 0;
    
    if (buyCount > sellCount) {
        finalSignal = 'BUY';
        confidence = (buyCount / (buyCount + sellCount)) * 100;
    } else if (sellCount > buyCount) {
        finalSignal = 'SELL';
        confidence = (sellCount / (buyCount + sellCount)) * 100;
    }
    
    const shouldTrade = confidence > 40 && finalSignal !== 'HOLD';
    
    return {
        symbol,
        shouldTrade,
        signal: finalSignal,
        confidence: Math.round(confidence),
        price: indicators.currentPrice,
        reasons,
        indicators,
        targets: calculateTargets(indicators.currentPrice, finalSignal),
        timestamp: new Date()
    };
}

function calculateTargets(currentPrice, signal) {
    if (signal === 'BUY') {
        return {
            takeProfit: (currentPrice * 1.03).toFixed(2), // +3%
            stopLoss: (currentPrice * 0.97).toFixed(2)    // -3%
        };
    } else if (signal === 'SELL') {
        return {
            takeProfit: (currentPrice * 0.97).toFixed(2), // -3%
            stopLoss: (currentPrice * 1.03).toFixed(2)    // +3%
        };
    }
    
    return { takeProfit: 0, stopLoss: 0 };
}

function getDefaultAnalysis(symbol) {
    return {
        symbol,
        shouldTrade: false,
        signal: 'HOLD',
        confidence: 0,
        price: 0,
        reasons: ['Ошибка получения данных'],
        indicators: {},
        targets: { takeProfit: 0, stopLoss: 0 },
        timestamp: new Date()
    };
}
