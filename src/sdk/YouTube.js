import Data from '../data/Data.js';

export default class YouTube { 
    constructor() {
        this.sdk = null;
        this.stepsToShowFullAdv = 120;
        this.startICountStepsToShow = 120;
        this.isAudioYTPlay = false;//true
        this.isAudioPlayFirst = true;
        this.playerData = { 
            score: 0,
            bestScore: 0,
            colorArray: "",
            numBlocksPlayer: "",
            hasBeenSaved: 1,
            isMusicPlay: 1
        };
    }

    async init(game) {

        this.game = game; 

        if (typeof window.ytgame === 'undefined') {
            this.isAudioYTPlay = true;
            this.updateAudioState();
            return this.playerData;
        }

        try {
            this.sdk = window.ytgame;const rawCloudData = await this.sdk.game.loadData();           
            
            if (rawCloudData) {
                try {
                    const dataToParse = rawCloudData.data || rawCloudData;
                    const cloudData = (typeof dataToParse === 'string') ? JSON.parse(dataToParse) : dataToParse;
                    this.playerData = { ...this.playerData, ...cloudData };                
                    console.log("Данные синхронизированы с облаком YT");
                } catch (parseError) {
                    console.error("Ошибка парсинга данных из облака YT", parseError);
                }
            } 

            this.isAudioYTPlay = this.sdk ? this.sdk.system.isAudioEnabled() : true;

             this.sdk.system.onPause(() => {
                this.pauseGame();
            });

            this.sdk.system.onResume(() => {
                this.resumeGame();
            }); 
            
            this.sdk.system.onAudioEnabledChange((isEnabled) => {
                this.isAudioYTPlay = isEnabled;
                this.updateAudioState();
            });             

            return this.playerData;
        } catch (error) {
            this.updateAudioState();
            return this.playerData; 
        }        
    }

    setFullScreenSteps(value){
        this.stepsToShowFullAdv = value;
    }


    firstFrameReady() {
        if (this.sdk && this.sdk.game) {
            this.sdk.game.firstFrameReady();
            }
    }

    gameReady() {
        if (this.sdk && this.sdk.game) {
            this.sdk.game.gameReady();
            }
    }

    updateAudioState() {
          console.log(`84 YT this.isAudioYTPlay =${this.isAudioYTPlay}`); 
        if (Data.isMenuPlayFirst) return;
            console.log(`86 YT this.isAudioYTPlay =${this.isAudioYTPlay}`); 
        if (this.isAudioPlayFirst)
            { this.soundStartResume(); console.log(`88 YT soundStartResume `); }
            else {
                this.game.sound.mute = !(this.isAudioYTPlay);
                this.game.audio.playMusic(); console.log(`91 YT playMusic `);
                }
    }
 
    soundStartResume() { 
        this.isAudioYTPlay = this.sdk ? this.sdk.system.isAudioEnabled() : true;
           console.log(`95 YT this.isAudioYTPlay =${this.isAudioYTPlay}`); 
        if (!this.isAudioYTPlay) return;
            console.log(`97 YT this.isAudioYTPlay =${this.isAudioYTPlay}`); 
        this.game.sound.mute = !(this.isAudioYTPlay);
    
        if (this.isAudioYTPlay && this.game.sound && this.game.sound.context) {
            if (this.game.sound.context.state === 'suspended') {
                this.game.sound.context.resume()
                    .then(() => {
                        if (this.game.audio && typeof this.game.audio.startMusic === 'function') {
                            this.game.audio.startMusic('music');
                        }
                    })
                    .catch(err => {
                    console.error("YT SDK: Не удалось разбудить контекст при клике:", err);
                    });
            } else {
                if (this.game.audio && typeof this.game.audio.startMusic === 'function') {
                    this.game.audio.startMusic('music');
                }
            }
        }
        this.isAudioPlayFirst = false;
    }
    

    async save(newData) {
        this.playerData = { ...this.playerData, ...newData };

        if (this.sdk) {
            try {
                const dataString = JSON.stringify(this.playerData);                
                await this.sdk.game.saveData(dataString);
                this.sdk.engagement.sendScore({ value: this.playerData.bestScore });
            } catch (e) {
                console.error("Ошибка облачного сохранения", e);
            }
        }
    }

    getLang() {
        return 'en';
    }

    async showFullscreenAd(onCloseCallback) {
        this.stepsToShowFullAdv--;
        if (this.stepsToShowFullAdv > 0) {
            if (onCloseCallback) await onCloseCallback();
            return;
        }
        this.stepsToShowFullAdv = this.startICountStepsToShow;
        if (!this.sdk) {
            if (onCloseCallback) await onCloseCallback();
            return;
        }
        let isCalled = false;
        const finalCallback = async () => {
            if (isCalled) return;
            isCalled = true;
            if (onCloseCallback) await onCloseCallback();
        };
        try {
            this.pauseGame();

            if (this.sdk?.ads?.requestInterstitialAd) {
                await this.sdk.ads.requestInterstitialAd();
                this.resumeGame();
                await finalCallback();
            } else {            
                console.warn("Метод requestInterstitialAd не найден в SDK");
                this.resumeGame();
                await finalCallback();
            }           
            
        } catch (error) {
            console.error("Ошибка при показе рекламы YouTube:", error);
            this.resumeGame();
            await finalCallback();
        }
    }

    
    
    showRewardedVideo(onRewardCallback) {
        if (!this.ysdk) return;
        this.ysdk.adv.showRewardedVideo({
            callbacks: {
                onOpen: () => {
                    this.pauseGame();
                },
                onRewarded: () => {
                    if (onRewardCallback) onRewardCallback();
                },
                onClose: () => {
                    this.resumeGame();
                },
                onError: (e) => {
                    this.resumeGame();
                }
            }
        });
    }

    pauseGame() {
        if (this.game) {
            console.log("YT SDK: Pause");                    
            this.game.sound.mute = true;        
            this.game.loop.pause();
            this.game.scene.getScenes(true).forEach(scene => {
                scene.input.resetPointers();
                scene.input.enabled = false; 
                scene.scene.pause();        
            }); 
            if (this.game.sound.context && this.game.sound.context.state === 'running') {
                this.game.sound.context.suspend();
            }
        }
    }

    resumeGame() {
        if (this.game) {
            console.log("YT SDK: Resume");
            this.game.loop.resume();
            if (this.isAudioPlayFirst){
                this.soundStartResume();
            } else {
                if (this.game.sound.context) { this.game.sound.context.resume(); }         
                this.isAudioYTPlay = this.sdk ? this.sdk.system.isAudioEnabled() : true;
                this.updateAudioState();
                }
            this.game.scene.getScenes(false).forEach(scene => {
                scene.scene.resume();
                scene.input.enabled = true;
                scene.input.resetPointers();            
            });
        }        
    }
    startGameplay() { }    
    stopGameplay() { }
}
