// 🌌 GALAXY TRADER - Unified Data Manager
class GalacticDataManager {
    constructor() {
        // Совместимость с твоим кодом
        this.cryptoList = [];
        this.portfolio = JSON.parse(localStorage.getItem('cryptosphere_portfolio')) || [];
        this.trades = JSON.parse(localStorage.getItem('cryptosphere_trades')) || [];
        this.virtualBalance = 10000;
        this.lessonsProgress = JSON.parse(localStorage.getItem('cryptosphere_lessons')) || {};
        
        // Новые поля для космической версии
        this.cryptoData = this.cryptoList; // Алиас для совместимости
        this.achievements = JSON.parse(localStorage.getItem('galactic_achievements')) || {};
        this.userData = JSON.parse(localStorage.getItem('galactic_user')) || {
            credits: 10000,
            rank: '🌍 Новичок',
            experience: 0
        };
        
        this.availableAssets = [
            { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin', icon: '🪐' },
            { id: 'ethereum', symbol: 'ETH', name: 'Ethereum', icon: '🚀' },
            { id: 'solana', symbol: 'SOL', name: 'Solana', icon: '⭐' },
            { id: 'binancecoin', symbol: 'BNB', name: 'Binance Coin', icon: '🌌' },
            { id: 'ripple', symbol: 'XRP', name: 'Ripple', icon: '⚡' },
            { id: 'cardano', symbol: 'ADA', name: 'Cardano', icon: '🔷' },
            { id: 'dogecoin', symbol: 'DOGE', name: 'Dogecoin', icon: '🐕' },
            { id: 'polkadot', symbol: 'DOT', name: 'Polkadot', icon: '🔴' },
            { id: 'litecoin', symbol: 'LTC', name: 'Litecoin', icon: '🔶' },
            { id: 'chainlink', symbol: 'LINK', name: 'Chainlink', icon: '🔗' }
        ];
    }

    // ========== МЕТОДЫ ИЗ ТВОЕГО CRYPTODATA ==========

    // Получение данных о криптовалютах
    async fetchCryptoData() {
        try {
            const response = await fetch(
                'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=false&price_change_percentage=24h'
            );
            const data = await response.json();
            this.cryptoList = data;
            this.cryptoData = data; // Синхронизация
            return data;
        } catch (error) {
            console.error('Ошибка загрузки данных:', error);
            return this.getFallbackData();
        }
    }

    // Алиас для совместимости
    async fetchGalacticMarketData() {
        return await this.fetchCryptoData();
    }

    // Резервные данные на случай ошибки API
    getFallbackData() {
        const fallbackData = [
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
        
        this.cryptoList = fallbackData;
        this.cryptoData = fallbackData;
        return fallbackData;
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

    // Портфель (совместимость с твоим кодом)
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

    // Торговый симулятор (совместимость)
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

    // ========== НОВЫЕ МЕТОДЫ ДЛЯ КОСМИЧЕСКОЙ ВЕРСИИ ==========

    // Торговые операции с улучшенной логикой
    executeQuantumTrade(type, assetId, amount) {
        const asset = this.cryptoList.find(a => a.id === assetId);
        if (!asset) return { success: false, message: 'Актив не найден' };

        const totalCost = amount * asset.current_price;

        if (type === 'buy') {
            if (totalCost > this.userData.credits) {
                return { success: false, message: 'Недостаточно галактических кредитов' };
            }
            this.userData.credits -= totalCost;
        } else {
            // Проверяем, есть ли актив в портфеле
            const portfolioItem = this.portfolio.find(item => item.cryptoId === assetId);
            if (!portfolioItem || portfolioItem.amount < amount) {
                return { success: false, message: 'Недостаточно активов для продажи' };
            }
            this.userData.credits += totalCost;
        }

        // Обновляем портфель
        this.updatePortfolio(type, assetId, amount, asset.current_price);
        
        // Записываем сделку
        const trade = {
            id: Date.now(),
            type,
            assetId,
            symbol: asset.symbol,
            amount,
            price: asset.current_price,
            total: totalCost,
            timestamp: new Date().toISOString()
        };
        
        this.trades.unshift(trade);
        this.saveToStorage('galactic_trades', this.trades);
        this.saveToStorage('galactic_user', this.userData);

        // Проверяем достижения
        this.checkAchievements();

        return { 
            success: true, 
            message: `Квантовая сделка ${type === 'buy' ? 'покупки' : 'продажи'} выполнена!`,
            trade 
        };
    }

    // Обновление портфеля (улучшенная версия)
    updatePortfolio(type, assetId, amount, price) {
        let portfolioItem = this.portfolio.find(item => item.cryptoId === assetId);

        if (type === 'buy') {
            if (portfolioItem) {
                // Пересчитываем среднюю цену
                const totalAmount = portfolioItem.amount + amount;
                const totalValue = (portfolioItem.amount * portfolioItem.buyPrice) + (amount * price);
                portfolioItem.buyPrice = totalValue / totalAmount;
                portfolioItem.amount = totalAmount;
            } else {
                portfolioItem = {
                    id: Date.now(),
                    cryptoId: assetId,
                    symbol: this.availableAssets.find(a => a.id === assetId)?.symbol,
                    name: this.availableAssets.find(a => a.id === assetId)?.name,
                    amount: amount,
                    buyPrice: price,
                    timestamp: Date.now()
                };
                this.portfolio.push(portfolioItem);
            }
        } else {
            // Продажа
            if (portfolioItem) {
                portfolioItem.amount -= amount;
                if (portfolioItem.amount <= 0) {
                    this.portfolio = this.portfolio.filter(item => item.cryptoId !== assetId);
                }
            }
        }

        this.savePortfolio();
    }

    // Расчет статистики портфеля (улучшенная версия)
    calculatePortfolioStats() {
        let totalValue = 0;
        let totalCost = 0;
        let dailyProfit = 0;

        this.portfolio.forEach(item => {
            const asset = this.cryptoList.find(a => a.id === item.cryptoId);
            if (asset) {
                const currentValue = item.amount * asset.current_price;
                const costValue = item.amount * item.buyPrice;
                
                totalValue += currentValue;
                totalCost += costValue;
                dailyProfit += currentValue * (asset.price_change_percentage_24h / 100);
            }
        });

        const totalProfit = totalValue - totalCost;
        const profitPercentage = totalCost > 0 ? (totalProfit / totalCost) * 100 : 0;

        return {
            totalValue: totalValue + this.userData.credits,
            invested: totalCost,
            totalProfit,
            profitPercentage,
            dailyProfit,
            assetCount: this.portfolio.length
        };
    }

    // Система достижений
    checkAchievements() {
        const stats = this.calculatePortfolioStats();
        const newAchievements = {};

        // Первая сделка
        if (this.trades.length >= 1 && !this.achievements.first_trade) {
            newAchievements.first_trade = {
                name: '🚀 Первый запуск',
                description: 'Выполнена первая космическая сделка',
                unlocked: new Date().toISOString()
            };
        }

        // Первая прибыль
        if (stats.totalProfit > 0 && !this.achievements.first_profit) {
            newAchievements.first_profit = {
                name: '💎 Первая прибыль',
                description: 'Заработана первая космическая прибыль',
                unlocked: new Date().toISOString()
            };
        }

        // Активный трейдер
        if (this.trades.length >= 10 && !this.achievements.active_trader) {
            newAchievements.active_trader = {
                name: '⚡ Активный трейдер',
                description: 'Выполнено 10 космических сделок',
                unlocked: new Date().toISOString()
            };
        }

        // Обновляем достижения
        if (Object.keys(newAchievements).length > 0) {
            this.achievements = { ...this.achievements, ...newAchievements };
            this.saveToStorage('galactic_achievements', this.achievements);
            
            return newAchievements;
        }

        return null;
    }

    // ========== УТИЛИТЫ ==========

    // Универсальное сохранение
    saveToStorage(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (error) {
            console.warn('Ошибка сохранения в localStorage:', error);
        }
    }

    loadFromStorage(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.warn('Ошибка загрузки из localStorage:', error);
            return null;
        }
    }

    // Получение данных для отображения
    getAssetById(assetId) {
        return this.cryptoList.find(asset => asset.id === assetId);
    }

    getAvailableAssets() {
        return this.availableAssets;
    }

    getUserData() {
        return this.userData;
    }

    getRecentTrades(limit = 5) {
        return this.trades.slice(0, limit);
    }

    // Совместимость с разными ID
    get cryptoData() {
        return this.cryptoList;
    }

    set cryptoData(value) {
        this.cryptoList = value;
    }

    // Алиасы для совместимости
    get portfolio() {
        return this.loadFromStorage('cryptosphere_portfolio') || [];
    }

    set portfolio(value) {
        this.saveToStorage('cryptosphere_portfolio', value);
    }

    get trades() {
        return this.loadFromStorage('cryptosphere_trades') || [];
    }

    set trades(value) {
        this.saveToStorage('cryptosphere_trades', value);
    }
}

// Создаем глобальный экземпляр для совместимости
const galacticData = new GalacticDataManager();
const cryptoData = galacticData; // Алиас для твоего кода
