import BaseScene from './BaseScene.js'; // путь к BaseScene

import Data from '../data/Data.js';
import Field from '../scripts/Field.js';
import Spawner from '../scripts/Spawner.js';
import Shadow from '../prefabs/Shadow.js';

export default class GameScene extends BaseScene {
    constructor() {
        super('GameScene');         
    }
 
    create() {         
        super.create();
        this.scene.launch('UIScene');
        this.field = new Field(this, this.game);
        this.spawner = new Spawner(this);
        this.shadow = new Shadow(this);
        this.isBoardLocked = false;
        this.initInputHandlers();
        this.loadGame();           
    }  


    initInputHandlers(){     
        this.input.on('dragstart', (pointer, figure) => {
            Data.numMove = figure.place;
            if (this.isBoardLocked) {
                pointer.setDragState(0);
                figure.x = Data.placeX[Data.numMove];
                figure.y = Data.placeY;
                figure.setScale(Data.scaleStart);
                return;
            } 
            figure.setDepth(100);
            this.shadow.create();
            this.tweens.add({
                targets: figure,
                scale: 1, 
                y: figure.y - 100,
                duration: 100
            });
        });
        this.input.on('drag', (pointer, figure, dragX, dragY) => {
            figure.x = dragX;
            figure.y = dragY - 100;
            this.shadow.show(figure.x,figure.y); 
        });
        this.input.on('dragend', async (pointer, figure) => { 
            const canPlace = this.field.checkCanPlace (figure.x, figure.y);      
            this.shadow.hide();
            if (canPlace) {
                this.game.sdk.showFullscreenAd(async () => {
                    this.game.audio.playSound('clickBtn'); 
                    this.isBoardLocked = true;
                    this.field.placeFigure();
                    this.events.emit('updateScore', Data.figures[Data.aType[Data.numMove]].count); 
                    figure.destroy();
                    this.spawner.figureDestroy();
                    const scorePlus = await this.field.checkLines();
                    if (scorePlus>0) this.events.emit('updateScore', scorePlus); 
                    this.isBoardLocked = false; 
                    this.spawner.spawnNextFigure(Data.numMove);                
                    if (!this.spawner.checkFiguresCanPlace()) { this.gameOver();}
                    else {this.saveGame();}
                });

            } else {
                
                    this.tweens.add({
                    targets: figure,
                    x: Data.placeX[Data.numMove],
                    y: Data.placeY,
                    scale: Data.scaleStart,
                    duration: 200,
                    ease: 'Back.easeOut',
                    onComplete: () => { 
                        figure.setDepth(2); 
                        Data.numMove = -1;
                        }
                    });                
            }            
        });
    }     

    loadGame(){ 
       for (let r = 0; r < Data.gridSize; r++){
            Data.aColors [r] = [];
            for (let c = 0; c < Data.gridSize; c++){
                Data.aColors [r][c] = 0;
            }
        }
        this.field.loadField();
        this.spawner.loadFigures();
    }

    restartGame(){
        const data = this.registry.get('playerData'); 
        data.score = 0;
        data.colorArray ="";
        data.numBlocksPlayer = "";
        this.game.sdk.save(data);
        this.field.resetField();
        this.spawner.resetFigures(); 
    }

    saveGame(){
        this.field.saveField();
        this.spawner.saveFigures();
        const data = this.registry.get('playerData'); 
        this.game.sdk.save(data);
    }

    
    gameOver() { this.events.emit('showNoMoves'); }   

}