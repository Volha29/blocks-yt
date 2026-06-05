import BaseScene from './BaseScene.js';
import Data from '../data/Data.js';

export default class MenuScene extends BaseScene {
    constructor() {
        super('MenuScene');
    }
    create() {
        super.create();
        const playBtn = this.add.image(Data.gameW/2, Data.gameH/2, 'ui', 'play')
            .setInteractive({ useHandCursor: true });
        playBtn.on('pointerover', () => {
            this.tweens.add({
                targets: playBtn,
                scale: 1.1,
                duration: 100,
                ease: 'Back.easeOut'
            });
        });
        playBtn.on('pointerout', () => {
            this.tweens.add({
                targets: playBtn,
                scale: 1,
                duration: 100,
                ease: 'Linear'
            });
        });
        playBtn.on('pointerdown', () => {
            playBtn.setTint(0xcccccc);
            this.game.audio.playSound('clickBtn');
            this.tweens.add({
                targets: playBtn,
                scale: 0.95,
                duration: 50,
                yoyo: true
            });
        });

        playBtn.on('pointerup', () => {
            playBtn.clearTint(); 
            this.scene.start('GameScene'); 
        });
        const playerData = this.registry.get('playerData');
        let playerWantsSound = (playerData.hasBeenSaved === 1);
        this.game.audio.setSoundState(playerWantsSound);
        const soundBtn = this.add.image(Data.gameW / 2 - 100, Data.gameH / 2 + 250, 'ui',
            playerWantsSound ? 'sound' : 'nosound')
            .setInteractive({ useHandCursor: true });

        soundBtn.on('pointerdown', () => {
            playerWantsSound = !playerWantsSound;
            soundBtn.setFrame(playerWantsSound ? 'sound' : 'nosound');
            playerData.hasBeenSaved = playerWantsSound ? 1 : 0;
            this.registry.set('playerData', playerData);
            this.game.sdk.save({ hasBeenSaved: playerData.hasBeenSavede });            
            this.game.audio.setSoundState(playerWantsSound);
            this.tweens.add({
                targets: soundBtn,
                angle: playerWantsSound ? 10 : -10,
                duration: 50,
                yoyo: true
            });
            this.game.audio.playSound('clickBtn');
        });        
        let playerWantsMusic = (playerData.isMusicPlay === 1);
        this.game.audio.setMusicState(playerWantsMusic);
        const musicBtn = this.add.image(Data.gameW / 2 + 100, Data.gameH / 2 + 250, 'ui',
            playerWantsMusic ? 'music' : 'nomusic')
            .setInteractive({ useHandCursor: true });
        musicBtn.on('pointerdown', () => {
            playerWantsMusic = !playerWantsMusic;
            musicBtn.setFrame(playerWantsMusic ? 'music' : 'nomusic');
            playerData.isMusicPlay = playerWantsMusic ? 1 : 0;
            this.registry.set('playerData', playerData);
            this.game.sdk.save({ isMusicPlay: playerData.isMusicPlay });            
            this.game.audio.setMusicState(playerWantsMusic);
            this.tweens.add({
                targets: musicBtn,
                angle: playerWantsSound ? 10 : -10,
                duration: 50,
                yoyo: true
            });
            this.game.audio.playSound('clickBtn');
        }); 
        if (Data.isMenuPlayFirst){
            Data.isMenuPlayFirst = false;
            this.game.sdk.gameReady();            
            this.input.once('pointerdown', () => { this.game.sdk.soundStartResume();});            
        }
    }    
}
