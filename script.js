// 🌌 GALAXY TRADER + CRYPTOSPHERE - Объединенная версия
class GalaxyTraderApp {
    constructor() {
        this.currentTab = 'bridge';
        this.selectedAsset = null;
        this.init();
    }

    async init() {
        // Инициализация Telegram Mini App
        Telegram.WebApp.ready();
        Telegram.WebApp.expand();
        
        // Настройка приложения
        this.setupNavigation();
        this.setupEventListeners();
        this.setupModals();
        
        // Загрузка данных
        await this.loadGalacticData();
        
        // Обновление интерфейса
        this.updateUI();
        
        // Запуск авто-обновления
        this.startAutoRefresh();
        
        console.log('🚀 Galaxy Trader запущен!');
    }

    // ========== ОСНОВНЫЕ ФУНКЦИИ ИЗ ТВОЕГО КОДА ==========

    // Загрузка данных о криптовалютах
    async loadCryptoData() {
        const data = await galacticData.fetchGalacticMarketData();
        this.renderCryptoList(data);
        this.updateMarketStats(data);
        this.updatePortfolioDisplay();
        this.updateTradeModalOptions();
        return data;
    }

    // Загрузка космических данных (алиас для совместимости)
    async loadGalacticData() {
        return await this.loadCryptoData();
    }

    // Рендер списка криптовалют
    renderCryptoList(cryptoList) {
        const grid = document.getElementById('cryptoGrid') || document.getElementById('assetsGrid');
        
        if (!cryptoList || cryptoList.length === 0) {
            if (grid) grid.innerHTML = '<div class="loading">Ошибка загрузки данных</div>';
            return;
        }

        const html = cryptoList.map(crypto => `
            <div class="crypto-card asset-card quantum-pulse" onclick="app.showCryptoDetails('${crypto.id}')">
                <div class="crypto-info asset-info">
                    <div class="crypto-icon asset-icon">${crypto.symbol.toUpperCase().charAt(0)}</div>
                    <div class="crypto-details asset-details">
                        <h3>${crypto.name}</h3>
                        <span class="crypto-symbol symbol">${crypto.symbol.toUpperCase()}</span>
                    </div>
                </div>
                <div class="crypto-price asset-price">
                    <div class="price">$${crypto.current_price.toLocaleString('en-US', {maximumFractionDigits: 2})}</div>
                    <div class="change ${crypto.price_change_percentage_24h >= 0 ? 'positive' : 'negative'}">
                        ${crypto.price_change_percentage_24h >= 0 ? '↑' : '↓'} ${Math.abs(crypto.price_change_percentage_24h).toFixed(2)}%
                    </div>
                </div>
            </div>
        `).join('');

        if (grid) grid.innerHTML = html;
    }

    // Обновление рыночной статистики
    updateMarketStats(cryptoList) {
        const stats = galacticData.calculateMarketStats(cryptoList);
        const marketCapElement = document.getElementById('totalMarketCap');
        const volumeElement = document.getElementById('totalVolume');
        
        if (marketCapElement) marketCapElement.textContent = stats.marketCap;
        if (volumeElement) volumeElement.textContent = stats.volume;
    }

