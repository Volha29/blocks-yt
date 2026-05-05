import BaseScene from './BaseScene.js'; // путь к BaseScene
import Data from '../data/Data.js';

export default class UIScene extends BaseScene {
    constructor() {
        super('UIScene');
    }

    create() {
        super.create();
        
        // 1. Получаем ссылку на главную игру, чтобы слушать её события
        this.gameScene = this.scene.get('GameScene'); 
        this.score = 0;
        this.bestScore = 0;       
        this.lang = this.cache.json.get('lang')[this.registry.get('lang')];
        this.zoom = 1;


        this.mainOverlay = this.add.graphics();
        this.mainOverlay.fillStyle(0x000000, 0.7);
        this.mainOverlay.alpha = 0; // Скрыт по умолчанию
        this.mainOverlay.setInteractive(new Phaser.Geom.Rectangle(0, 0, 1, 1), Phaser.Geom.Rectangle.Contains);
            
        // 2. Отрисовываем всё, что раньше было в GameScene (Кнопки, Счётчики)
        this.createUI();

        // 3. ПОДПИСКА НА СОБЫТИЯ: Когда в игре что-то меняется, UI реагирует
        this.gameScene.events.on('updateScore', this.updateScore, this);  

        this.gameScene.events.once('showNoMoves', () => { this.gameOver(); }, this);       

        // Главное: отписываемся при закрытии сцены
        this.events.once('shutdown', () => {
            this.gameScene.events.off('updateScore', this.updateScore, this);
        });

    }    


    updateScore(scorePlus) { 
        const playAnim = this.score < this.bestScore && scorePlus > 0;
        this.score += scorePlus;
        this.scoreText.setText(this.score);

        // Добавляем анимацию пульсации
         

        if (this.score > this.bestScore) {
            this.bestScore = this.score;
            this.bestText.setText(this.bestScore);

            if (playAnim){
                this.tweens.add({
                    targets: this.bestText,
                    scale: 1.1,          // Увеличиваем на 20%
                    duration: 150,       // Время "взлета"
                    yoyo: true,          // Возврат обратно
                    ease: 'Sine.easeInOut' // Мягкий эффект отскока
               });
            }
        }
            //this.saveGame();
        // здесь только обновляем данные о скорости, но не еще не отправляем в Яндекс
        const data = this.registry.get('playerData');        
        data.score = this.score;
        data.bestScore = this.bestScore;
    }


    createUI() {       

        // 2. Создаем элементы. Координаты пока ставим 0, 
        // так как метод onResizeCustom их сразу переставит.
        
        // Кнопка Home (слева сверху)        

        const { width, height } = this.scale.gameSize;

        this.homeBtn = this.add.image(20, 20, 'ui', 'home')
                .setInteractive({ useHandCursor: true })
                .setOrigin(0,0);
        this.addButtonEffects(this.homeBtn, () => {
            this.scene.stop('GameScene'); 
            this.scene.start('MenuScene');
        });

        // Кнопка Reset (справа)
        this.resetBtn = this.add.image(0, 0, 'ui', 'reset')
            .setInteractive({ useHandCursor: true })
            .setOrigin(1,0);
        this.addButtonEffects(this.resetBtn, () => {
            this.showRestartDialog();
        });

        //Счетчики Score и BestScore
        // 1. Достаем данные игрока из реестра (те, что загрузил Yandex SDK)
        const playerData = this.registry.get('playerData');
    
        // 2. Создаем локальные числовые переменные для удобства расчетов
        this.score = playerData.score; 
        this.bestScore = playerData.bestScore; 

        // 3. Создаем визуальные объекты и сохраняем ссылки на них в this
        this.scoreText = this.add.text(Data.gameW / 2, 120, `${this.score}`, { 
            fontSize: '48px',
            fontFamily: 'EXO2',            
            fontStyle: 'bold', 
            fill: '#e97e8e' 
        }).setOrigin(0.5);
        this.scoreText.setResolution(window.devicePixelRatio || 2); //<======

        this.scoreLine = this.add.graphics()
            .fillStyle(0xb79395, 1)
            .fillRoundedRect(Data.gameW / 2 - 130, 85, 260, 7, 4);

        this.bestText = this.add.text(Data.gameW / 2, 60, `${this.bestScore}`, { 
            fontSize: '48px',
            fontFamily: 'EXO2',                           
            fontStyle: 'bold',
            fill: '#a27071' 
        }).setOrigin(0.5);     

        //this.bestText.setResolution(window.devicePixelRatio || 2); //<======

        this.events.once('postupdate', () => {this.updateElementsPosition();});    
       
    
    }
    
