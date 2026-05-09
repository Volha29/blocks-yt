import YouTube from './sdk/YouTube.js';
import AudioManager from './scripts/AudioManager.js';
import BootScene from './scenes/BootScene.js';
import PreloaderScene from './scenes/PreloaderScene.js';
import MenuScene from './scenes/MenuScene.js';
import GameScene from './scenes/GameScene.js';
import UIScene from './scenes/UIScene.js';
import GameOverScene from './scenes/GameOverScene.js';

const sdk = new YouTube();
const audio = new AudioManager();

const config = {
    type: Phaser.AUTO,
    title: 'Blocks variety of figures',
    description: '',
    parent: 'game-container',
    width: 720,
    height: 1280, 
    backgroundColor: '#CCBCB2',
    render: {
        transparent: false,
        pixelArt: false,
        roundPixels: false,
        antialias: true,
        //mipmap: true,
        mipmapFilter: 'linear'
    },
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
            game.sdk = sdk;
            game.audio = audio;
            audio.init(game);
        },
        postBoot: (game) => {
            game.getText = (key) => {
                const lang = game.registry.get('lang') || 'en';
                const data = game.cache.json.get('lang');
                return data[lang][key] || data['en'][key] || key;
            };
        }
    }
}

const game = new Phaser.Game(config);
            