    // Обновление отображения портфеля
    updatePortfolioDisplay() {
        const portfolioValue = galacticData.calculatePortfolioStats();
        const portfolioList = document.getElementById('portfolioList');
        const portfolioBalance = document.getElementById('portfolioBalance');
        
        if (portfolioBalance) {
            portfolioBalance.textContent = `$${portfolioValue.totalValue.toFixed(2)}`;
        }

        if (portfolioList) {
            if (galacticData.portfolio.length === 0) {
                portfolioList.innerHTML = '<p class="empty-state">Портфель пуст</p>';
            } else {
                portfolioList.innerHTML = galacticData.portfolio.map(item => {
                    const crypto = galacticData.cryptoList.find(c => c.id === item.assetId);
                    const currentPrice = crypto ? crypto.current_price : item.avgPrice;
                    const currentValue = item.amount * currentPrice;
                    const profit = currentValue - (item.amount * item.avgPrice);
                    const profitPercent = ((currentPrice - item.avgPrice) / item.avgPrice) * 100;

                    return `
                        <div class="portfolio-item">
                            <div>
                                <strong>${item.symbol.toUpperCase()}</strong>
                                <div>${item.amount} coins</div>
                            </div>
                            <div style="text-align: right;">
                                <div>$${currentValue.toFixed(2)}</div>
                                <div class="change ${profit >= 0 ? 'positive' : 'negative'}" style="font-size: 10px;">
                                    ${profit >= 0 ? '↑' : '↓'} ${Math.abs(profitPercent).toFixed(2)}%
                                </div>
                            </div>
                        </div>
                    `;
                }).join('');
            }
        }

        // Обновление галактического сейфа
        this.updateGalacticVault();
    }

    // Обновление симулятора
    updateSimulatorDisplay() {
        const simBalance = document.getElementById('simBalance');
        const simulatorContent = document.getElementById('simulatorContent');
        
        if (simBalance) {
            simBalance.textContent = `$${galacticData.userData.credits.toFixed(2)}`;
        }
        
        const trades = galacticData.getRecentTrades(10);
        
        if (simulatorContent) {
            if (trades.length === 0) {
                simulatorContent.innerHTML = '<p class="empty-state">Начните торговать!</p>';
            } else {
                simulatorContent.innerHTML = `
                    <div style="margin-top: 15px;">
                        <h4>История сделок:</h4>
                        ${trades.map(trade => `
                            <div style="background: var(--surface); padding: 10px; border-radius: 8px; margin: 5px 0;">
                                <div style="display: flex; justify-content: space-between;">
                                    <span><strong>${trade.type === 'buy' ? '📈' : '📉'} ${trade.symbol.toUpperCase()}</strong></span>
                                    <span class="${trade.type === 'buy' ? 'positive' : 'negative'}">${trade.type === 'buy' ? 'BUY' : 'SELL'}</span>
                                </div>
                                <div>${trade.amount} @ $${trade.price.toFixed(2)}</div>
                                <div>Total: $${trade.total.toFixed(2)}</div>
                            </div>
                        `).join('')}
                    </div>
                `;
            }
        }
    }

    // ========== КОСМИЧЕСКИЕ ФУНКЦИИ ==========

    // Выбор актива для торговли
    selectAsset(assetId) {
        this.selectedAsset = assetId;
        const asset = galacticData.getAssetById(assetId);
        
        if (asset) {
            // Переключаемся на терминал
            this.switchTab('terminal');
            
            // Устанавливаем выбранный актив
            setTimeout(() => {
                const tradeSelect = document.getElementById('tradeAsset');
                if (tradeSelect) {
                    tradeSelect.value = assetId;
                    this.updateTradeInterface();
                }
            }, 100);

            // Показываем уведомление
            Telegram.WebApp.showPopup({
                title: `🪐 ${asset.name}`,
                message: `Выбран для космической торговли!\nЦена: $${asset.current_price}`,
                buttons: [{ type: 'ok' }]
            });
        }
    }

    // Обновление интерфейса торговли
    updateTradeInterface() {
        const assetId = document.getElementById('tradeAsset').value;
        const asset = galacticData.getAssetById(assetId);
        
        if (!asset) return;

        const priceElement = document.getElementById('currentPrice');
        const changeElement = document.getElementById('priceChange');
        
        if (priceElement) {
            priceElement.textContent = `$${asset.current_price.toLocaleString('en-US', {maximumFractionDigits: 2})}`;
        }
        
        if (changeElement) {
            const change = asset.price_change_percentage_24h;
            changeElement.textContent = `${change >= 0 ? '+' : ''}${change.toFixed(2)}%`;
            changeElement.className = `change-indicator ${change >= 0 ? 'positive' : 'negative'}`;
        }

        this.updateOrderBook(assetId);
        this.updateTradeCalculation();
    }

