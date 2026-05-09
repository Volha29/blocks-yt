export default class Block extends Phaser.GameObjects.Image {
    constructor(scene, x, y, color) {
        super(scene, x, y, 'ui', 'block');
        this.scene = scene;
        this.setTint(color);
        this.setDepth(2);
        scene.add.existing(this);
    }
    destroyWithAnim() {
        return new Promise(resolve => {
            this.scene.tweens.add({
                targets: this,
                scale: 0,
                alpha: 0,
                duration: 300,
                ease: 'Back.easeIn',
                onComplete: () => { this.destroy(); resolve(); }
            });
        });
    }
}