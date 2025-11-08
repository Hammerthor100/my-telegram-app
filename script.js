// CryptoSphere Main Logic
class CryptoSphereApp {
    constructor() {
        this.currentTab = 'dashboard';
        this.init();
    }

    async init() {
        // Инициализация Telegram Web App
        Telegram.WebApp.ready();
        Telegram.WebApp.expand();

        // Загрузка данных
        await this.loadCryptoData();
        
        // Настройка навигации
        this.setupNavigation();
        
        // Настройка модальных окон
        this.setupModals();
        
        // Обновление интерфейса
        this.updateUI();

        // Авто-обновление каждые 30 секунд
        setInterval(() => this.loadCryptoData(), 30000);
    }

    // Загрузка данных о криптовалютах
    async loadCryptoData() {
        const data = await cryptoData.fetchCryptoData();
        this.renderCryptoList(data);
        this.updateMarketStats(data);
        this.updatePortfolioDisplay();
        this.updateTradeModalOptions();
    }

    // Рендер списка криптовалют
    renderCryptoList(cryptoList) {
        const grid = document.getElementById('cryptoGrid');
        
        if (!cryptoList || cryptoList.length === 0) {
            grid.innerHTML = '<div class="loading">Ошибка загрузки данных</div>';
            return;
        }

        grid.innerHTML = cryptoList.map(crypto => `
            <div class="crypto-card" onclick="app.showCryptoDetails('${crypto.id}')">
                <div class="crypto-info">
                    <div class="crypto-icon">${crypto.symbol.toUpperCase().charAt(0)}</div>
                    <div class="crypto-details">
                        <h3>${crypto.name}</h3>
                        <span class="crypto-symbol">${crypto.symbol.toUpperCase()}</span>
                    </div>
                </div>
                <div class="crypto-price">
                    <div class="price">$${crypto.current_price.toLocaleString('en-US', {maximumFractionDigits: 2})}</div>
                    <div class="change ${crypto.price_change_percentage_24h >= 0 ? 'positive' : 'negative'}">
                        ${crypto.price_change_percentage_24h >= 0 ? '↑' : '↓'} ${Math.abs(crypto.price_change_percentage_24h).toFixed(2)}%
                    </div>
                </div>
            </div>
        `).join('');
    }

    // Обновление рыночной статистики
    updateMarketStats(cryptoList) {
        const stats = cryptoData.calculateMarketStats(cryptoList);
        document.getElementById('totalMarketCap').textContent = stats.marketCap;
        document.getElementById('totalVolume').textContent = stats.volume;
    }

