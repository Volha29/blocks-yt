import Data from '../data/Data.js';
import Block from '../prefabs/Block.js';

export default class Field {
    constructor(scene, game) {
        this.scene = scene; // Ссылка на GameScene
        this.game = game;
        this.aBlocks = [];
        this.row;
        this.col;
        this.drawField();
    }
    checkCanPlace(x, y){
        const xx = (x - Data.cellX) / Data.cellSize;            
        const yy = (y - Data.cellY) / Data.cellSize;
        const numType = Data.aType[Data.numMove];            
        const xR = Data.figures[numType].xR;
        const xL = Data.figures[numType].xL;
        const yD = Data.figures[numType].yD;        
        const c = Math.round(xx - (xR - xL) / 2);
        const r = Math.round(yy - yD / 2);
        if (r >= 0 && r + yD < Data.gridSize && c - xL >= 0
            && c + xR < Data.gridSize) {            
            let canPlace = true;
            Data.figures[numType].cells.forEach(coord => {
                if (Data.aColors[r + coord[1]] && 
                    Data.aColors[r + coord[1]][c + coord[0]] !== 0) {
                    canPlace = false;
                }
            });
            if (canPlace) { this.row = r; this.col =  c; } 
            return canPlace;
        } else {return false;}
    }

    placeFigure(){        
        Data.figures[Data.aType[Data.numMove]].cells.forEach(coord => {
                const numColor = Data.figures[Data.aType[Data.numMove]].count;                               
                Data.aColors[this.row + coord[1]][this.col + coord[0]] = numColor; 
                this.aBlocks[this.row + coord[1]][this.col + coord[0]] = 
                new Block (this.scene,
                        this.xFromCol (this.col + coord[0]), 
                        this.yFromRow (this.row + coord[1]), 
                        Data.colors[numColor].color);                
            });
    }
    
    async checkLines(){ 
        let rowsToClear = [];
        let colsToClear = [];
        for (let r = 0; r < Data.gridSize; r++) {
            let isLine = true;
            for (let c = 0; c < Data.gridSize; c++) {
                if (Data.aColors[r][c] === 0 ) {
                    isLine = false;
                    break;
                }
            }
            if (isLine) rowsToClear.push(r);
        }
        for (let c = 0; c < Data.gridSize; c++) {
            let isLine = true;
            for (let r = 0; r < Data.gridSize; r++) {
                if (Data.aColors[r][c] === 0 ) {
                    isLine = false;
                    break;
                }
            }
            if (isLine) colsToClear.push(c);
        }        
        if (rowsToClear.length > 0 || colsToClear.length > 0) {
            await this.deleteLines(rowsToClear, colsToClear);
        }
        const p = Data.gridSize * (rowsToClear.length + colsToClear.length);
        return p - rowsToClear.length * colsToClear.length;
    }

    async deleteLines(rowsToClear, colsToClear) {
        let promises = [];
        rowsToClear.forEach(r => {
            for (let c = 0; c < Data.gridSize; c++) {
                if (this.aBlocks[r][c]) {
                    promises.push(this.aBlocks[r][c].destroyWithAnim());
                    this.aBlocks[r][c] = null;
                    Data.aColors[r][c] = 0;
                }                
            }
        });
        colsToClear.forEach(c => {
            for (let r = 0; r < Data.gridSize; r++) {
                if (this.aBlocks[r][c]) {
                    promises.push(this.aBlocks[r][c].destroyWithAnim());
                    this.aBlocks[r][c].destroyWithAnim();
                    this.aBlocks[r][c] = null;
                    Data.aColors[r][c] = 0;
                };
            }
        });
        this.game.audio.playSound('gameOver');
        if (promises.length > 0) {
            await Promise.all(promises);
        }
    }   
    xFromCol (col){ return Data.cellX + col * Data.cellSize; }
    yFromRow (row){ return Data.cellY + row * Data.cellSize; }
    saveField(){        
        const data = this.scene.registry.get('playerData');
        let str = "";
        for (let r = 0; r < Data.gridSize; r++) {
            for (let c = 0; c < Data.gridSize; c++) {
                str += Data.aColors[r][c];
            }
        }
        data.colorArray = str;        
    }

    loadField(){
        const data = this.scene.registry.get('playerData');
        let line = data.colorArray;
        if (!line || line.length === 0) {
            for (let r = 0; r < Data.gridSize; r++) {
                this.aBlocks [r] = [];
                for (let c = 0; c < Data.gridSize; c++) {
                    Data.aColors[r][c] = 0;
                    this.aBlocks[r][c] = null;
                }
            }
        } else {
            let k = 0;
            for (let r = 0; r < Data.gridSize; r++) {
                this.aBlocks [r] = [];
                for (let c = 0; c < Data.gridSize; c++) {
                    let val = (line[k] !== undefined) ? Number(line[k]) : 0;
                    Data.aColors[r][c] = val;                    
                    if (Data.aColors [r][c] === 0){
                        this.aBlocks[r][c] = null;
                        } else {
                            this.aBlocks[r][c] = new Block (this.scene,
                                this.xFromCol (c), this.yFromRow (r),
                                Data.colors[Data.aColors [r][c]].color); 
                        };
                    k++;
                }
            }
        }    
    }

    resetField(){
        for (let r = 0; r < Data.gridSize; r++) {
            for (let c = 0; c < Data.gridSize; c++) {
                if (this.aBlocks[r][c] !== null){
                    this.aBlocks[r][c].destroy();
                    this.aBlocks[r][c] = null;
                }                         
            };                    
        }
        this.loadField();
    }
   

    drawField(){
        const fieldBG = this.scene.add.nineslice(
            Data.fieldX, Data.fieldY, 
            'ui', 'field',
            Data.fieldSize, Data.fieldSize,
            30, 30, 30, 30 
        );
        fieldBG.setDepth(0);        
        for (let r = 0; r < Data.gridSize; r++) {           
            for (let c = 0; c < Data.gridSize; c++) {                
                const x = Data.cellX + c * Data.cellSize;
                const y = Data.cellY + r * Data.cellSize;                
                const cell = this.scene.add.image(x, y, 'ui', 'blockField');               
                cell.setDepth(1);
            }
        }
    }    
}