    //Переопределяем метод onResize из BaseScene
    onResize() {
        // Вызываем базовый ресайз (если нужен зум для UI, но обычно в UI важнее позиция)
        super.onResize();
        this.updateElementsPosition();
        //this.events.once('postupdate', () => {this.updateElementsPosition();});
    }


    updateElementsPosition() {

        // ПРОВЕРКА: если сцена выключается, системы input или камеры уже может не быть
        if (!this.scene.isActive() || !this.cameras || !this.cameras.main) {
            return;
        }       
        super.onResize(); // Получаем актуальный zoom в BaseScene
        const cam = this.cameras.main;
        this.zoom = this.currentZoom; // Берем из BaseScene
        // РУЧНОЙ РАСЧЕТ ГРАНИЦ (заменяет worldView на старте)
        // Исходим из того, что камера центрирована на 720/2, 1280/2
        const centerX = 720 / 2;
        const centerY = 1280 / 2;
    
        // Вычисляем, сколько игровых единиц помещается в текущем окне при данном зуме
        const halfWidthInWorld = (this.scale.width / 2) / this.zoom;
        const halfHeightInWorld = (this.scale.height / 2) / this.zoom;

        const left = centerX - halfWidthInWorld;
        const right = centerX + halfWidthInWorld;
        const top = centerY - halfHeightInWorld;

        const margin = 20;// / zoom; // Визуально одинаковый отступ

        if (this.homeBtn) this.homeBtn.setPosition(left + margin, top + margin);
        if (this.resetBtn) this.resetBtn.setPosition(right - margin, top + margin);
    
        // Для оверлея используем те же рассчитанные границы
        if (this.mainOverlay) {
            const width = halfWidthInWorld * 2;
            const height = halfHeightInWorld * 2;
            this.mainOverlay.clear().fillStyle(0xccbcb2, 0.6).fillRect(left, top, width, height);
            if (this.mainOverlay.input) {
                this.mainOverlay.input.hitArea.setTo(left, top, width, height);
            }
        }      

    }
    