    // Настройка навигации
    setupNavigation() {
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tab = e.target.dataset.tab;
                this.switchTab(tab);
            });
        });
    }

    // Переключение вкладок
    switchTab(tabName) {
        // Обновляем активные кнопки навигации
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });

        // Обновляем активный контент
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.toggle('active', content.id === tabName);
        });

        this.currentTab = tabName;

        // Специфичные действия для вкладок
        if (tabName === 'portfolio') {
            this.updatePortfolioDisplay();
        } else if (tabName === 'simulator') {
            this.updateSimulatorDisplay();
        }
    }

    // Обновление отображения портфеля
    updatePortfolioDisplay() {
        const portfolioValue = cryptoData.calculatePortfolioValue();
        const portfolioList = document.getElementById('portfolioList');
        
        document.getElementById('portfolioBalance').textContent = 
            `$${portfolioValue.totalValue.toFixed(2)}`;

        if (cryptoData.portfolio.length === 0) {
            portfolioList.innerHTML = '<p class="empty-state">Портфель пуст</p>';
            return;
        }

        portfolioList.innerHTML = cryptoData.portfolio.map(item => {
            const crypto = cryptoData.cryptoList.find(c => c.id === item.cryptoId);
            const currentPrice = crypto ? crypto.current_price : item.buyPrice;
            const currentValue = item.amount * currentPrice;
            const profit = currentValue - (item.amount * item.buyPrice);
            const profitPercent = ((currentPrice - item.buyPrice) / item.buyPrice) * 100;

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

    // Обновление симулятора
    updateSimulatorDisplay() {
        document.getElementById('simBalance').textContent = `$${cryptoData.virtualBalance.toFixed(2)}`;
        
        const trades = cryptoData.getTradeHistory();
        const simulatorContent = document.getElementById('simulatorContent');
        
        if (trades.length === 0) {
            simulatorContent.innerHTML = '<p class="empty-state">Начните торговать!</p>';
            return;
        }

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

    // Настройка модальных окон
    setupModals() {
        // Кнопка обновления
        document.getElementById('refreshBtn').addEventListener('click', () => {
            this.loadCryptoData();
            Telegram.WebApp.showPopup({
                title: 'Обновлено',
                message: 'Данные успешно обновлены',
                buttons: [{ type: 'ok' }]
            });
        });

        // Модальное окно добавления в портфель
        this.updatePortfolioModalOptions();
    }

    updatePortfolioModalOptions() {
        const select = document.getElementById('cryptoSelect');
        select.innerHTML = '<option value="">Выберите криптовалюту</option>' +
            cryptoData.cryptoList.map(crypto => 
                `<option value="${crypto.id}">${crypto.name} (${crypto.symbol.toUpperCase()})</option>`
            ).join('');
    }

    updateTradeModalOptions() {
        const select = document.getElementById('tradeCryptoSelect');
        select.innerHTML = '<option value="">Выберите криптовалюту</option>' +
            cryptoData.cryptoList.map(crypto => 
                `<option value="${crypto.id}">${crypto.name} (${crypto.symbol.toUpperCase()})</option>`
            ).join('');
    }

    // Показ деталей криптовалюты
    showCryptoDetails(cryptoId) {
        const crypto = cryptoData.cryptoList.find(c => c.id === cryptoId);
        if (crypto) {
            Telegram.WebApp.showPopup({
                title: crypto.name,
                message: `Цена: $${crypto.current_price}\nИзменение 24ч: ${crypto.price_change_percentage_24h}%`,
                buttons: [{ type: 'ok' }]
            });
        }
    }
}

// Глобальные функции для HTML onclick
function showAddCryptoModal() {
    document.getElementById('addCryptoModal').classList.add('active');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

function addToPortfolio() {
    const cryptoId = document.getElementById('cryptoSelect').value;
    const amount = document.getElementById('cryptoAmount').value;
    const price = document.getElementById('cryptoPrice').value;

    if (!cryptoId || !amount || !price) {
        Telegram.WebApp.showAlert('Заполните все поля!');
        return;
    }

    if (cryptoData.addToPortfolio(cryptoId, amount, price)) {
        Telegram.WebApp.showPopup({
            title: 'Успех!',
            message: 'Криптовалюта добавлена в портфель',
            buttons: [{ type: 'ok' }]
        });
        closeModal('addCryptoModal');
        app.updatePortfolioDisplay();
    }
}

function openTradeModal(type) {
    const modal = document.getElementById('tradeModal');
    const title = document.getElementById('tradeModalTitle');
    const confirmBtn = document.getElementById('tradeConfirmBtn');
    
    title.textContent = type === 'buy' ? '📈 Купить' : '📉 Продать';
    confirmBtn.textContent = type === 'buy' ? 'Купить' : 'Продать';
    confirmBtn.onclick = () => executeTrade(type);
    
    modal.classList.add('active');
}

function executeTrade(type) {
    const cryptoId = document.getElementById('tradeCryptoSelect').value;
    const amount = parseFloat(document.getElementById('tradeAmount').value);

    if (!cryptoId || !amount) {
        Telegram.WebApp.showAlert('Заполните все поля!');
        return;
    }

    if (cryptoData.executeTrade(type, cryptoId, amount)) {
        Telegram.WebApp.showPopup({
            title: 'Успех!',
            message: `Сделка ${type === 'buy' ? 'покупки' : 'продажи'} выполнена`,
            buttons: [{ type: 'ok' }]
        });
        closeModal('tradeModal');
        app.updateSimulatorDisplay();
    } else {
        Telegram.WebApp.showAlert('Недостаточно средств для сделки!');
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
        
        // Обновляем прогресс
        cryptoData.updateLessonProgress(lessonId, 25);
    }
}

// Обновление общей суммы в торговом модальном окне
document.getElementById('tradeAmount').addEventListener('input', function() {
    const cryptoId = document.getElementById('tradeCryptoSelect').value;
    const amount = parseFloat(this.value) || 0;
    
    if (cryptoId && amount > 0) {
        const crypto = cryptoData.cryptoList.find(c => c.id === cryptoId);
        if (crypto) {
            const total = amount * crypto.current_price;
            document.getElementById('tradeTotal').textContent = `Итого: $${total.toFixed(2)}`;
        }
    }
});

// Инициализация приложения
const app = new CryptoSphereApp();