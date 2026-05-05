export default class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
    }

    preload() {
        // Загружаем только иконку загрузки
        this.load.image('loadingIcon', 'assets/load.png');
    }

    async create() { 
        // 1. Инициализируем Яндекс SDK и ждем данные
        // Метод init() в вашем классе Yandex должен возвращать данные игрока
        const playerData = await this.game.sdk.init(this.game);

        // 2. Сохраняем данные в реестр Phaser для доступа из других сцен
        this.registry.set('playerData', playerData);
        this.registry.set('lang', this.game.sdk.getLang());

        // 3. Появление контейнера
        const container = document.getElementById('game-container');
        if (container) container.style.opacity = '1';

        // 4. Переходим к загрузке основных ассетов
        this.scene.start('PreloaderScene');
    }
}
