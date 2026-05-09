import Data from '../data/Data.js';

export default class Figure extends Phaser.GameObjects.Container {
    constructor(scene, k, figure, color) { 
        super(scene, Data.placeX[k], Data.placeY);
        this.place = k;
        this.numType  = Data.aType[k];
        const offsetX = (figure.xR - figure.xL) / 2;
        const offsetY = figure.yD / 2;       
        figure.cells.forEach(coord => {
            const x = (coord[0] - offsetX ) * Data.cellSize;
            const y = (coord[1] - offsetY ) * Data.cellSize;
            const block = scene.add.image(x, y, 'ui', 'block');           
            block.setTint(color);
            this.add(block);            
        });
        this.setSize(Data.placeSize/Data.scaleStart, Data.placeSize/Data.scaleStart);
        this.setScale(Data.scaleStart);    
        this.setInteractive({        
            hitAreaCallback: Phaser.Geom.Rectangle.Contains,            
            draggable: true
        });
        scene.input.setDraggable(this);
        scene.add.existing(this);        
        this.setDepth(10); 
    }
    checkCanPlace(){
        const xR = Data.figures[this.numType].xR;
        const xL = Data.figures[this.numType].xL;
        const yD = Data.figures[this.numType].yD;

        for (let r = 0; r < Data.gridSize - yD; r++){
            for (let c = xL; c < Data.gridSize - xR; c++){
                if (this.canPlaceInThisCell(r,c)){
                    this.setAlpha(1);
                    return true;
                }
            }
        }
        this.setAlpha(0.5); 
        return false;        
    }

    canPlaceInThisCell(r,c){
        const cells = Data.figures[this.numType].cells;
        for (let i = 0; i < cells.length; i++) {
            const coord = cells[i];            
            if (Data.aColors[r + coord[1]][c + coord[0]] !== 0) {
               return false;            
            }
        }
        return true;               
    }    
}