    // Обновление ордербука
    updateOrderBook(assetId) {
        const asset = galacticData.getAssetById(assetId);
        if (!asset) return;

        // Генерация демо-данных ордербука
        const generateOrders = (count, basePrice, spread) => {
            const orders = [];
            for (let i = 0; i < count; i++) {
                const price = basePrice * (1 + (Math.random() - 0.5) * spread);
                const amount = Math.random() * 10;
                orders.push({ price, amount });
            }
            return orders.sort((a, b) => b.price - a.price);
        };

        const bids = generateOrders(5, asset.current_price * 0.98, 0.02);
        const asks = generateOrders(5, asset.current_price * 1.02, 0.02);

        const bidsList = document.getElementById('bidsList');
        const asksList = document.getElementById('asksList');

        if (bidsList) {
            bidsList.innerHTML = bids.map(order => `
                <div class="order-item bid">
                    <span>${order.amount.toFixed(2)}</span>
                    <span>$${order.price.toFixed(2)}</span>
                </div>
            `).join('');
        }

        if (asksList) {
            asksList.innerHTML = asks.map(order => `
                <div class="order-item ask">
                    <span>$${order.price.toFixed(2)}</span>
                    <span>${order.amount.toFixed(2)}</span>
                </div>
            `).join('');
        }
    }

    // Расчет стоимости сделки
    updateTradeCalculation() {
        const assetId = document.getElementById('tradeAsset').value;
        const amount = parseFloat(document.getElementById('tradeAmount').value) || 0;
        const asset = galacticData.getAssetById(assetId);
        
        if (asset && amount > 0) {
            const total = amount * asset.current_price;
            const totalElement = document.getElementById('tradeTotal');
            if (totalElement) {
                totalElement.textContent = `${total.toFixed(2)} GC`;
            }
        }
    }

    // Обновление галактического сейфа
    updateGalacticVault() {
        const stats = galacticData.calculatePortfolioStats();
        const totalBalance = document.getElementById('totalBalance');
        const profitIndicator = document.getElementById('profitIndicator');
        
        if (totalBalance) {
            totalBalance.textContent = `${stats.totalValue.toFixed(2)} GC`;
        }
        
        if (profitIndicator) {
            profitIndicator.textContent = `${stats.profitPercentage >= 0 ? '+' : ''}${stats.profitPercentage.toFixed(2)}%`;
            profitIndicator.className = `profit-indicator ${stats.profitPercentage >= 0 ? 'positive' : 'negative'}`;
        }
    }

    // ========== УНИВЕРСАЛЬНЫЕ ФУНКЦИИ ==========

