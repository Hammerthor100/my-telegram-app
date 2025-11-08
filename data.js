// CryptoSphere Data & API
class CryptoData {
    constructor() {
        this.cryptoList = [];
        this.portfolio = JSON.parse(localStorage.getItem('cryptosphere_portfolio')) || [];
        this.trades = JSON.parse(localStorage.getItem('cryptosphere_trades')) || [];
        this.virtualBalance = 10000;
        this.lessonsProgress = JSON.parse(localStorage.getItem('cryptosphere_lessons')) || {};
    }

    // Получение данных о криптовалютах
    async fetchCryptoData() {
        try {
            const response = await fetch(
                'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=false&price_change_percentage=24h'
            );
            const data = await response.json();
            this.cryptoList = data;
            return data;
        } catch (error) {
            console.error('Ошибка загрузки данных:', error);
            return this.getFallbackData();
        }
    }

    // Резервные данные на случай ошибки API
    getFallbackData() {
        return [
            {
                id: 'bitcoin',
                symbol: 'btc',
                name: 'Bitcoin',
                current_price: 45000,
                price_change_percentage_24h: 2.5,
                market_cap: 880000000000,
                total_volume: 25000000000
            },
            {
                id: 'ethereum',
                symbol: 'eth',
                name: 'Ethereum',
                current_price: 3000,
                price_change_percentage_24h: -1.2,
                market_cap: 360000000000,
                total_volume: 15000000000
            }
        ];
    }

    // Расчет общей рыночной статистики
    calculateMarketStats(cryptoData) {
        const totalMarketCap = cryptoData.reduce((sum, crypto) => sum + crypto.market_cap, 0);
        const totalVolume = cryptoData.reduce((sum, crypto) => sum + crypto.total_volume, 0);
        
        return {
            marketCap: this.formatCurrency(totalMarketCap),
            volume: this.formatCurrency(totalVolume)
        };
    }

    // Форматирование валюты
    formatCurrency(value) {
        if (value >= 1e12) {
            return '$' + (value / 1e12).toFixed(2) + 'T';
        } else if (value >= 1e9) {
            return '$' + (value / 1e9).toFixed(2) + 'B';
        } else if (value >= 1e6) {
            return '$' + (value / 1e6).toFixed(2) + 'M';
        } else {
            return '$' + value.toFixed(2);
        }
    }

    // Портфель
    addToPortfolio(cryptoId, amount, buyPrice) {
        const crypto = this.cryptoList.find(c => c.id === cryptoId);
        if (!crypto) return false;

        const portfolioItem = {
            id: Date.now(),
            cryptoId,
            symbol: crypto.symbol,
            name: crypto.name,
            amount: parseFloat(amount),
            buyPrice: parseFloat(buyPrice),
            currentPrice: crypto.current_price,
            timestamp: Date.now()
        };

        this.portfolio.push(portfolioItem);
        this.savePortfolio();
        return true;
    }

    removeFromPortfolio(itemId) {
        this.portfolio = this.portfolio.filter(item => item.id !== itemId);
        this.savePortfolio();
    }

    calculatePortfolioValue() {
        let totalValue = 0;
        let totalProfit = 0;

        this.portfolio.forEach(item => {
            const currentCrypto = this.cryptoList.find(c => c.id === item.cryptoId);
            if (currentCrypto) {
                const currentValue = item.amount * currentCrypto.current_price;
                const buyValue = item.amount * item.buyPrice;
                totalValue += currentValue;
                totalProfit += (currentValue - buyValue);
            }
        });

        return {
            totalValue,
            totalProfit,
            profitPercentage: totalValue > 0 ? (totalProfit / totalValue) * 100 : 0
        };
    }

    savePortfolio() {
        localStorage.setItem('cryptosphere_portfolio', JSON.stringify(this.portfolio));
    }

    // Торговый симулятор
    executeTrade(type, cryptoId, amount) {
        const crypto = this.cryptoList.find(c => c.id === cryptoId);
        if (!crypto) return false;

        const totalCost = amount * crypto.current_price;

        if (type === 'buy' && totalCost > this.virtualBalance) {
            return false; // Недостаточно средств
        }

        const trade = {
            id: Date.now(),
            type,
            cryptoId,
            symbol: crypto.symbol,
            name: crypto.name,
            amount,
            price: crypto.current_price,
            total: totalCost,
            timestamp: Date.now()
        };

        if (type === 'buy') {
            this.virtualBalance -= totalCost;
        } else {
            this.virtualBalance += totalCost;
        }

        this.trades.push(trade);
        this.saveTrades();
        return true;
    }

    getTradeHistory() {
        return this.trades.slice(-10).reverse(); // Последние 10 сделок
    }

    saveTrades() {
        localStorage.setItem('cryptosphere_trades', JSON.stringify(this.trades));
    }

    // Обучение
    updateLessonProgress(lessonId, progress) {
        this.lessonsProgress[lessonId] = progress;
        localStorage.setItem('cryptosphere_lessons', JSON.stringify(this.lessonsProgress));
    }

    getLessonProgress(lessonId) {
        return this.lessonsProgress[lessonId] || 0;
    }
}

// Создаем глобальный экземпляр
const cryptoData = new CryptoData();