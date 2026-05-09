export default class BaseScene extends Phaser.Scene {
    constructor(config = {}) {
        super(config);
        this.W = 720;
        this.H = 1280;
        this.currentZoom = 1;
    }

    create() {
        this.scale.on('resize', this.onResize, this);
        this.events.on('shutdown', () => {
            this.scale.off('resize', this.onResize, this);
        });
        this.onResize();
    }   

    onResize() {
        const { width, height } = this.scale.gameSize;
        const scaleX = width / this.W;
        const scaleY = height / this.H;
        this.currentZoom = Math.min(scaleX, scaleY);
        this.cameras.main.setZoom(this.currentZoom);
        this.cameras.main.centerOn(this.W / 2, this.H / 2);
    }
}