    // Настройка навигации
    setupNavigation() {
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tab = e.target.closest('.nav-btn').dataset.tab;
                this.switchTab(tab);
            });
        });
    }

    // Переключение вкладок
    switchTab(tabName) {
        // Обновляем активные кнопки
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });

        // Обновляем активный контент
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.toggle('active', content.id === tabName);
        });

        this.currentTab = tabName;

        // Специфичные действия для вкладок
        switch(tabName) {
            case 'portfolio':
            case 'vault':
                this.updatePortfolioDisplay();
                break;
            case 'simulator':
            case 'terminal':
                this.updateSimulatorDisplay();
                this.updateTradeInterface();
                break;
            case 'academy':
                this.updateAchievements();
                break;
            case 'dashboard':
            case 'bridge':
                this.renderCryptoList(galacticData.cryptoData);
                break;
        }
    }

    // Обновление всего интерфейса
    updateUI() {
        this.updateUserInfo();
        this.updatePortfolioDisplay();
        this.updateAchievements();
        this.updateMarketOverview();
    }

    // Обновление информации пользователя
    updateUserInfo() {
        const userData = galacticData.getUserData();
        const creditsElement = document.getElementById('userCredits');
        const rankElement = document.getElementById('userRank');
        
        if (creditsElement) creditsElement.textContent = `${userData.credits.toFixed(2)} GC`;
        if (rankElement) rankElement.textContent = userData.rank;
    }

    // Обновление достижений
    updateAchievements() {
        const achievementsGrid = document.getElementById('achievementsList');
        if (!achievementsGrid) return;

        const achievements = galacticData.achievements;
        const allAchievements = [
            { id: 'first_trade', icon: '🚀', name: 'Первый запуск' },
            { id: 'first_profit', icon: '💎', name: 'Первая прибыль' },
            { id: 'active_trader', icon: '⚡', name: 'Активный трейдер' }
        ];

        achievementsGrid.innerHTML = allAchievements.map(achievement => {
            const unlocked = achievements[achievement.id];
            return `
                <div class="achievement ${unlocked ? 'unlocked' : 'locked'}">
                    <span>${achievement.icon}</span>
                    <small>${achievement.name}</small>
                </div>
            `;
        }).join('');
    }

    // Обновление обзора рынка
    updateMarketOverview() {
        const assets = galacticData.cryptoData;
        if (!assets || assets.length === 0) return;
        console.log('Рынок обновлен:', assets.length, 'активов');
    }

    // Настройка модальных окон
    setupModals() {
        // Кнопка обновления
        const refreshBtn = document.getElementById('refreshBtn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.loadCryptoData();
                Telegram.WebApp.showPopup({
                    title: 'Обновлено',
                    message: 'Данные успешно обновлены',
                    buttons: [{ type: 'ok' }]
                });
            });
        }

        // Подтверждение сделки
        const confirmBtn = document.getElementById('confirmTrade');
        if (confirmBtn) {
            confirmBtn.addEventListener('click', () => {
                this.confirmTrade();
            });
        }

        // Модальное окно добавления в портфель
        this.updatePortfolioModalOptions();
        this.updateTradeModalOptions();
    }

    updatePortfolioModalOptions() {
        const select = document.getElementById('cryptoSelect');
        if (select) {
            select.innerHTML = '<option value="">Выберите криптовалюту</option>' +
                galacticData.cryptoList.map(crypto => 
                    `<option value="${crypto.id}">${crypto.name} (${crypto.symbol.toUpperCase()})</option>`
                ).join('');
        }
    }

    updateTradeModalOptions() {
        const select = document.getElementById('tradeCryptoSelect') || document.getElementById('tradeAsset');
        if (select) {
            select.innerHTML = '<option value="">Выберите криптовалюту</option>' +
                galacticData.availableAssets.map(asset => 
                    `<option value="${asset.id}">${asset.name} (${asset.symbol.toUpperCase()})</option>`
                ).join('');
        }
    }

    // Настройка обработчиков событий
    setupEventListeners() {
        // Обновление расчета при изменении актива
        const tradeAsset = document.getElementById('tradeAsset') || document.getElementById('tradeCryptoSelect');
        if (tradeAsset) {
            tradeAsset.addEventListener('change', () => {
                this.updateTradeInterface();
            });
        }

        // Обновление расчета при изменении количества
        const tradeAmount = document.getElementById('tradeAmount');
        if (tradeAmount) {
            tradeAmount.addEventListener('input', () => {
                this.updateTradeCalculation();
            });
        }

        // Расчет в модальном окне
        const modalTradeAmount = document.getElementById('modalTradeAmount');
        if (modalTradeAmount) {
            modalTradeAmount.addEventListener('input', () => {
                this.updateModalTradeCalculation();
            });
        }
    }

    // ========== ТОРГОВЫЕ ОПЕРАЦИИ ==========

    // Открытие модального окна торговли
    openTrade(type) {
        const assetId = document.getElementById('tradeAsset').value;
        const asset = galacticData.getAssetById(assetId);
        
        if (!asset) {
            Telegram.WebApp.showAlert('🌌 Выберите космический актив!');
            return;
        }

        this.selectedTradeType = type;
        const modal = document.getElementById('tradeModal');
        const title = document.getElementById('tradeModalTitle');
        const assetSymbol = document.getElementById('tradeAssetSymbol');
        const assetPrice = document.getElementById('tradeAssetPrice');
        const confirmBtn = document.getElementById('confirmTrade');

        if (modal && title && assetSymbol && assetPrice && confirmBtn) {
            title.textContent = type === 'buy' ? '📈 КУПИТЬ' : '📉 ПРОДАТЬ';
            assetSymbol.textContent = `${asset.symbol.toUpperCase()}`;
            assetPrice.textContent = `$${asset.current_price.toLocaleString('en-US', {maximumFractionDigits: 2})}`;
            confirmBtn.textContent = type === 'buy' ? `КУПИТЬ ${asset.symbol.toUpperCase()}` : `ПРОДАТЬ ${asset.symbol.toUpperCase()}`;
            
            // Сброс формы
            document.getElementById('modalTradeAmount').value = '';
            document.getElementById('modalTradeTotal').textContent = '0 GC';
            
            modal.classList.add('active');

            // Эффект телепортации
            if (cosmicEffects) {
                cosmicEffects.quantumTeleport(modal.querySelector('.modal-content'));
            }
        }
    }

    // Подтверждение сделки
    async confirmTrade() {
        const amount = parseFloat(document.getElementById('modalTradeAmount').value);
        const assetId = document.getElementById('tradeAsset').value;
        
        if (!amount || amount <= 0) {
            Telegram.WebApp.showAlert('⚡ Введите количество!');
            return;
        }

        const result = galacticData.executeQuantumTrade(this.selectedTradeType, assetId, amount);
        
        if (result.success) {
            // Эффект успешной сделки
            if (cosmicEffects) {
                cosmicEffects.supernovaFlash(document.getElementById('tradeModal'));
            }

            // Награда опытом
            const reward = gameEngine.calculateTradeReward(result.trade);
            gameEngine.addExperience(reward, 'Торговля');

            Telegram.WebApp.showPopup({
                title: '✅ Космическая сделка!',
                message: `${result.message}\n+${reward} опыта`,
                buttons: [{ type: 'ok' }]
            });

            this.updateUI();
            this.closeModal('tradeModal');

        } else {
            Telegram.WebApp.showAlert(`❌ ${result.message}`);
        }
    }

    // Расчет в модальном окне
    updateModalTradeCalculation() {
        const amount = parseFloat(document.getElementById('modalTradeAmount').value) || 0;
        const assetId = document.getElementById('tradeAsset').value;
        const asset = galacticData.getAssetById(assetId);
        
        if (asset && amount > 0) {
            const total = amount * asset.current_price;
            document.getElementById('modalTradeTotal').textContent = `${total.toFixed(2)} GC`;
        }
    }

    // ========== УТИЛИТЫ ==========

    // Показ деталей криптовалюты
    showCryptoDetails(cryptoId) {
        const crypto = galacticData.getAssetById(cryptoId);
        if (crypto) {
            Telegram.WebApp.showPopup({
                title: crypto.name,
                message: `Цена: $${crypto.current_price}\nИзменение 24ч: ${crypto.price_change_percentage_24h}%`,
                buttons: [{ type: 'ok' }]
            });
        }
    }

    // Закрытие модального окна
    closeModal(modalId) {
        document.getElementById(modalId).classList.remove('active');
    }

    // Запуск авто-обновления
    startAutoRefresh() {
        setInterval(() => {
            this.loadCryptoData();
        }, 30000);
    }

    // Запуск курса обучения
    startCourse(courseId) {
        const courses = {
            basics: {
                title: '🔬 Квантовая механика рынков',
                content: 'Изучите основы космической торговли...'
            },
            charts: {
                title: '📊 Чтение звездных карт',
                content: 'Научитесь анализировать графики...'
            },
            strategies: {
                title: '⚡ Стратегии черных дыр', 
                content: 'Продвинутые методы торговли...'
            }
        };

        const course = courses[courseId];
        if (course) {
            Telegram.WebApp.showPopup({
                title: course.title,
                message: course.content + '\n\nКурс в разработке...',
                buttons: [{ type: 'ok' }]
            });
        }
    }
}

