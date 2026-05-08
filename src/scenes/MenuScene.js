import BaseScene from './BaseScene.js'; // путь к BaseScene
import Data from '../data/Data.js';

export default class MenuScene extends BaseScene {
    constructor() {
        super('MenuScene');
    }

    create() {
        super.create();
        
        // Кнопка Play из атласа
        const playBtn = this.add.image(Data.gameW/2, Data.gameH/2, 'ui', 'play')
            .setInteractive({ useHandCursor: true });
        
        // 1. Анимация при наведении (Увеличение) 
        playBtn.on('pointerover', () => {
            this.tweens.add({
                targets: playBtn,
                scale: 1.1, // Увеличиваем на 10%
                duration: 100, // Очень быстро (0.1 сек)
                ease: 'Back.easeOut' // С легким «отскоком»
            });
        });

        // 2. Возврат в обычное состояние (Pointer Out)
        playBtn.on('pointerout', () => {
            this.tweens.add({
                targets: playBtn,
                scale: 1, // Возвращаем исходный размер
                duration: 100,
                ease: 'Linear'
            });
        });

        // 3. Эффект нажатия (Смена цвета или «вдавливание»)
        playBtn.on('pointerdown', () => {
            playBtn.setTint(0xcccccc); // Затемняем кнопку
            this.game.audio.playSound('clickBtn'); // Звук нажатия
        
            // Маленький эффект «пружинки» при клике
            this.tweens.add({
                targets: playBtn,
                scale: 0.95,
                duration: 50,
                yoyo: true // Сначала уменьшится, потом вернется
            });
        });

        playBtn.on('pointerup', () => {
            playBtn.clearTint(); // Убираем затемнение
            this.scene.start('GameScene'); // Переход в игру
        });


        // --- КНОПКА SOUND (Переключатель) ---
        const playerData = this.registry.get('playerData');

        let playerWantsSound = (playerData.hasBeenSaved === 1);
        this.game.audio.setSoundState(playerWantsSound);
        const soundBtn = this.add.image(Data.gameW / 2 - 100, Data.gameH / 2 + 250, 'ui',
            playerWantsSound ? 'sound' : 'nosound')
            .setInteractive({ useHandCursor: true });

        soundBtn.on('pointerdown', () => {
            playerWantsSound = !playerWantsSound;

            // Визуал кнопки всегда следует за пальцем игрока
            soundBtn.setFrame(playerWantsSound ? 'sound' : 'nosound');

            // Сохраняем желание игрока в реестр и в облако
            playerData.hasBeenSaved = playerWantsSound ? 1 : 0;
            this.registry.set('playerData', playerData);
            this.game.sdk.save({ hasBeenSaved: playerData.hasBeenSavede });            
            this.game.audio.setSoundState(playerWantsSound);
            // Анимация
            this.tweens.add({
                targets: soundBtn,
                angle: playerWantsSound ? 10 : -10,
                duration: 50,
                yoyo: true
            });
            this.game.audio.playSound('clickBtn');
        });

        // --- КНОПКА MUSIC (Переключатель) ---
        let playerWantsMusic = (playerData.isMusicPlay === 1);
        this.game.audio.setMusicState(playerWantsMusic);

        const musicBtn = this.add.image(Data.gameW / 2 + 100, Data.gameH / 2 + 250, 'ui',
            playerWantsMusic ? 'music' : 'nomusic')
            .setInteractive({ useHandCursor: true });

        musicBtn.on('pointerdown', () => {
            playerWantsMusic = !playerWantsMusic;

            // Визуал кнопки всегда следует за пальцем игрока
            musicBtn.setFrame(playerWantsMusic ? 'music' : 'nomusic');

            // Сохраняем желание игрока в реестр и в облако
            playerData.isMusicPlay = playerWantsMusic ? 1 : 0;
            this.registry.set('playerData', playerData);
            this.game.sdk.save({ isMusicPlay: playerData.isMusicPlay });            
            this.game.audio.setMusicState(playerWantsMusic);

            // Анимация
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
            this.game.sdk.gameReady(); // <==== говорим YT, что игра загрузилась
            this.game.audio.startMusic('music');
        }
    }    
}
