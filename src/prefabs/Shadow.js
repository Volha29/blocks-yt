import Data from '../data/Data.js';

export default class Shadow extends Phaser.GameObjects.Container {
    constructor(scene) { // все, что передано в конструктор доступно в конструкторе
        super(scene);
        this.blocks = []; // блоки для тени
        this.lastGridPos = { r: -1, c: -1 }; // Храним последнюю позицию
        for (let i = 0; i < 9; i++) {
            const block = scene.add.image(0, 0, 'ui', 'block');
            block.setAlpha(0.4); // Полупрозрачность
            block.setDepth(5);   // Над полем, под фигурками
            block.visible = false; // По умолчанию скрыты
            this.add(block);
            this.blocks.push(block);
        }
        scene.add.existing(this);
        this.setDepth(5); 
        this.offsetX;
        this.offsetY;
        this.deltaX;
        this.deltaY;
    }
        
    create() {
        this.hide();
        const figure = Data.figures[Data.aType[Data.numMove]];
        
        this.offsetX = (figure.xR - figure.xL) / 2;
        this.offsetY = figure.yD / 2;
        this.deltaX = Data.cellX / Data.cellSize + this.offsetX;
        this.deltaY = Data.cellY / Data.cellSize + this.offsetY;

        const color = Data.colors[figure.count].color;
        let k = 0;
        figure.cells.forEach(coord => {
            const x = (coord[0] - this.offsetX ) * Data.cellSize;
            const y = (coord[1] - this.offsetY ) * Data.cellSize;
            
            this.blocks[k].x = (coord[0] - this.offsetX ) * Data.cellSize;
            this.blocks[k].y = (coord[1] - this.offsetY ) * Data.cellSize;   
            
            this.blocks[k].setTint(color);// Красим спрайт
            this.blocks[k].visible = true;

            k++;
        }); 
    }

    // Основной метод обновления
    show(x, y) {
        // 1. Считаем текущую ячейку под курсором
        
        const col = Math.round(x / Data.cellSize - this.deltaX);
        const row = Math.round(y / Data.cellSize - this.deltaY);
        
        // 2. ПРОВЕРКА: Если ячейка та же самая — ничего не делаем
        if (row === this.lastGridPos.r && col === this.lastGridPos.c) {
            return;
        }
        const numType = Data.aType[Data.numMove];
            
        const xR = Data.figures[numType].xR;
        const xL = Data.figures[numType].xL;
        const yD = Data.figures[numType].yD;

        // Запоминаем новую позицию
        this.lastGridPos = { r: row, c: col };

        let canPlace = true;

        if (row >= 0 && row + yD < Data.gridSize && col - xL >= 0
            && col + xR < Data.gridSize) {            

            Data.figures[numType].cells.forEach(coord => {
                if (Data.aColors[row + coord[1]] && 
                    Data.aColors[row + coord[1]][col + coord[0]] !== 0) {
                    canPlace = false;
                }
            });

        } else {canPlace = false;}

        if (canPlace) {
            this.visible = true;
            this.x = Data.cellX + (col + this.offsetX)* Data.cellSize;
            this.y = Data.cellY + (row + this.offsetY)* Data.cellSize;
        } else {
            this.visible = false;
        }
    }

    hide(){
        this.blocks.forEach(b => b.visible = false);
        this.lastGridPos = { r: -1, c: -1 };
        this.visible = false;
    }
        
        
    
    
}