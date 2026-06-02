import BaseScene from './BaseScene.js'; // путь к BaseScene
import Data from '../data/Data.js';

export default class UIScene extends BaseScene {
    constructor() {
        super('UIScene');
    }

    create() {
        super.create();
        this.gameScene = this.scene.get('GameScene'); 
        this.score = 0;
        this.bestScore = 0;       
        this.lang = this.cache.json.get('lang')[this.registry.get('lang')];
        this.zoom = 1;
        this.mainOverlay = this.add.graphics();
        this.mainOverlay.fillStyle(0x000000, 0.7);
        this.mainOverlay.alpha = 0;
        this.mainOverlay.setInteractive(new Phaser.Geom.Rectangle(0, 0, 1, 1), Phaser.Geom.Rectangle.Contains);
        this.createUI();
        this.gameScene.events.on('updateScore', this.updateScore, this); 
        this.gameScene.events.once('showNoMoves', () => { this.gameOver(); }, this); 
        this.events.once('shutdown', () => {
            this.gameScene.events.off('updateScore', this.updateScore, this);
        });
    } 
    updateScore(scorePlus) { 
        const playAnim = this.score < this.bestScore && scorePlus > 0;
        this.score += scorePlus;
        this.scoreText.setText(this.score);
        if (this.score > this.bestScore) {
            this.bestScore = this.score;
            this.bestText.setText(this.bestScore);
            if (playAnim){
                this.tweens.add({
                    targets: this.bestText,
                    scale: 1.1, 
                    duration: 150, 
                    yoyo: true, 
                    ease: 'Sine.easeInOut' 
               });
            }
        }
        const data = this.registry.get('playerData');        
        data.score = this.score;
        data.bestScore = this.bestScore;
    }


