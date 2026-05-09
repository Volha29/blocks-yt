export default class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
    }

    preload() {
        this.load.image('loadingIcon', 'assets/load.png');
    }

    async create() {
        const playerData = await this.game.sdk.init(this.game);
        this.registry.set('playerData', playerData);
        this.registry.set('lang', this.game.sdk.getLang());
        const container = document.getElementById('game-container');
        if (container) container.style.opacity = '1';
        this.scene.start('PreloaderScene');
    }
}
