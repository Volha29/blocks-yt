export default class AudioManager {
    constructor() {
        this.game = null;
        this.bgMusic = null;
        this.musicVolume = 1.0;
        this.soundVolume = 1.0;
        this.isSoundPlay = true;
        this.isMusicPlay = true;
    }
    
    init(game) { this.game = game; }
    setSoundState(value){ this.isSoundPlay = value; }
    setMusicState(value){ this.isMusicPlay = value; this.playMusic(); }
    startMusic(key) {
        if (!this.game) return;
        this.bgMusic = this.game.sound.add(key, { loop: true, volume: this.musicVolume  });
        this.playMusic();
    }
    playMusic() {
        if (!this.bgMusic || !this.game) return;
        if (!this.game.sdk.isAudioYTPlay || !this.isMusicPlay) {
            this.bgMusic.pause();
            return;
        }
        if (this.bgMusic.isPaused) {
            this.bgMusic.resume();
        } else if (!this.bgMusic.isPlaying) {
            this.bgMusic.play();
        }
        this.bgMusic.setVolume(this.musicVolume);              
    }

    playSound(key, config = {}) {
        if (!this.game) return;
        if (!this.game.sdk.isAudioYTPlay) return;
        if (this.isSoundPlay) {
            config.volume = config.volume !== undefined ? config.volume : this.soundVolume;
            this.game.sound.play(key, config);
        }
    } 
}