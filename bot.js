import { analyzeMarket } from './analyzer.js';
import { createSignalChart } from './chart.js';

class MiniTradingBot {
    constructor() {
        this.symbols = ['BTCUSDT', 'ETHUSDT', 'ADAUSDT'];
        this.isRunning = false;
    }

    async start() {
        console.log('🚀 Мини-трейдинг бот запущен!');
        console.log('⏰ Анализ каждые 2 минуты...\n');
        
        this.isRunning = true;
        
        // Немедленный первый анализ
        await this.analyzeAll();
        
        // Анализ каждые 2 минуты
        setInterval(async () => {
            if (this.isRunning) {
                await this.analyzeAll();
            }
        }, 2 * 60 * 1000);
    }

    async analyzeAll() {
        const timestamp = new Date().toLocaleString();
        console.log(`\n📊 [${timestamp}] Запуск анализа рынка...`);
        
        for (const symbol of this.symbols) {
            try {
                await this.analyzeAndSignal(symbol);
                // Пауза между запросами
                await new Promise(resolve => setTimeout(resolve, 1000));
            } catch (error) {
                console.log(`❌ Ошибка анализа ${symbol}:`, error.message);
            }
        }
    }

    async analyzeAndSignal(symbol) {
        console.log(`\n🔍 Анализирую ${symbol}...`);
        
        // Получаем анализ
        const analysis = await analyzeMarket(symbol);
        
        // Если есть сильный сигнал - создаем график и выводим
        if (analysis.shouldTrade) {
            console.log(`🎯 СИГНАЛ ${analysis.signal} для ${symbol}!`);
            
            // Создаем график с пояснениями
            const chartPath = await createSignalChart(symbol, analysis);
            
            // Выводим детали сигнала
            this.printSignalDetails(analysis, chartPath);
            
            // Здесь можно добавить отправку в Telegram
            // await this.sendToTelegram(analysis, chartPath);
        } else {
            console.log(`➖ Нет сигнала для ${symbol} (${analysis.reason})`);
        }
    }

    printSignalDetails(analysis, chartPath) {
        console.log('\n📈 ДЕТАЛИ СИГНАЛА:');
        console.log('══════════════════════════════════════');
        console.log(`🎯 Пара: ${analysis.symbol}`);
        console.log(`📊 Сигнал: ${analysis.signal}`);
        console.log(`💪 Уверенность: ${analysis.confidence}%`);
        console.log(`💰 Текущая цена: $${analysis.price}`);
        console.log(`🎯 Take Profit: $${analysis.targets.takeProfit}`);
        console.log(`🛡️ Stop Loss: $${analysis.targets.stopLoss}`);
        console.log(`📊 График сохранен: ${chartPath}`);
        
        console.log('\n📋 ОБОСНОВАНИЕ:');
        analysis.reasons.forEach((reason, index) => {
            console.log(`  ${index + 1}. ${reason}`);
        });
        
        console.log('📊 ТЕХНИЧЕСКИЕ ДАННЫЕ:');
        console.log(`  RSI: ${analysis.indicators.rsi}`);
        console.log(`  Изменение цены: ${analysis.indicators.priceChange}%`);
        console.log(`  Объем: ${analysis.indicators.volume}`);
        console.log('══════════════════════════════════════\n');
    }

    stop() {
        this.isRunning = false;
        console.log('🛑 Бот остановлен');
    }
}

// Запуск бота
const bot = new MiniTradingBot();
bot.start();

// Обработка завершения
process.on('SIGINT', () => {
    bot.stop();
    process.exit();
});
