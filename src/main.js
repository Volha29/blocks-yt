import YouTube from './sdk/YouTube.js';
import BootScene from './scenes/BootScene.js';
import PreloaderScene from './scenes/PreloaderScene.js';
import MenuScene from './scenes/MenuScene.js';
import GameScene from './scenes/GameScene.js';
import UIScene from './scenes/UIScene.js';
import GameOverScene from './scenes/GameOverScene.js';

// Создаем один экземпляр сервиса на всю игру
const sdk = new YouTube();

const config = {
    type: Phaser.AUTO,
    title: 'Blocks variety of figures',
    description: '',
    parent: 'game-container',
    width: 720, //1280
    height: 1280, //720
    backgroundColor: '#CCBCB2', //это цвет подложки именно зоны игры
    render: {
        transparent: false, // ГЛАВНЫЙ ПАРАМЕТР: делает холст прозрачным если true
        pixelArt: false,
        roundPixels: false,
        antialias: true,
        //mipmap: true,
        mipmapFilter: 'linear'
    },
    //resolution: window.devicePixelRatio,
    // Список сцен. ПЕРВАЯ в списке запустится автоматически
    scene: [
        BootScene, PreloaderScene, MenuScene, GameScene, UIScene, GameOverScene
    ],
    scale: {        
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    input: {
        activePointers: 1
    },
    callbacks: {
        preBoot: (game) => {
            // Сохраняем сервис в игру, чтобы достать его в любой
            //сцене через this.game.sdk
            game.sdk = sdk;
        },
        postBoot: (game) => {
            // Создаем глобальный метод для перевода
            game.getText = (key) => {
                const lang = game.registry.get('lang') || 'en';
                const data = game.cache.json.get('lang');
                return data[lang][key] || data['en'][key] || key;
            };
        }
    }
}

const game = new Phaser.Game(config);
            