// ========== ГЛОБАЛЬНЫЕ ФУНКЦИИ ДЛЯ HTML ==========

// Функции из твоего кода
function showAddCryptoModal() {
    document.getElementById('addCryptoModal').classList.add('active');
}

function closeModal(modalId) {
    if (window.app) {
        window.app.closeModal(modalId);
    }
}

function addToPortfolio() {
    const cryptoId = document.getElementById('cryptoSelect').value;
    const amount = document.getElementById('cryptoAmount').value;
    const price = document.getElementById('cryptoPrice').value;

    if (!cryptoId || !amount || !price) {
        Telegram.WebApp.showAlert('Заполните все поля!');
        return;
    }

    if (galacticData.addToPortfolio(cryptoId, amount, price)) {
        Telegram.WebApp.showPopup({
            title: 'Успех!',
            message: 'Криптовалюта добавлена в портфель',
            buttons: [{ type: 'ok' }]
        });
        closeModal('addCryptoModal');
        if (window.app) window.app.updatePortfolioDisplay();
    }
}

function openTradeModal(type) {
    if (window.app) {
        window.app.openTrade(type);
    }
}

function executeTrade(type) {
    const cryptoId = document.getElementById('tradeCryptoSelect').value;
    const amount = parseFloat(document.getElementById('tradeAmount').value);

    if (!cryptoId || !amount) {
        Telegram.WebApp.showAlert('Заполните все поля!');
        return;
    }

    const result = galacticData.executeQuantumTrade(type, cryptoId, amount);
    
    if (result.success) {
        Telegram.WebApp.showPopup({
            title: 'Успех!',
            message: `Сделка ${type === 'buy' ? 'покупки' : 'продажи'} выполнена`,
            buttons: [{ type: 'ok' }]
        });
        closeModal('tradeModal');
        if (window.app) window.app.updateSimulatorDisplay();
    } else {
        Telegram.WebApp.showAlert(result.message);
    }
}

