import BaseScene from './BaseScene.js'; // путь к BaseScene
import Data from '../data/Data.js';

export default class GameOverScene extends BaseScene {
    constructor() { super('GameOverScene'); }    
    
    init(data) {
        this.displayScore = data.finalScore || 0;
    }
    
    create() {
        this.cameras.main.setZoom(1);
        this.cameras.main.setScroll(0, 0);
        const playerData = this.registry.get('playerData');
        this.container = this.add.container(0, 0);
        const bgW = 550;
        const bgH = 550;
        const bgX = - bgW / 2;
        const bgY = - bgH / 2;        
        const bg = this.add.graphics();
        bg.fillStyle(0xefe9e6, 1);
        bg.fillRoundedRect(bgX, bgY, bgW, bgH, 40);
        const bestLabel = this.add.text(0, bgY + 90, this.game.getText('best'), {
            fontSize: '40px', fontFamily: 'EXO2', fontStyle: 'bold', fill: '#A66E6F',
            shadow: { offsetX: 2, offsetY: 2, color: '#A66E6F', blur: 4, stroke: false, fill: true }
        }).setOrigin(0.5).setResolution(2);

        const bestScore = this.add.text(0, bgY + 170, playerData.bestScore, {
            fontSize: '48px', fontFamily: 'EXO2', fontStyle: 'bold', fill: '#A66E6F',
            shadow: { offsetX: 2, offsetY: 2, color: '#A66E6F', blur: 4, stroke: false, fill: true }
        }).setOrigin(0.5).setResolution(2);

        const scoreLabel = this.add.text(0, bgY + 270, this.game.getText('score'), {
            fontSize: '40px', fontFamily: 'EXO2', fontStyle: 'bold', fill: '#E97E8E',
            shadow: { offsetX: 2, offsetY: 2, color: '#E97E8E', blur: 4, stroke: false, fill: true }
        }).setOrigin(0.5).setResolution(2);

        const scoreVal = this.add.text(0, bgY + 330, this.displayScore, {
            fontSize: '44px', fontFamily: 'EXO2', fontStyle: 'bold', fill: '#E97E8E',
            shadow: { offsetX: 2, offsetY: 2, color: '#E97E8E', blur: 4, stroke: false, fill: true }
        }).setOrigin(0.5).setResolution(2);
        
        const restartBtn = this.add.image(0, bgY + 460, 'ui', 'reset')
            .setInteractive({ useHandCursor: true });

        restartBtn.on('pointerdown', async () => {
            this.game.audio.playSound('clickBtn');
            restartBtn.disableInteractive();
            this.game.sdk.showFullscreenAd(async () => {
                this.scene.start('GameScene');
            });
        });
        this.addHoverEffect(restartBtn);
        this.container.add([bg, bestLabel, bestScore, scoreLabel, scoreVal, restartBtn]);
        this.events.once('postupdate', () => {this.updateElementsPosition();});
        this.scale.on('resize', this.updateElementsPosition, this);
        this.events.once('shutdown', () => {
            this.scale.off('resize', this.updateElementsPosition, this);
        });
    }

    updateElementsPosition() {
        if (!this.scene.isActive() || !this.container) return;
        const { width, height } = this.scale.displaySize;
        const scale = Math.min(width / Data.gameW, height / Data.gameH);
        this.container.setPosition(width / 2, height / 2);
        this.container.setScale(scale);
    }

    addHoverEffect(btn) {
        btn.on('pointerover', () => btn.setScale(btn.scale * 1.1));
        btn.on('pointerout', () => btn.setScale(btn.scale / 1.1));
    }
}
