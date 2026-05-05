export default class BaseScene extends Phaser.Scene {
    constructor(config = {}) {
        super(config);
        this.W = 720;
        this.H = 1280;
        this.currentZoom = 1;
    }

    create() {
        // Слушаем изменение размеров окна
        this.scale.on('resize', this.onResize, this);

        // Удаляем слушатель, когда сцена закрывается
        this.events.on('shutdown', () => {
            this.scale.off('resize', this.onResize, this);
        });

        // Вызываем один раз при старте
        //this.events.once('postupdate', () => {this.onResize();});
        
        this.onResize();
    }   


    onResize() {
        const { width, height } = this.scale.gameSize;        
        
        // Вычисляем zoom, чтобы вписать контент
        const scaleX = width / this.W;
        const scaleY = height / this.H;

        this.currentZoom = Math.min(scaleX, scaleY);
        this.cameras.main.setZoom(this.currentZoom);
        
        // Центрируем камеру
        this.cameras.main.centerOn(this.W / 2, this.H / 2);
    }    

    

}