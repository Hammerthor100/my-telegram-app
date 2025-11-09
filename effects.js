// 🌌 GALAXY TRADER - Cosmic Effects
class CosmicEffects {
    constructor() {
        this.starCount = 150;
        this.init();
    }

    init() {
        this.createStarfield();
        this.startAnimations();
    }

    // Создание звездного поля
    createStarfield() {
        const starfield = document.getElementById('starfield');
        if (!starfield) return;

        for (let i = 0; i < this.starCount; i++) {
            const star = document.createElement('div');
            star.className = 'star';
            
            // Случайные параметры звезды
            const size = Math.random() * 2 + 1;
            const opacity = Math.random() * 0.7 + 0.3;
            const duration = Math.random() * 10 + 5;
            const delay = Math.random() * 5;
            
            star.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                background: white;
                border-radius: 50%;
                opacity: ${opacity};
                top: ${Math.random() * 100}%;
                left: ${Math.random() * 100}%;
                animation: twinkle ${duration}s infinite ${delay}s;
            `;
            
            starfield.appendChild(star);
        }

        // Добавляем стили для мерцания
        const style = document.createElement('style');
        style.textContent = `
            @keyframes twinkle {
                0%, 100% { opacity: 0.3; transform: scale(1); }
                50% { opacity: 1; transform: scale(1.2); }
            }
        `;
        document.head.appendChild(style);
    }

    // Запуск анимаций
    startAnimations() {
        this.animateOrbits();
        this.animatePulseElements();
    }

    // Анимация орбит планет
    animateOrbits() {
        const planets = document.querySelectorAll('.planet');
        planets.forEach((planet, index) => {
            const speed = 20 + (index * 5); // Разная скорость для каждой планеты
            planet.style.animationDuration = `${speed}s`;
        });
    }

    // Анимация пульсирующих элементов
    animatePulseElements() {
        const pulseElements = document.querySelectorAll('.pulse-glow');
        pulseElements.forEach(element => {
            element.style.animation = `pulseGlow 2s ease-in-out infinite`;
        });
    }

    // Эффект квантовой телепортации
    quantumTeleport(element, callback) {
        element.style.transition = 'all 0.3s ease';
        element.style.transform = 'scale(0.8) rotateY(180deg)';
        element.style.opacity = '0.5';

        setTimeout(() => {
            element.style.transform = 'scale(1.2) rotateY(0deg)';
            element.style.opacity = '1';
            
            setTimeout(() => {
                element.style.transform = 'scale(1)';
                if (callback) callback();
            }, 200);
        }, 150);
    }

    // Эффект вспышки сверхновой
    supernovaFlash(element) {
        const flash = document.createElement('div');
        flash.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            width: 100px;
            height: 100px;
            background: radial-gradient(circle, var(--supernova), transparent 70%);
            border-radius: 50%;
            transform: translate(-50%, -50%);
            opacity: 0;
            pointer-events: none;
            z-index: 100;
        `;

        element.style.position = 'relative';
        element.appendChild(flash);

        // Анимация вспышки
        flash.animate([
            { opacity: 0, transform: 'translate(-50%, -50%) scale(0)' },
            { opacity: 0.8, transform: 'translate(-50%, -50%) scale(2)' },
            { opacity: 0, transform: 'translate(-50%, -50%) scale(3)' }
        ], {
            duration: 1000,
            easing: 'ease-out'
        }).onfinish = () => flash.remove();
    }

    // Эффект гравитационной волны
    gravityWave(x, y) {
        const wave = document.createElement('div');
        wave.style.cssText = `
            position: fixed;
            top: ${y}px;
            left: ${x}px;
            width: 10px;
            height: 10px;
            border: 2px solid var(--quantum-blue);
            border-radius: 50%;
            opacity: 0.8;
            pointer-events: none;
            z-index: 99;
        `;

        document.body.appendChild(wave);

        wave.animate([
            { 
                width: '10px', 
                height: '10px', 
                opacity: 0.8,
                borderWidth: '2px'
            },
            { 
                width: '500px', 
                height: '500px', 
                opacity: 0,
                borderWidth: '1px'
            }
        ], {
            duration: 2000,
            easing: 'ease-out'
        }).onfinish = () => wave.remove();
    }
}

// Инициализация эффектов при загрузке
const cosmicEffects = new CosmicEffects();
