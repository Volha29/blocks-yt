export default class YouTube {
    constructor() {
        this.sdk = null;
        this.keyLocalStorage = 'ArripioTY25B'; //изменить, используя ID игры.
        this.stepsToShowFullAdv = 5; //s
        this.startICountStepsToShow = 5;  

        this.isSoundYTPlay = true;      
        
        this.playerData = { // Дефолтная структура PlayerInfo
            score: 0,
            bestScore: 0,
            colorArray: "",
            numBlocksPlayer: "",
            hasBeenSaved: 1
        };
    }

    async init(game) {

        // Передаем ссылку на игру для управления паузой
        this.game = game; 

        /* 1. Сначала ВСЕГДА загружаем данные из LocalStorage
        const local = localStorage.getItem(this.keyLocalStorage);
        if (local) {
            try {
                const localData = JSON.parse(local);
                this.playerData = { ...this.playerData, ...localData };
                console.log("Данные загружены из LocalStorage");
            } catch (e) {
                console.error("Ошибка парсинга LocalStorage", e);
            }
        }*/

        // 2. Проверяем наличие скрипта SDK
        if (typeof window.ytgame === 'undefined') {
            console.warn("ytgame SDK не найден. Работаем только с LocalStorage.");
            // все равно надо настроить завук!
            this.updateAudioState();

            return this.playerData;
        }

        try {
            //this.ysdk = await YaGames.init(); //<==
            this.sdk = window.ytgame;

            // 3. Тянем данные из облака Google/YouTube
            // Здесь используется метод loadData(), который возвращает строку
            const rawCloudData = await this.sdk.game.loadData();           
            

            if (rawCloudData) {
                try {
                    const dataToParse = rawCloudData.data || rawCloudData;
                    const cloudData = (typeof dataToParse === 'string') ? JSON.parse(dataToParse) : dataToParse;
                    this.playerData = { ...this.playerData, ...cloudData };
                
                    // Сразу обновляем LocalStorage актуальными данными из облака
                    //localStorage.setItem('playerData', JSON.stringify(this.playerData));
                    console.log("Данные синхронизированы с облаком YT");
                } catch (parseError) {
                    console.error("Ошибка парсинга данных из облака YT", parseError);
                }
            } 

            // 1. Сначала ПРИНУДИТЕЛЬНО узнаем текущее состояние звука один раз при старте
            this.isSoundYTPlay = this.sdk ? this.sdk.system.isAudioEnabled() : true;    
            // Вызываем обновление, чтобы mute в Phaser стал true, если в сейвах 0
            this.updateAudioState();


            // 4. Настраиваем обязательные слушатели пауз YouTube
            // В отличие от Яндекса, здесь методы называются onPause и onResume
            this.sdk.system.onPause(() => {
                console.log("YouTube подал сигнал: ПАУЗА");
                this.pauseGame();
            });

            this.sdk.system.onResume(() => {
                console.log("YouTube подал сигнал: ИГРАЕМ");
                this.resumeGame();
            }); 
            
            this.sdk.system.onAudioEnabledChange((isEnabled) => {
                console.log("YouTube изменил настройки звука:", isEnabled);
                this.isSoundYTPlay = isEnabled;
                this.updateAudioState();
            });
             

            return this.playerData;
        } catch (error) {
            console.error("Ошибка инициализации SDK:", error);
            // все равно надо настроить завук!
            this.updateAudioState();

            return this.playerData; 
        }        
    }

    // Аналог Yandex LoadingAPI.ready()
    firstFrameReady() {
        if (this.sdk && this.sdk.game) {
            this.sdk.game.firstFrameReady();
            console.log("YouTube SDK: First Frame Ready");
        }
    }

    // Финальная готовность
    gameReady() {
        if (this.sdk && this.sdk.game) {
            this.sdk.game.gameReady();
            console.log("YouTube SDK: Game Ready");
        }
    }

    // Отдельный вспомогательный метод для синхронизации возможности воспроизведенеия звука
    updateAudioState() {
        // 1. Узнаем, что выбрал сам игрок (из твоих playerData)
        const userWantsSound = (this.playerData.hasBeenSaved === 1);
        // 2. Итоговый mute = (YouTube запретил) ИЛИ (Пользователь запретил)
        // Если ytAudioEnabled === false, то игра ОБЯЗАНА молчать
        this.game.sound.mute = !(this.isSoundYTPlay && userWantsSound);
    }


    // вызов, обращение: this.game.yandex.save({ score: 100, bestScore: 500 });
    async save(newData) {
        // 1. Обновляем локальный объект данных в памяти
        this.playerData = { ...this.playerData, ...newData };

        /* 2. ВСЕГДА сохраняем в LocalStorage (основная точка правды)
        try {
            localStorage.setItem(this.keyLocalStorage, JSON.stringify(this.playerData));
            console.log("Данные сохранены локально");
        } catch (e) {
            console.error("Ошибка записи в LocalStorage", e);
        }*/

        // 3. Если SDK YouTube доступен — сохраняем в облако Google
        if (this.sdk) {
            try {
                //????? Превращаем ВЕСЬ объект playerData в строку (YouTube принимает только строку)
                const dataString = JSON.stringify(this.playerData);
                
                // Сохраняем в облако (аналог setData)
                await this.sdk.game.saveData(dataString);

                // 4. Отправляем лучший счет в систему YouTube
                // Это заменяет лидерборды Яндекса для внутренних нужд площадки
                this.sdk.engagement.sendScore({ value: this.playerData.bestScore });
            } catch (e) {
                console.error("Ошибка облачного сохранения", e);
            }
        }
    }

    getLang() {
        return 'en';
    }

    // Полноэкранная реклама (Interstitial)
    //this.game.yandex.showFullscreenAd();
    async showFullscreenAd(onCloseCallback) {
        this.stepsToShowFullAdv--;

        // Если еще не дошли до 0 — просто идем дальше
        if (this.stepsToShowFullAdv > 0) {
            if (onCloseCallback) await onCloseCallback();
            return;
        }

        // Если дошли до 0 — сбрасываем и пробуем показать рекламу
        this.stepsToShowFullAdv = this.startICountStepsToShow;

        
        // Если SDK нет (локальный запуск), просто сразу вызываем переход дальше
        if (!this.sdk) {
            console.log("Локальный запуск: Реклама пропущена");
            if (onCloseCallback) await onCloseCallback();
            return;
        }


        // ФЛАГ-ЗАЩИТА: чтобы не вызвать onCloseCallback дважды
        let isCalled = false;
        const finalCallback = async () => {
            if (isCalled) return;
            isCalled = true;
            if (onCloseCallback) await onCloseCallback();
        };

        // 3. Вызов рекламы YouTube
        // Внимание: у YouTube API для рекламы обычно работает через промисы или колбэки
        try {
            // Мы сами вызываем паузу ПЕРЕД вызовом рекламы
            this.pauseGame();

            // Проверяем наличие модуля рекламы (он может быть в ytgame.ads)
            if (this.sdk.ads && typeof this.sdk.ads.requestInterstitialAd() === 'function') {
            
                await this.sdk.ads.requestInterstitialAd();
            
                // Если код дошел сюда — реклама закрыта или не показана
                this.resumeGame();
                await finalCallback();
            
            } else {
                // Если метода рекламы нет в SDK (бывает на этапе тестов)
                console.warn("Метод showInterstitial не найден в SDK");
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
                    // Игрок досмотрел до конца — вызываем награду
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

    // Методы управления состоянием
    pauseGame() {
    if (this.game) {
        console.log("YT SDK: Pause");        
        // 1. Глушим звук мгновенно
        this.game.sound.mute = true;        
        // 2. Останавливаем движок (анимации, физику, таймеры)
        this.game.loop.pause();
        // 3. Сбрасываем указатели во всех активных сценах
        this.game.scene.getScenes(true).forEach(scene => {
            scene.input.resetPointers();
            scene.input.enabled = false; // Отключает возможность тащить блоки
            scene.scene.pause();        // Замораживает логику самой сцены
        }); 
        // 4. Принудительно засыпаем Web Audio (важно для мобилок)
        if (this.game.sound.context && this.game.sound.context.state === 'running') {
            this.game.sound.context.suspend();
        }
    }
}

    resumeGame() {
    if (this.game) {
        console.log("YT SDK: Resume");
        // 1. Запускаем движок обратно
        this.game.loop.resume();
        // 2. Просыпаемся Web Audio
        if (this.game.sound.context) {
            this.game.sound.context.resume();
        }         
        // 3. Используем наш п.2 для проверки звука!
        // Сами спрашиваем SDK текущее состояние и сверяем с желанием игрока
        const currentYTState = this.sdk ? this.sdk.system.isAudioEnabled() : true;
        this.updateAudioState(currentYTState);

        // 4. Чистим ввод в сценах, чтобы не было "фантомных" нажатий после паузы
        this.game.scene.getScenes(false).forEach(scene => {
            scene.scene.resume();       // Запускаем логику сцены (update, таймеры)
            scene.input.enabled = true; // Включаем обратно возможность тащить блоки
            // ------------------------------
            scene.input.resetPointers();            
        });
    }        
}



    // Gameplay API: Сообщаем, что начался активный процесс (игрок двигает блоки)
    // Как только игрок реально начал играть
    //this.game.yandex.startGameplay();
    startGameplay() {
            //console.log("Gameplay Started");
        //console.trace("Кто Gameplay Started?");
        //if (this.ysdk && this.ysdk.features.GameplayAPI) {
            //this.ysdk.features.GameplayAPI.start();
        //}
    }

    // Gameplay API: Сообщаем, что активный процесс окончен (пауза, меню, проигрыш)
    //this.game.yandex.stopGameplay();
    stopGameplay() {
            //console.log("Gameplay Stopped");
        //console.trace("Кто вызвал Gameplay Stopped?");
        //if (this.ysdk && this.ysdk.features.GameplayAPI) {
            //this.ysdk.features.GameplayAPI.stop();
        //}
    }

}
