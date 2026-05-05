import BaseScene from './BaseScene.js'; // путь к BaseScene
import Data from '../data/Data.js';

export default class GameOverScene extends BaseScene {
    constructor() { super('GameOverScene'); }    
    
    init(data) {
        // Получаем переданный счет
        this.displayScore = data.finalScore || 0;
    }
    
    create() {
        //super.create(); 
        
         // <======Устанавливаем камеру в стандартный режим без зума
        this.cameras.main.setZoom(1);
        this.cameras.main.setScroll(0, 0);


        const playerData = this.registry.get('playerData');

        // Создаем контейнер, в котором будем собирать окно
        this.container = this.add.container(0, 0);

        // 2. Центральная плашка
        const bgW = 550;
        const bgH = 550;
        //const bgX = Data.gameW / 2 - bgW / 2;
        //const bgY = Data.gameH / 2 - bgH / 2;
        const bgX = - bgW / 2;
        const bgY = - bgH / 2;
        
        const bg = this.add.graphics();
        bg.fillStyle(0xefe9e6, 1);
        bg.fillRoundedRect(bgX, bgY, bgW, bgH, 40);

        // 5. Лучший результат 
        
        const bestLabel = this.add.text(0, bgY + 90, this.game.getText('best'), {
            fontSize: '40px', fontFamily: 'EXO2', fontStyle: 'bold', fill: '#A66E6F',
    // Настройки тени
    shadow: {
        offsetX: 2,      // смещение по горизонтали
        offsetY: 2,      // смещение по вертикали
        color: '#A66E6F', // цвет тени (можно сделать темнее основного или черным)
        blur: 4,         // мягкость (чем больше, тем более гладкой кажется тень)
        stroke: false,   // применять ли тень к обводке
        fill: true       // применять ли тень к заливке букв
    }
        }).setOrigin(0.5).setResolution(2);


        const bestScore = this.add.text(0, bgY + 170, playerData.bestScore, {
            fontSize: '48px', fontFamily: 'EXO2', fontStyle: 'bold', fill: '#A66E6F',
    // Настройки тени 
    shadow: {
        offsetX: 2,      // смещение по горизонтали
        offsetY: 2,      // смещение по вертикали
        color: '#A66E6F', // цвет тени (можно сделать темнее основного или черным)
        blur: 4,         // мягкость (чем больше, тем более гладкой кажется тень)
        stroke: false,   // применять ли тень к обводке
        fill: true       // применять ли тень к заливке букв
    }
        }).setOrigin(0.5).setResolution(2);

        // 4. Текущий счет Data.gameW / 2
        const scoreLabel = this.add.text(0, bgY + 270, this.game.getText('score'), {
            fontSize: '40px', fontFamily: 'EXO2', fontStyle: 'bold', fill: '#E97E8E',
    // Настройки тени
    shadow: {
        offsetX: 2,      // смещение по горизонтали
        offsetY: 2,      // смещение по вертикали
        color: '#E97E8E', // цвет тени (можно сделать темнее основного или черным)
        blur: 4,         // мягкость (чем больше, тем более гладкой кажется тень)
        stroke: false,   // применять ли тень к обводке
        fill: true       // применять ли тень к заливке букв
    }
        }).setOrigin(0.5).setResolution(2);

        const scoreVal = this.add.text(0, bgY + 330, this.displayScore, {
            fontSize: '44px', fontFamily: 'EXO2', fontStyle: 'bold', fill: '#E97E8E',
    // Настройки тени
    shadow: {
        offsetX: 2,      // смещение по горизонтали
        offsetY: 2,      // смещение по вертикали
        color: '#E97E8E', // цвет тени (можно сделать темнее основного или черным)
        blur: 4,         // мягкость (чем больше, тем более гладкой кажется тень)
        stroke: false,   // применять ли тень к обводке
        fill: true       // применять ли тень к заливке букв
    }
        }).setOrigin(0.5).setResolution(2);


        // 6. Кнопка RESTART (Основная) Data.gameW / 2
        const restartBtn = this.add.image(0, bgY + 460, 'ui', 'reset')
            .setInteractive({ useHandCursor: true });

        // --- ЛОГИКА ---

        // Помечаем коллбэк как async, чтобы сервис Яндекса мог его корректно "подождать"
    restartBtn.on('pointerdown', async () => {
        this.sound.play('clickBtn');

        // Блокируем кнопку, чтобы игрок не нажал её 10 раз, пока ждет рекламу
        restartBtn.disableInteractive();

        this.game.sdk.showFullscreenAd(async () => {
            // Запускаем GameScene. Она сама остановит текущую сцену
            this.scene.start('GameScene');
        
            // Если UIScene у вас запускается из GameScene через scene.launch(),
            // то больше ничего делать не нужно.
        });
    });

        
        //<=========== Добавим эффекты кнопкам (как мы делали раньше)
        this.addHoverEffect(restartBtn);

        // Показываем рекламу сразу при входе (опционально)
        // this.game.yandex.showFullscreenAd();

            // Добавляем всё в контейнер
        this.container.add([bg, bestLabel, bestScore, scoreLabel, scoreVal, restartBtn]);

        // Позиционируем и подписываемся на ресайз
        //this.updateElementsPosition();
        this.events.once('postupdate', () => {this.updateElementsPosition();});
        this.scale.on('resize', this.updateElementsPosition, this);
        
        // Отписка при закрытии сцены
        this.events.once('shutdown', () => {
            this.scale.off('resize', this.updateElementsPosition, this);
        });




    }

    updateElementsPosition() {
        if (!this.scene.isActive() || !this.container) return;

        const { width, height } = this.scale.displaySize;

        // Вычисляем масштаб интерфейса (как в UIScene)
        const scale = Math.min(width / Data.gameW, height / Data.gameH);

        // Ставим контейнер ровно по центру экрана
        this.container.setPosition(width / 2, height / 2);
        this.container.setScale(scale);
    }







    addHoverEffect(btn) {
        btn.on('pointerover', () => btn.setScale(btn.scale * 1.1));
        btn.on('pointerout', () => btn.setScale(btn.scale / 1.1));
    }
}