    createUI() {   
        this.add.text(Data.gameW / 2, Data.gameH / 2, `${Data.text}`, { 
            fontSize: '48px',
            fontFamily: 'EXO2',            
            fontStyle: 'bold', 
            fill: '#000000' 
        }).setOrigin(0.5).setDepth(100);
        

        const { width, height } = this.scale.gameSize;
        this.homeBtn = this.add.image(20, 20, 'ui', 'home')
                .setInteractive({ useHandCursor: true })
                .setOrigin(0,0);
        this.addButtonEffects(this.homeBtn, () => {
            this.scene.stop('GameScene'); 
            this.scene.start('MenuScene');
        });
        this.resetBtn = this.add.image(0, 0, 'ui', 'reset')
            .setInteractive({ useHandCursor: true })
            .setOrigin(1,0);
        this.addButtonEffects(this.resetBtn, () => {
            this.showRestartDialog();
        });
        const playerData = this.registry.get('playerData');
        this.score = playerData.score; 
        this.bestScore = playerData.bestScore; 
        this.scoreText = this.add.text(Data.gameW / 2, 120, `${this.score}`, { 
            fontSize: '48px',
            fontFamily: 'EXO2',            
            fontStyle: 'bold', 
            fill: '#e97e8e' 
        }).setOrigin(0.5);
        this.scoreText.setResolution(window.devicePixelRatio || 2); 
        this.scoreLine = this.add.graphics()
            .fillStyle(0xb79395, 1)
            .fillRoundedRect(Data.gameW / 2 - 130, 85, 260, 7, 4);
        this.bestText = this.add.text(Data.gameW / 2, 60, `${this.bestScore}`, { 
            fontSize: '48px',
            fontFamily: 'EXO2',                           
            fontStyle: 'bold',
            fill: '#a27071' 
        }).setOrigin(0.5);  
        this.events.once('postupdate', () => { this.updateElementsPosition(); });         
    }
    onResize() {
        super.onResize();
        this.updateElementsPosition();        
    }
    updateElementsPosition() {
        if (!this.scene.isActive() || !this.cameras || !this.cameras.main) {
            return;
        }       
        super.onResize();
        const cam = this.cameras.main;
        this.zoom = this.currentZoom;
        const centerX = 720 / 2;
        const centerY = 1280 / 2;
        const halfWidthInWorld = (this.scale.width / 2) / this.zoom;
        const halfHeightInWorld = (this.scale.height / 2) / this.zoom;
        const left = centerX - halfWidthInWorld;
        const right = centerX + halfWidthInWorld;
        const top = centerY - halfHeightInWorld;
        const margin = 20;
        if (this.homeBtn) this.homeBtn.setPosition(left + margin, top + margin);
        if (this.resetBtn) this.resetBtn.setPosition(right - margin, top + margin);
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
        this.dialog = this.add.container(0, 0).setDepth(100);
        this.mainOverlay.alpha = 1;
        this.mainOverlay.setDepth(10);
        this.updateElementsPosition();
        const dialogBg = this.add.graphics();
        dialogBg.fillStyle(0xefe9e6, 1);
        const dialogW = 550;
        const dialogH = 300;
        const dialogX = Data.gameW / 2 - dialogW / 2;
        const dialogY = Data.gameH / 2 - dialogH / 2;
        dialogBg.fillRoundedRect(dialogX, dialogY, dialogW, dialogH, 30);
        this.dialog.add(dialogBg);               
        const question = this.add.text(Data.gameW / 2, dialogY + 90, this.game.getText('restart'), {
            fontSize: '44px',
            fill: '#A66E6F',
            fontStyle: '600',
            align: 'center',
            fontFamily: 'EXO2',
            shadow: { offsetX: 2, offsetY: 2, color: '#A66E6F', blur: 4,
                stroke: false, fill: true},
            wordWrap: { width: 500 }
        }).setOrigin(0.5);
        this.dialog.add(question);
        const btnNo = this.add.text(Data.gameW / 2 - 100, dialogY + 210, this.game.getText('no'), {
            fontSize: '40px', fontFamily: 'EXO2', fill: '#666', fontStyle: 'bold',
            shadow: { offsetX: 2,offsetY: 2,color: '#666',blur: 4,stroke: false,fill: true}
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        const btnYes = this.add.text(Data.gameW / 2 + 100, dialogY + 210, this.game.getText('yes'), {
            fontSize: '40px', fontFamily: 'EXO2', fill: '#A66E6F', fontStyle: 'bold',
            shadow: {offsetX: 2,offsetY: 2,color: '#A66E6F',blur: 4,stroke: false,fill: true},
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        this.dialog.add([btnNo, btnYes]);
        this.dialog.setAlpha(0);
        this.tweens.add({
            targets: this.dialog,
            alpha: 1,
            duration: 200
        });
        btnNo.on('pointerdown', () => {
            this.game.audio.playSound('clickBtn');
            this.mainOverlay.alpha = 0;
            this.dialog.destroy();
        });

        btnYes.on('pointerdown', () => {
            this.game.audio.playSound('clickBtn');
            this.gameScene.restartGame();
            this.mainOverlay.alpha = 0;
            this.dialog.destroy();
            this.score = 0;
            this.scoreText.setText(this.score);
        });
        [btnNo, btnYes].forEach(btn => {
            btn.on('pointerover', () => btn.setScale(1.1));
            btn.on('pointerout', () => btn.setScale(1));
        });
    }
    gameOver() {
        this.sound.play('clickBtn');
        const finalScore = this.score;
        const data = this.registry.get('playerData');
        data.score = 0;
        data.colorArray = "";
        data.numBlocksPlayer = "";
        this.game.sdk.save(data); 
        const popup = this.add.container(0, 0).setDepth(2000);
        this.mainOverlay.alpha = 1;
        this.mainOverlay.setDepth(10);
        this.updateElementsPosition(); 
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
        popup.setAlpha(0);
        this.tweens.add({ targets: popup, alpha: 1, duration: 300 });
        okBtn.on('pointerdown', () => {
            this.game.audio.playSound('clickBtn');
            this.scene.stop('UIScene');
            this.scene.stop('GameScene');
            this.scene.start('GameOverScene', { finalScore: finalScore });
        });
        okBtn.on('pointerover', () => okBtn.setScale(1.1));
        okBtn.on('pointerout', () => okBtn.setScale(1));
    }

    showRestartAlert() {
        this.mainOverlay.alpha = 1;
        this.mainOverlay.setDepth(10);
    }
    addButtonEffects(button, callback) {
        button.on('pointerover', () => {
            this.tweens.add({
                targets: button,
                scale: 0.9,
                alpha: 0.8,
                duration: 100
            });
        });
        button.on('pointerout', () => {
            this.tweens.add({
                targets: button,
                scale: 1,
                alpha: 1,
                duration: 100
            });
        });
        button.on('pointerdown', () => {
            this.game.audio.playSound('clickBtn');
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