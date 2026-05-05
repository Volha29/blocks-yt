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
            this.sound.play('clickBtn'); // Звук нажатия
        
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

        // 1. Узнаем желание игрока из сейва
        let playerWantsSound = (playerData.hasBeenSaved === 1);

        // 3. Итоговое состояние кнопки при ЗАПУСКЕ сцены
        // Кнопка показывает "sound", если ИГРОК хочет звук (даже если YT его сейчас блокирует)
        // Это нужно, чтобы игрок видел свою настройку.
        const soundBtn = this.add.image(Data.gameW / 2, Data.gameH / 2 + 250, 'ui',
            playerWantsSound ? 'sound' : 'nosound')
            .setInteractive({ useHandCursor: true });

        soundBtn.on('pointerdown', () => {
            playerWantsSound = !playerWantsSound;
            const soundValue = playerWantsSound ? 1 : 0;

            // Визуал кнопки всегда следует за пальцем игрока
            soundBtn.setFrame(playerWantsSound ? 'sound' : 'nosound');

            // Сохраняем желание игрока в реестр и в облако
            playerData.hasBeenSaved = soundValue;
            this.registry.set('playerData', playerData);

            // ВАЖНО: вызываем save. 
            // Внутри твоего YouTube.js метод save вызовет updateAudioState, 
            // который и установит финальный this.sound.mute!
            this.game.sdk.save({ hasBeenSaved: soundValue });
            
            this.game.sdk.updateAudioState();

            // Анимация
            this.tweens.add({
                targets: soundBtn,
                angle: playerWantsSound ? 10 : -10,
                duration: 50,
                yoyo: true
            });

            // Звуковой отклик: сработает только если mute в итоге стал false
            //if (playerWantsSound)
            this.sound.play('clickBtn');
        });

        // 4. Добавляем "живое" обновление кнопки
        if (this.game.sdk.sdk) {
            this.game.sdk.sdk.system.onAudioEnabledChange((isEnabled) => {
                // Если YouTube принудительно выключил звук на площадке, 
                // мы можем сделать кнопку полупрозрачной (alpha 0.5), 
                // но кадр (sound/nosound) пусть показывает желание игрока.
             soundBtn.alpha = isEnabled ? 1 : 0.5;
            });
        }

        if (Data.isMenuPlayFirst){
            Data.isMenuPlayFirst = false;
            this.game.sdk.gameReady(); // <==== говорим YT, что игра загрузилась
        }
    }    
}
