export default class Block extends Phaser.GameObjects.Image {
    constructor(scene, x, y, color) {
        // 'ui' — ключ атласа, 'block' — имя кадра
        super(scene, x, y, 'ui', 'block');
        this.scene = scene;

        // Настраиваем внешний вид
        this.setTint(color);
        this.setDepth(2);

        // Добавляем на сцену
        scene.add.existing(this);
    }

    // Метод для красивого исчезновения (при сборе линии)
    // удаление aBlocks[r][c]..block.destroyWithAnim  ?? block
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