function startLesson(lessonId) {
    const lessons = {
        1: { title: 'Основы блокчейна', content: 'Блокчейн - это распределенная база данных...' },
        2: { title: 'Чтение графиков', content: 'Графики показывают историю цены...' },
        3: { title: 'Торговые стратегии', content: 'Разные стратегии для разных рынков...' }
    };

    const lesson = lessons[lessonId];
    if (lesson) {
        Telegram.WebApp.showPopup({
            title: lesson.title,
            message: lesson.content + '\n\nПродолжить обучение?',
            buttons: [
                { type: 'default', text: 'Продолжить' },
                { type: 'cancel', text: 'Закрыть' }
            ]
        });
        
        galacticData.updateLessonProgress(lessonId, 25);
    }
}

// Новые космические функции
function selectAsset(assetId) {
    if (window.app) {
        window.app.selectAsset(assetId);
    }
}

function startCourse(courseId) {
    if (window.app) {
        window.app.startCourse(courseId);
    }
}

// Обработчики событий из твоего кода
document.addEventListener('DOMContentLoaded', function() {
    const tradeAmount = document.getElementById('tradeAmount');
    if (tradeAmount) {
        tradeAmount.addEventListener('input', function() {
            const cryptoId = document.getElementById('tradeCryptoSelect').value;
            const amount = parseFloat(this.value) || 0;
            
            if (cryptoId && amount > 0) {
                const crypto = galacticData.getAssetById(cryptoId);
                if (crypto) {
                    const total = amount * crypto.current_price;
                    const totalElement = document.getElementById('tradeTotal');
                    if (totalElement) {
                        totalElement.textContent = `Итого: $${total.toFixed(2)}`;
                    }
                }
            }
        });
    }
});

// Инициализация приложения
document.addEventListener('DOMContentLoaded', () => {
    window.app = new GalaxyTraderApp();
});