    showRestartDialog() {        
        // 1. Создаем группу (контейнер), чтобы управлять всем окном сразу
        this.dialog = this.add.container(0, 0).setDepth(100);

        // 2. Затемнение заднего фона (Overlay)
        this.mainOverlay.alpha = 1;
        this.mainOverlay.setDepth(10);
        this.updateElementsPosition(); //<======

        // 3. Сама плашка окна
        const dialogBg = this.add.graphics();
        dialogBg.fillStyle(0xefe9e6, 1); // Белая подложка
        const dialogW = 550;
        const dialogH = 300;
        const dialogX = Data.gameW / 2 - dialogW / 2;
        const dialogY = Data.gameH / 2 - dialogH / 2;
        dialogBg.fillRoundedRect(dialogX, dialogY, dialogW, dialogH, 30);
        this.dialog.add(dialogBg);

        // 4. Текст вопроса (используем getText)
                
        const question = this.add.text(Data.gameW / 2, dialogY + 90, this.game.getText('restart'), {
            fontSize: '44px',//44
            fill: '#A66E6F',
            fontStyle: '600', // Аналог Semi-Bold'bold',
            align: 'center',
            fontFamily: 'EXO2',// Настройки тени
            shadow: {
                offsetX: 2,      // смещение по горизонтали
                offsetY: 2,      // смещение по вертикали
                color: '#A66E6F', // цвет тени (можно сделать темнее основного или черным)
                blur: 4,         // мягкость (чем больше, тем более гладкой кажется тень)
                stroke: false,   // применять ли тень к обводке
                fill: true       // применять ли тень к заливке букв
            },
            wordWrap: { width: 500 }
        }).setOrigin(0.5);
        this.dialog.add(question);
       
        
        // 5. Кнопка "НЕТ"
        const btnNo = this.add.text(Data.gameW / 2 - 100, dialogY + 210, this.game.getText('no'), {
            fontSize: '40px', fontFamily: 'EXO2', fill: '#666', fontStyle: 'bold',
            // Настройки тени
            shadow: {
                offsetX: 2,      // смещение по горизонтали
                offsetY: 2,      // смещение по вертикали
                color: '#666', // цвет тени (можно сделать темнее основного или черным)
                blur: 4,         // мягкость (чем больше, тем более гладкой кажется тень)
                stroke: false,   // применять ли тень к обводке
                fill: true       // применять ли тень к заливке букв
            }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        // 6. Кнопка "ДА"
        const btnYes = this.add.text(Data.gameW / 2 + 100, dialogY + 210, this.game.getText('yes'), {
            fontSize: '40px', fontFamily: 'EXO2', fill: '#A66E6F', fontStyle: 'bold',
            shadow: {
                offsetX: 2,      // смещение по горизонтали
                offsetY: 2,      // смещение по вертикали
                color: '#A66E6F', // цвет тени (можно сделать темнее основного или черным)
                blur: 4,         // мягкость (чем больше, тем более гладкой кажется тень)
                stroke: false,   // применять ли тень к обводке
                fill: true       // применять ли тень к заливке букв
            },
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        this.dialog.add([btnNo, btnYes]);

        // --- АНИМАЦИЯ ПОЯВЛЕНИЯ ---
        this.dialog.setAlpha(0);
        this.tweens.add({
            targets: this.dialog,
            alpha: 1,
            duration: 200
        });

        // --- ЛОГИКА КНОПОК ---
        btnNo.on('pointerdown', () => {
            this.sound.play('clickBtn');
            this.mainOverlay.alpha = 0;
            this.dialog.destroy(); // Просто удаляем окно
        });

        btnYes.on('pointerdown', () => {
            this.sound.play('clickBtn');
            this.gameScene.restartGame(); // Перезапустит вызов restarta
            this.mainOverlay.alpha = 0;
            this.dialog.destroy(); // Просто удаляем окно
            this.score = 0;
            this.scoreText.setText(this.score);
        });

        // Добавим легкое масштабирование при наведении
        [btnNo, btnYes].forEach(btn => {
            btn.on('pointerover', () => btn.setScale(1.1));
            btn.on('pointerout', () => btn.setScale(1));
        });
    }

    // если ходов больше нет
    gameOver() {
        this.sound.play('clickBtn');
        const finalScore = this.score; // Сохраняем для показа
        const data = this.registry.get('playerData');

        // Обнуляем данные вPlayerData (для следующего захода в игру)
        data.score = 0;
        data.colorArray = ""; // Очищаем сохраненное поле
        data.numBlocksPlayer = ""; // Очищаем фигуры игрока
    
        // Сохраняем в Яндекс/LocalStorage
        this.game.sdk.save(data);  
    
        // Создаем контейнер
        const popup = this.add.container(0, 0).setDepth(2000);

        this.mainOverlay.alpha = 1;
        this.mainOverlay.setDepth(10);
        this.updateElementsPosition(); //<======        

        // 2. Текст
        const title = this.add.text(Data.gameW / 2, Data.gameH / 2 - 60,
                    this.game.getText('noMoves'), {
           fontSize: '48px', fontFamily: 'EXO2', fontStyle: 'bold', fill: '#A66E6F',
            stroke: '#A66E6F', strokeThickness: 1
        }).setOrigin(0.5);

        const okBtn = this.add.text(Data.gameW / 2, Data.gameH / 2 + 50, 
                    `> ${this.game.getText('ok')} <`, {
            fontSize: '48px', fontFamily: 'EXO2', fontStyle: 'bold', fill: '#A66E6F'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        popup.add([title, okBtn]);

        // Анимация появления
        popup.setAlpha(0);
        this.tweens.add({ targets: popup, alpha: 1, duration: 300 });

        // Логика кнопки
        okBtn.on('pointerdown', () => {
            this.sound.play('clickBtn');
        
            // Сначала закрываем UI и игру, потом открываем финал
            this.scene.stop('UIScene');
            this.scene.stop('GameScene');
            this.scene.start('GameOverScene', { finalScore: finalScore });
        });

        // Эффект для кнопки
        okBtn.on('pointerover', () => okBtn.setScale(1.1));
        okBtn.on('pointerout', () => okBtn.setScale(1));
    }

    showRestartAlert() {
        this.mainOverlay.alpha = 1;
        this.mainOverlay.setDepth(10); // Чтобы был над кнопками
    }


    // Универсальная функция для анимации кнопок
    addButtonEffects(button, callback) {
        // 1. При наведении (Hover) — небольшое уменьшение и затемнение
        button.on('pointerover', () => {
            this.tweens.add({
                targets: button,
                scale: 0.9,      // Уменьшаем
                alpha: 0.8,      // Затемняем (прозрачность)
                duration: 100
            });
        });

        // 2. При уводе мыши — возврат в исходное состояние
        button.on('pointerout', () => {
            this.tweens.add({
                targets: button,
                scale: 1,
                alpha: 1,
                duration: 100
            });
        });

        // 3. При нажатии (Click)
        button.on('pointerdown', () => {
            this.sound.play('clickBtn'); // Звук клика
            // Эффект быстрой "пружинки"
            this.tweens.add({
                targets: button,
                scale: 0.8,
                duration: 50,
                yoyo: true,
                onComplete: () => {
                    if (callback) callback();
                }
            });
        });
    }

}