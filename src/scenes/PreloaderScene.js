    import BaseScene from './BaseScene.js'; // путь к BaseScene
    
    export default class PreloaderScene extends BaseScene {
    constructor() {
        super('PreloaderScene');
    }

    preload() {        
        super.create();
        
        // Помещаем иконку в центр
        this.loader = this.add.image(360, 640, 'loadingIcon');
        
        // Создаем вращение вокруг центра
        this.tweens.add({
            targets: this.loader,
            angle: -360,          // Поворот на 360 градусов
            duration: 2000,      // За 2 секунды
            repeat: -1,          // Бесконечно
            ease: 'Linear'       // Равномерно
        });

        // Добавляем текст под иконкой
        this.loadingText = this.add.text(360, 640 + 180, '', {
            fontSize: '50px',
            fontStyle: 'bold',         // Толщина (жирный)
            fill: '#A66E6F',           // Цвет текста
        }).setOrigin(0.5);

        // Событие прогресса (необязательно, но полезно)
        this.load.on('progress', (value) => {
            // value — это число от 0 до 1
            this.loadingText.setText(`${Math.round(value * 100)}%`);
        });

        // Загрузка шрифта
        this.load.font('EXO2', 'assets/exo2.ttf');

        // Загрузка images
        this.load.atlas('ui', 'assets/atlas.png', 'assets/atlas.json');
        this.load.json('lang', 'assets/lang.json');

        // Загрузка звуков
        this.load.audio('clickBtn', 'assets/ButtonClick.mp3');      // Звук нажатия кнопки
        this.load.audio('clearLines', 'assets/ButtonClick.mp3');    // Звук удаления блоков
        this.load.audio('gameOver', 'assets/levelUp2.mp3');   // Звук проигрыша
    
    }
    create() {
        // 1. Сигнализируем YouTube, что игра начала работу (появился первый кадр)
        this.game.sdk.firstFrameReady(); 

        //this.time.delayedCall(1000, () => {
            this.scene.start('MenuScene');
        //});      
    }
}
