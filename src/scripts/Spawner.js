import Data from '../data/Data.js';
import Figure from '../prefabs/Figure.js';

export default class Spawner {
    constructor(scene) {
        this.scene = scene;
        this.aFigures = [null, null, null];
        this.drawPlaces();
    }
    
    figureDestroy(){ this.aFigures [Data.numMove] = null; }

    spawnNextFigure(numPlace){
        let num;
        if (numPlace === 0) {
            num = Phaser.Math.Between(0, 14);
        } else {
            const p = Phaser.Math.Between(0, Data.figures.length - 1);
            num = p % Data.figures.length;
            }   
        Data.aType [numPlace] = num;
        this.spawn (num, numPlace);
        Data.numMove = -1;    
    }

    checkFiguresCanPlace(){
        let canPlace = false;
        for (let i = 0; i < 3; i++){
            const figure = this.aFigures[i];
            if (figure && figure.active) {
                if (figure.checkCanPlace()) {
                    canPlace = true;
                }  
            }
        }
        return canPlace;    
    }    
    spawn(numType, numPlace) { // i = type of Figure, k - num of Place
        this.aFigures [numPlace] = new Figure(this.scene, numPlace, Data.figures[numType],
            Data.colors[Data.figures[numType].count].color);
    }
    saveFigures(){
        const data = this.scene.registry.get('playerData');
        data.numBlocksPlayer = Data.aType.slice(0, 3).join(',');
    }

    loadFigures(){
        const data = this.scene.registry.get('playerData');        
        let line = data.numBlocksPlayer;
        if (!line || line.length === 0) 
            {
                for (let numPlace = 0; numPlace < 3; numPlace++){
                    this.spawnNextFigure(numPlace);
                   }
            } else {                           
                const numbers = line
                    .split(',') 
                    .filter(Boolean)
                    .map(Number); 
        
                for (let numPlace = 0; numPlace < 3; numPlace++){
                    Data.aType[numPlace] = (numbers[numPlace] !== undefined) ? numbers[numPlace] : Phaser.Math.Between(0, Data.figures.length - 1);
                    this.spawn(Data.aType[numPlace], numPlace); 
                }
            }
        this.checkFiguresCanPlace();
    }
    resetFigures(){
        for (let i = 0; i < 3; i++) {
            if (this.aFigures[i] !== null){
                this.aFigures[i].destroy();
                this.aFigures[i] = null;                                         
            };                    
         }
        this.loadFigures();
    }
    drawPlaces(){ 
        for (let i = 0; i < 3; i++) {
            const place = this.scene.add.image(Data.placeX[i], Data.placeY, 'ui', 'place');
        }        
    }
}