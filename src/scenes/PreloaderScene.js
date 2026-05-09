    import BaseScene from './BaseScene.js'; // путь к BaseScene
    
    export default class PreloaderScene extends BaseScene {
    constructor() {
        super('PreloaderScene');
    }

    preload() {        
        super.create();
        this.loader = this.add.image(360, 640, 'loadingIcon');
        this.tweens.add({
            targets: this.loader,
            angle: -360,
            duration: 2000,
            repeat: -1,
            ease: 'Linear'
        });
        this.loadingText = this.add.text(360, 640 + 180, '', {
            fontSize: '50px',
            fontStyle: 'bold',
            fill: '#A66E6F',
        }).setOrigin(0.5);
        this.load.on('progress', (value) => {
            this.loadingText.setText(`${Math.round(value * 100)}%`);
        });
        this.load.font('EXO2', 'assets/exo2.ttf');
        this.load.atlas('ui', 'assets/atlas.png', 'assets/atlas.json');
        this.load.json('lang', 'assets/lang.json');
        this.load.audio('clickBtn', 'assets/ButtonClick.mp3');
        this.load.audio('clearLines', 'assets/ButtonClick.mp3');
        this.load.audio('gameOver', 'assets/levelUp2.mp3');
        this.load.audio('music', 'assets/music.mp3');    
    }
    create() {
        this.game.sdk.firstFrameReady(); 
        this.scene.start('MenuScene');
    }
}
