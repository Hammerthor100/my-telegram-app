// 🌌 GALACTIC ENGINE - Все-в-одном: данные, игра, экономика
class GalacticEngine {
    constructor() {
        this.init();
    }

    init() {
        // Инициализация всех систем
        this.initData();
        this.initGameSystems();
        this.initStorage();
        console.log('🚀 Galactic Engine запущен!');
    }

    // ========== СИСТЕМА ДАННЫХ ==========

    initData() {
        // Основные данные
        this.cryptoList = [];
        this.cryptoData = this.cryptoList;
        
        // Портфель и торговля
        this.portfolio = [];
        this.trades = [];
        this.virtualBalance = 10000;
        
        // Игровые системы
        this.achievements = {};
        this.lessonsProgress = {};
        this.quests = {};
        this.userStats = {
            credits: 10000,
            rank: '🌍 Новичок',
            experience: 0,
            level: 1,
            totalTrades: 0,
            totalProfit: 0,
            tradingDays: 1
        };

        // Космические активы
        this.availableAssets = [
            { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin', icon: '🪐', color: '#FF9900' },
            { id: 'ethereum', symbol: 'ETH', name: 'Ethereum', icon: '🚀', color: '#627EEA' },
            { id: 'solana', symbol: 'SOL', name: 'Solana', icon: '⭐', color: '#00FFA3' },
            { id: 'binancecoin', symbol: 'BNB', name: 'Binance Coin', icon: '🌌', color: '#F3BA2F' },
            { id: 'ripple', symbol: 'XRP', name: 'Ripple', icon: '⚡', color: '#23292F' },
            { id: 'cardano', symbol: 'ADA', name: 'Cardano', icon: '🔷', color: '#0033AD' },
            { id: 'dogecoin', symbol: 'DOGE', name: 'Dogecoin', icon: '🐕', color: '#C2A633' },
            { id: 'polkadot', symbol: 'DOT', name: 'Polkadot', icon: '🔴', color: '#E6007A' },
            { id: 'litecoin', symbol: 'LTC', name: 'Litecoin', icon: '🔶', color: '#BFBBBB' },
            { id: 'chainlink', symbol: 'LINK', name: 'Chainlink', icon: '🔗', color: '#2A5ADA' }
        ];

        // Система рангов
        this.ranks = [
            { name: '🌍 Новичок', minExp: 0, color: '#8B9CB0', bonus: 1.0 },
            { name: '🛰️ Офицер орбиты', minExp: 1000, color: '#00D4FF', bonus: 1.1 },
            { name: '🚀 Капитан фрегата', minExp: 5000, color: '#6A00FF', bonus: 1.2 },
            { name: '🛸 Командор крейсера', minExp: 15000, color: '#FF00C7', bonus: 1.3 },
            { name: '🌌 Адмирал галактики', minExp: 50000, color: '#FFD700', bonus: 1.5 },
            { name: '⭐ Легенда вселенной', minExp: 100000, color: '#FFFFFF', bonus: 2.0 }
        ];

        // Достижения
        this.achievementList = {
            first_trade: { name: '🚀 Первый запуск', desc: 'Выполните первую сделку', reward: 100 },
            first_profit: { name: '💎 Первая прибыль', desc: 'Заработайте первую прибыль', reward: 200 },
            active_trader: { name: '⚡ Активный трейдер', desc: '10 сделок', reward: 300 },
            portfolio_diversifier: { name: '🌌 Диверсификатор', desc: '5 активов в портфеле', reward: 400 },
            market_wizard: { name: '🔮 Мастер рынка', desc: '100,000 GC капитал', reward: 500 },
            quantum_trader: { name: '⚛️ Квантовый трейдер', desc: '50 сделок', reward: 750 }
        };
    }

    initStorage() {
        // Загрузка данных из localStorage
        this.loadAllData();
        
        // Авто-сохранение каждые 30 секунд
        setInterval(() => this.saveAllData(), 30000);
    }

    loadAllData() {
        try {
            this.portfolio = JSON.parse(localStorage.getItem('galactic_portfolio')) || [];
            this.trades = JSON.parse(localStorage.getItem('galactic_trades')) || [];
            this.achievements = JSON.parse(localStorage.getItem('galactic_achievements')) || {};
            this.lessonsProgress = JSON.parse(localStorage.getItem('galactic_lessons')) || {};
            this.quests = JSON.parse(localStorage.getItem('galactic_quests')) || {};
            
            const savedStats = JSON.parse(localStorage.getItem('galactic_user_stats'));
            if (savedStats) {
                this.userStats = { ...this.userStats, ...savedStats };
            }
        } catch (error) {
            console.warn('Ошибка загрузки данных:', error);
        }
    }

    saveAllData() {
        try {
            localStorage.setItem('galactic_portfolio', JSON.stringify(this.portfolio));
            localStorage.setItem('galactic_trades', JSON.stringify(this.trades));
            localStorage.setItem('galactic_achievements', JSON.stringify(this.achievements));
            localStorage.setItem('galactic_lessons', JSON.stringify(this.lessonsProgress));
            localStorage.setItem('galactic_quests', JSON.stringify(this.quests));
            localStorage.setItem('galactic_user_stats', JSON.stringify(this.userStats));
        } catch (error) {
            console.warn('Ошибка сохранения данных:', error);
        }
    }

    // ========== API И ДАННЫЕ РЫНКА ==========

    async fetchCryptoData() {
        try {
            const ids = this.availableAssets.map(asset => asset.id).join(',');
            const response = await fetch(
                `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ids}&order=market_cap_desc&per_page=10&page=1&sparkline=false&price_change_percentage=24h`
            );
            
            if (!response.ok) throw new Error('API недоступен');
            
            const data = await response.json();
            this.cryptoList = data;
            this.cryptoData = data;
            
            // Обновляем цены в портфеле
            this.updatePortfolioPrices();
            
            return data;
        } catch (error) {
            console.warn('Используем демо-данные:', error);
            return this.generateDemoData();
        }
    }

    generateDemoData() {
        const now = Date.now();
        const demoData = this.availableAssets.map((asset, index) => {
            const basePrice = 100 + (index * 50);
            const volatility = Math.sin(now * 0.001 + index) * 0.1;
            const price = basePrice * (1 + volatility);
            const change = (Math.random() - 0.5) * 20;
            
            return {
                id: asset.id,
                symbol: asset.symbol,
                name: asset.name,
                current_price: price,
                price_change_percentage_24h: change,
                market_cap: 1000000000 + (index * 500000000),
                total_volume: 100000000 + (index * 50000000),
                last_updated: new Date().toISOString()
            };
        });
        
        this.cryptoList = demoData;
        this.cryptoData = demoData;
        return demoData;
    }

    updatePortfolioPrices() {
        this.portfolio.forEach(item => {
            const currentAsset = this.cryptoList.find(a => a.id === item.cryptoId);
            if (currentAsset) {
                item.currentPrice = currentAsset.current_price;
            }
        });
    }

    // ========== ТОРГОВАЯ СИСТЕМА ==========

    executeTrade(type, cryptoId, amount) {
        return this.executeQuantumTrade(type, cryptoId, amount);
    }

    executeQuantumTrade(type, assetId, amount) {
        const asset = this.cryptoList.find(a => a.id === assetId);
        if (!asset) return { success: false, message: '🪐 Актив не найден в галактике!' };

        const totalCost = amount * asset.current_price;
        const currentRank = this.getCurrentRank();

        if (type === 'buy') {
            if (totalCost > this.userStats.credits) {
                return { success: false, message: '❌ Недостаточно галактических кредитов!' };
            }
            this.userStats.credits -= totalCost;
        } else {
            const portfolioItem = this.portfolio.find(item => item.cryptoId === assetId);
            if (!portfolioItem || portfolioItem.amount < amount) {
                return { success: false, message: '❌ Недостаточно активов для продажи!' };
            }
            this.userStats.credits += totalCost;
        }

        // Создаем сделку
        const trade = {
            id: Date.now(),
            type,
            assetId,
            symbol: asset.symbol,
            name: asset.name,
            amount: parseFloat(amount),
            price: asset.current_price,
            total: totalCost,
            timestamp: new Date().toISOString(),
            rank: currentRank.name
        };

        this.trades.unshift(trade);
        this.userStats.totalTrades++;

        // Обновляем портфель
        this.updatePortfolio(type, assetId, amount, asset.current_price);
        
        // Игровая механика
        const experienceReward = this.calculateTradeReward(trade);
        this.addExperience(experienceReward);
        
        const newAchievements = this.checkAchievements();
        const dailyQuestProgress = this.updateDailyQuests(trade);

        this.saveAllData();

        return { 
            success: true, 
            message: `✅ ${type === 'buy' ? 'Покупка' : 'Продажа'} ${asset.symbol} завершена!`,
            trade,
            experience: experienceReward,
            achievements: newAchievements,
            questProgress: dailyQuestProgress
        };
    }

    updatePortfolio(type, assetId, amount, price) {
        let portfolioItem = this.portfolio.find(item => item.cryptoId === assetId);

        if (type === 'buy') {
            if (portfolioItem) {
                // Пересчет средней цены
                const totalAmount = portfolioItem.amount + amount;
                const totalValue = (portfolioItem.amount * portfolioItem.buyPrice) + (amount * price);
                portfolioItem.buyPrice = totalValue / totalAmount;
                portfolioItem.amount = totalAmount;
                portfolioItem.lastUpdated = Date.now();
            } else {
                portfolioItem = {
                    id: Date.now(),
                    cryptoId: assetId,
                    symbol: this.availableAssets.find(a => a.id === assetId)?.symbol,
                    name: this.availableAssets.find(a => a.id === assetId)?.name,
                    amount: parseFloat(amount),
                    buyPrice: parseFloat(price),
                    currentPrice: parseFloat(price),
                    timestamp: Date.now(),
                    lastUpdated: Date.now()
                };
                this.portfolio.push(portfolioItem);
            }
        } else {
            if (portfolioItem) {
                portfolioItem.amount -= amount;
                portfolioItem.lastUpdated = Date.now();
                if (portfolioItem.amount <= 0) {
                    this.portfolio = this.portfolio.filter(item => item.cryptoId !== assetId);
                }
            }
        }
    }

    // ========== ИГРОВАЯ СИСТЕМА ==========

    initGameSystems() {
        this.generateDailyQuests();
        this.updateRank();
    }

    calculateTradeReward(trade) {
        const baseReward = 25;
        const amountBonus = Math.min(trade.amount * 0.5, 100);
        const profitBonus = trade.type === 'buy' ? 0 : trade.total * 0.02;
        const rankBonus = this.getCurrentRank().bonus;
        
        return Math.round((baseReward + amountBonus + profitBonus) * rankBonus);
    }

    addExperience(amount, source = 'Торговля') {
        const oldRank = this.userStats.rank;
        this.userStats.experience += amount;
        
        const newRank = this.updateRank();
        
        if (oldRank !== newRank.name) {
            return {
                rankUp: true,
                oldRank,
                newRank: newRank.name,
                experience: amount,
                source
            };
        }
        
        return {
            rankUp: false,
            experience: amount,
            source
        };
    }

    updateRank() {
        const currentExp = this.userStats.experience;
        let newRank = this.ranks[0];
        
        for (let i = this.ranks.length - 1; i >= 0; i--) {
            if (currentExp >= this.ranks[i].minExp) {
                newRank = this.ranks[i];
                break;
            }
        }
        
        this.userStats.rank = newRank.name;
        this.userStats.level = Math.floor(currentExp / 1000) + 1;
        
        return newRank;
    }

    getCurrentRank() {
        return this.ranks.find(rank => rank.name === this.userStats.rank) || this.ranks[0];
    }

    getRankProgress() {
        const currentExp = this.userStats.experience;
        const currentRank = this.getCurrentRank();
        const currentRankIndex = this.ranks.findIndex(rank => rank.name === currentRank.name);
        
        if (currentRankIndex >= this.ranks.length - 1) {
            return { current: currentRank, progress: 100, next: null };
        }
        
        const nextRank = this.ranks[currentRankIndex + 1];
        const progress = ((currentExp - currentRank.minExp) / (nextRank.minExp - currentRank.minExp)) * 100;
        
        return {
            current: currentRank,
            progress: Math.min(100, Math.max(0, progress)),
            next: nextRank
        };
    }

    // ========== СИСТЕМА ДОСТИЖЕНИЙ ==========

    checkAchievements() {
        const stats = this.getUserStats();
        const newAchievements = [];

        // Проверяем все достижения
        Object.keys(this.achievementList).forEach(achievementId => {
            if (!this.achievements[achievementId]) {
                const achieved = this.checkAchievementCondition(achievementId, stats);
                if (achieved) {
                    this.achievements[achievementId] = {
                        ...this.achievementList[achievementId],
                        unlocked: new Date().toISOString()
                    };
                    newAchievements.push(this.achievements[achievementId]);
                    
                    // Награда за достижение
                    this.userStats.credits += this.achievementList[achievementId].reward;
                    this.addExperience(this.achievementList[achievementId].reward * 2, 'Достижение');
                }
            }
        });

        return newAchievements;
    }

    checkAchievementCondition(achievementId, stats) {
        switch(achievementId) {
            case 'first_trade':
                return stats.totalTrades >= 1;
            case 'first_profit':
                return stats.totalProfit > 0;
            case 'active_trader':
                return stats.totalTrades >= 10;
            case 'portfolio_diversifier':
                return this.portfolio.length >= 5;
            case 'market_wizard':
                return stats.totalValue >= 100000;
            case 'quantum_trader':
                return stats.totalTrades >= 50;
            default:
                return false;
        }
    }

    // ========== СИСТЕМА КВЕСТОВ ==========

    generateDailyQuests() {
        const today = new Date().toDateString();
        
        if (!this.quests.lastGenerated || this.quests.lastGenerated !== today) {
            this.quests.daily = [
                {
                    id: 'trade_3_times',
                    title: '📈 Торговый день',
                    description: 'Выполните 3 сделки за сегодня',
                    reward: 150,
                    progress: 0,
                    target: 3,
                    type: 'trades'
                },
                {
                    id: 'earn_500_profit',
                    title: '💎 Заработок',
                    description: 'Заработайте 500 GC прибыли',
                    reward: 200,
                    progress: 0,
                    target: 500,
                    type: 'profit'
                },
                {
                    id: 'diversify_portfolio',
                    title: '🌌 Диверсификация',
                    description: 'Владейте 3 разными активами',
                    reward: 180,
                    progress: this.portfolio.length,
                    target: 3,
                    type: 'assets'
                }
            ];
            this.quests.lastGenerated = today;
            this.quests.completed = [];
        }
    }

    updateDailyQuests(trade) {
        if (!this.quests.daily) return [];

        const completedQuests = [];

        this.quests.daily.forEach(quest => {
            switch(quest.type) {
                case 'trades':
                    quest.progress += 1;
                    break;
                case 'profit':
                    if (trade.type === 'sell') {
                        const portfolioItem = this.portfolio.find(item => item.cryptoId === trade.assetId);
                        if (portfolioItem) {
                            const profit = (trade.price - portfolioItem.buyPrice) * trade.amount;
                            quest.progress += Math.max(0, profit);
                        }
                    }
                    break;
                case 'assets':
                    quest.progress = this.portfolio.length;
                    break;
            }

            if (quest.progress >= quest.target && !this.quests.completed.includes(quest.id)) {
                // Награда за квест
                this.userStats.credits += quest.reward;
                this.addExperience(quest.reward, 'Квест');
                this.quests.completed.push(quest.id);
                completedQuests.push(quest);
            }
        });

        return completedQuests;
    }

    // ========== ПОРТФЕЛЬ И СТАТИСТИКА ==========

    calculatePortfolioValue() {
        let totalValue = this.userStats.credits;
        let totalCost = 0;
        let totalProfit = 0;
        let dailyProfit = 0;

        this.portfolio.forEach(item => {
            const asset = this.cryptoList.find(a => a.id === item.cryptoId);
            if (asset) {
                const currentValue = item.amount * asset.current_price;
                const costValue = item.amount * item.buyPrice;
                const assetProfit = currentValue - costValue;
                
                totalValue += currentValue;
                totalCost += costValue;
                totalProfit += assetProfit;
                dailyProfit += currentValue * (asset.price_change_percentage_24h / 100);
            }
        });

        // Обновляем общую статистику
        this.userStats.totalProfit = totalProfit;

        return {
            totalValue,
            totalCost,
            totalProfit,
            dailyProfit,
            profitPercentage: totalCost > 0 ? (totalProfit / totalCost) * 100 : 0,
            assetCount: this.portfolio.length
        };
    }

    getPortfolioDistribution() {
        const distribution = {};
        const totalValue = this.calculatePortfolioValue().totalValue;
        
        this.portfolio.forEach(item => {
            const asset = this.cryptoList.find(a => a.id === item.cryptoId);
            if (asset) {
                const value = item.amount * asset.current_price;
                const percentage = (value / totalValue) * 100;
                distribution[item.symbol] = {
                    percentage,
                    value,
                    amount: item.amount,
                    asset: this.availableAssets.find(a => a.id === item.cryptoId)
                };
            }
        });

        return distribution;
    }

    // ========== УТИЛИТЫ И ГЕТТЕРЫ ==========

    getUserStats() {
        const portfolioStats = this.calculatePortfolioValue();
        const rankProgress = this.getRankProgress();
        
        return {
            ...this.userStats,
            ...portfolioStats,
            rankProgress,
            achievementsCount: Object.keys(this.achievements).length,
            dailyQuests: this.quests.daily || [],
            completedQuests: this.quests.completed || []
        };
    }

    getAssetById(assetId) {
        return this.cryptoList.find(asset => asset.id === assetId);
    }

    getAvailableAssets() {
        return this.availableAssets;
    }

    getTradeHistory(limit = 10) {
        return this.trades.slice(0, limit);
    }

    getPortfolio() {
        return this.portfolio;
    }

    getAchievements() {
        return this.achievements;
    }

    // Совместимость с твоим кодом
    addToPortfolio(cryptoId, amount, buyPrice) {
        return this.executeQuantumTrade('buy', cryptoId, amount);
    }

    getLessonProgress(lessonId) {
        return this.lessonsProgress[lessonId] || 0;
    }

    updateLessonProgress(lessonId, progress) {
        this.lessonsProgress[lessonId] = progress;
    }

    formatCurrency(value) {
        if (value >= 1e12) return '$' + (value / 1e12).toFixed(2) + 'T';
        if (value >= 1e9) return '$' + (value / 1e9).toFixed(2) + 'B';
        if (value >= 1e6) return '$' + (value / 1e6).toFixed(2) + 'M';
        return '$' + value.toFixed(2);
    }

    calculateMarketStats(cryptoData) {
        const totalMarketCap = cryptoData.reduce((sum, crypto) => sum + crypto.market_cap, 0);
        const totalVolume = cryptoData.reduce((sum, crypto) => sum + crypto.total_volume, 0);
        
        return {
            marketCap: this.formatCurrency(totalMarketCap),
            volume: this.formatCurrency(totalVolume)
        };
    }
}

// Создаем глобальный экземпляр
const galacticEngine = new GalacticEngine();

// Алиасы для совместимости
const cryptoData = galacticEngine;
const galacticData = galacticEngine;
const gameEngine = galacticEngine;
