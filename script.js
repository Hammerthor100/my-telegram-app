// Добавляем в класс GalaxyTraderApp
class GalaxyTraderApp {
    // ... существующий код ...

    // НОВЫЙ МЕТОД ДЛЯ СИГНАЛОВ
    setupSignalNotifications() {
        // Проверяем новые сигналы каждые 30 минут
        setInterval(() => {
            this.checkNewSignals();
        }, 30 * 60 * 1000);
        
        this.checkNewSignals(); // Первая проверка
    }

    async checkNewSignals() {
        const signals = galacticEngine.getSignals(3);
        
        if (signals.length > 0) {
            // Показываем уведомление о новых сигналах
            this.showSignalNotification(signals[0]);
        }
    }

    showSignalNotification(signal) {
        const actionEmoji = {
            'BUY': '📈',
            'SELL': '📉', 
            'HOLD': '⚡'
        };

        Telegram.WebApp.showPopup({
            title: `${actionEmoji[signal.action]} Новый сигнал!`,
            message: `${signal.symbol} - ${signal.action}\nЦена: $${signal.currentPrice}\nПричина: ${signal.reason}`,
            buttons: [{ type: 'ok', text: 'Подробнее' }]
        });
    }

    // Обновляем интерфейс для показа сигналов
    updateSignalsDisplay() {
        const signals = galacticEngine.getSignals(5);
        this.renderSignals(signals);
    }

    renderSignals(signals) {
        const signalsContainer = document.getElementById('signalsContainer');
        if (!signalsContainer) return;

        if (signals.length === 0) {
            signalsContainer.innerHTML = '<div class="empty-state">Нет активных сигналов</div>';
            return;
        }

        signalsContainer.innerHTML = signals.map(signal => `
            <div class="signal-card ${signal.action.toLowerCase()}">
                <div class="signal-header">
                    <span class="signal-symbol">${signal.symbol}</span>
                    <span class="signal-action ${signal.action}">${signal.action}</span>
                    <span class="signal-confidence">${signal.confidence}%</span>
                </div>
                <div class="signal-price">$${signal.currentPrice}</div>
                <div class="signal-targets">
                    <strong>Цели:</strong> ${signal.targets.map(t => `$${t}`).join(' → ')}
                </div>
                <div class="signal-stop-loss">
                    <strong>Стоп-лосс:</strong> $${signal.stopLoss}
                </div>
                <div class="signal-reason">${signal.reason}</div>
                <div class="signal-trend ${signal.trend.toLowerCase()}">
                    Тренд: ${this.getTrendText(signal.trend)}
                </div>
            </div>
        `).join('');
    }

    getTrendText(trend) {
        const trends = {
            'BULLISH': '📈 Бычий',
            'BEARISH': '📉 Медвежий', 
            'NEUTRAL': '⚡ Нейтральный'
        };
        return trends[trend] || trend;
    }
}

// Добавляем в HTML новую секцию для сигналов
function addSignalsSectionToHTML() {
    // Добавь этот код в нужную вкладку твоего Mini App
    return `
        <div class="signals-section">
            <div class="section-header hologram">
                <h2>🔔 Торговые Сигналы</h2>
                <p>Автоматический анализ рынка</p>
            </div>
            <div id="signalsContainer" class="signals-container">
                <!-- Сигналы будут здесь -->
            </div>
            <button class="refresh-btn" onclick="app.updateSignalsDisplay()">
                🔄 Обновить сигналы
            </button>
        </div>
    `;
}
