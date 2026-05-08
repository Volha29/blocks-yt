export default class AudioManager {
    constructor() {
        this.game = null;
        this.bgMusic = null;
        this.musicVolume = 0.4;   // Громкость музыки (от 0 до 1)
        this.soundVolume = 1.0; // Громкость эффектов (от 0 до 1)
        this.isSoundPlay = true;
        this.isMusicPlay = true;
    }
    
    init(game) { this.game = game; } // Инициализация в main

    setSoundState(value){
        this.isSoundPlay = value;
    }

    setMusicState(value){
        this.isMusicPlay = value;
        this.playMusic();
    }


    // --- ГРУППА: МУЗЫКА ---
    startMusic(key) {
        if (!this.game) return;
        this.bgMusic = this.game.sound.add(key, { loop: true, volume: this.musicVolume  });
        this.playMusic();
    }

    // Тот самый метод рационального управления ресурсами
    playMusic() {
        if (!this.bgMusic || !this.game) return;

        // Если условия не позволяют играть — ставим на паузу
        if (!this.game.sdk.isAudioYTPlay || !this.isMusicPlay) {
            this.bgMusic.pause();
            return;
        }

        // Основная логика: проверяем состояние и действуем
        if (this.bgMusic.isPaused) {
            // Если на паузе — возобновляем с текущего места
            this.bgMusic.resume();
        } else if (!this.bgMusic.isPlaying) {
            // Если не играет и не на паузе (т. е. остановлена или не запускалась) — запускаем с начала
            this.bgMusic.play();
        }
        // Если уже играет — ничего не делаем

        // Устанавливаем громкость (актуально в любом случае)
        this.bgMusic.setVolume(this.musicVolume);
        console.log("Музыка включена: возобновлена или запущена с начала");
              
    }

    // --- ГРУППА: ЗВУКИ (ЭФФЕКТЫ) ---
    playSound(key, config = {}) {
        if (!this.game) return;
        if (!this.game.sdk.isAudioYTPlay) return;

        if (this.isSoundPlay) {
            config.volume = config.volume !== undefined ? config.volume : this.soundVolume;
            this.game.sound.play(key, config);
        }
    } 

}