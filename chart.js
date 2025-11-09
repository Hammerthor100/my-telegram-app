import { createCanvas } from 'canvas';
import fs from 'fs';
import path from 'path';

export async function createSignalChart(symbol, analysis) {
    const width = 800;
    const height = 600;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');
    
    // Создаем папку charts если нет
    const chartsDir = './charts';
    if (!fs.existsSync(chartsDir)) {
        fs.mkdirSync(chartsDir);
    }

    // Фон
    drawBackground(ctx, width, height);
    
    // Заголовок
    drawHeader(ctx, symbol, analysis);
    
    // Основная информация
    drawMainInfo(ctx, analysis);
    
    // Причины сигнала
    drawReasons(ctx, analysis.reasons);
    
    // Технические данные
    drawTechnicalData(ctx, analysis.indicators);
    
    // Цели и стоп-лосс
    drawTargets(ctx, analysis.targets, analysis.signal);
    
    // Сохраняем изображение
    const filename = `signal_${symbol}_${Date.now()}.png`;
    const filepath = path.join(chartsDir, filename);
    
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(filepath, buffer);
    
    return filepath;
}

function drawBackground(ctx, width, height) {
    // Градиентный фон
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#0c0c0c');
    gradient.addColorStop(1, '#1a1a2e');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    // Сетка
    ctx.strokeStyle = '#333344';
    ctx.lineWidth = 1;
    
    for (let x = 0; x < width; x += 50) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
    }
    
    for (let y = 0; y < height; y += 50) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
    }
}

function drawHeader(ctx, symbol, analysis) {
    // Заголовок
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 28px Arial';
    ctx.fillText(`ТОРГОВЫЙ СИГНАЛ: ${symbol}`, 40, 50);
    
    // Сигнал
    const signalColor = analysis.signal === 'BUY' ? '#00ff88' : '#ff4444';
    ctx.fillStyle = signalColor;
    ctx.font = 'bold 36px Arial';
    ctx.fillText(`СИГНАЛ: ${analysis.signal}`, 40, 100);
    
    // Уверенность
    ctx.fillStyle = '#ffff00';
    ctx.font = 'bold 24px Arial';
    ctx.fillText(`УВЕРЕННОСТЬ: ${analysis.confidence}%`, 40, 140);
}

function drawMainInfo(ctx, analysis) {
    ctx.fillStyle = '#ffffff';
    ctx.font = '20px Arial';
    ctx.fillText(`💰 Текущая цена: $${analysis.price.toFixed(2)}`, 40, 190);
    ctx.fillText(`🕐 Время анализа: ${analysis.timestamp.toLocaleTimeString()}`, 40, 220);
}

function drawReasons(ctx, reasons) {
    ctx.fillStyle = '#00ccff';
    ctx.font = 'bold 22px Arial';
    ctx.fillText('📊 ОБОСНОВАНИЕ СИГНАЛА:', 40, 270);
    
    ctx.fillStyle = '#cccccc';
    ctx.font = '16px Arial';
    
    let yPos = 300;
    reasons.forEach((reason, index) => {
        if (yPos < 500) {
            ctx.fillText(`${index + 1}. ${reason}`, 60, yPos);
            yPos += 30;
        }
    });
}

function drawTechnicalData(ctx, indicators) {
    ctx.fillStyle = '#ffaa00';
    ctx.font = 'bold 20px Arial';
    ctx.fillText('📈 ТЕХНИЧЕСКИЕ ДАННЫЕ:', 400, 270);
    
    ctx.fillStyle = '#cccccc';
    ctx.font = '16px Arial';
    
    let yPos = 300;
    ctx.fillText(`• RSI: ${indicators.rsi.toFixed(1)}`, 420, yPos);
    yPos += 25;
    ctx.fillText(`• Изменение цены: ${indicators.priceChange.toFixed(2)}%`, 420, yPos);
    yPos += 25;
    ctx.fillText(`• Объем: ${indicators.volume.toFixed(0)}`, 420, yPos);
    yPos += 25;
    ctx.fillText(`• Тренд: ${getTrendText(indicators.trend)}`, 420, yPos);
}

function drawTargets(ctx, targets, signal) {
    const color = signal === 'BUY' ? '#00ff88' : '#ff4444';
    
    ctx.fillStyle = color;
    ctx.font = 'bold 20px Arial';
    ctx.fillText('🎯 ТОРГОВЫЕ ЦЕЛИ:', 400, 400);
    
    ctx.fillStyle = '#cccccc';
    ctx.font = '16px Arial';
    
    ctx.fillText(`Take Profit: $${targets.takeProfit}`, 420, 430);
    ctx.fillText(`Stop Loss: $${targets.stopLoss}`, 420, 460);
    
    // Визуализация целей
    if (signal !== 'HOLD') {
        const profitPercent = signal === 'BUY' ? '+3%' : '-3%';
        const lossPercent = signal === 'BUY' ? '-3%' : '+3%';
        
        ctx.fillStyle = '#00ff88';
        ctx.fillText(`↑ ${profitPercent}`, 600, 430);
        
        ctx.fillStyle = '#ff4444';
        ctx.fillText(`↓ ${lossPercent}`, 600, 460);
    }
}

function getTrendText(trend) {
    const trends = {
        'STRONG_BULL': 'Сильный рост ↗️',
        'BULL': 'Рост ↗️',
        'NEUTRAL': 'Боковик ➡️',
        'BEAR': 'Спад ↘️',
        'STRONG_BEAR': 'Сильный спад ↘️'
    };
    return trends[trend] || trend;

