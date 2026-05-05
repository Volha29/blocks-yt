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

        this.field = new Field(this);
        this.spawner = new Spawner(this);
        this.shadow = new Shadow(this);

        this.isBoardLocked = false;
        this.initInputHandlers();
        this.loadGame();           
    }  


    initInputHandlers(){
        // 1. Событие: Взяли фигурку          
        this.input.on('dragstart', (pointer, figure) => {
            Data.numMove = figure.place;

            // Если поле заблокировано (идет анимация), возвращаем фигурку назад
            if (this.isBoardLocked) {
                pointer.setDragState(0); // Останавливаем перетаскивание
                figure.x = Data.placeX[Data.numMove]; // Мгновенно возвращаем в слот
                figure.y = Data.placeY;
                figure.setScale(Data.scaleStart);
                return;
            } 
            figure.setDepth(100); // Выше всех
            this.shadow.create();
            // Анимация: Увеличение до 1 и "подпрыгивание" выше пальца
            this.tweens.add({
                targets: figure,
                scale: 1, 
                y: figure.y - 100, // Смещение вверх на 100px, чтобы палец не закрывал
                duration: 100
            });
        });

        // 2. Событие: Тащим фигурку
        this.input.on('drag', (pointer, figure, dragX, dragY) => {
            // Привязываем фигурку к пальцу, но с учетом смещения вверх
            figure.x = dragX;
            figure.y = dragY - 100;

            // вызов отрисовки тени над полем
            this.shadow.show(figure.x,figure.y); 
        });

        // 3. Событие: Отпустили фигурку
        this.input.on('dragend', async (pointer, figure) => {           
            
            const canPlace = this.field.checkCanPlace (figure.x, figure.y);      
            this.shadow.hide();
            
            if (canPlace) {
                this.game.sdk.showFullscreenAd(async () => {
                    this.sound.play('clickBtn'); 
                    this.isBoardLocked = true; // БЛОКИРУЕМ ВВОД
                    this.field.placeFigure();
                    this.events.emit('updateScore', Data.figures[Data.aType[Data.numMove]].count); 
                    figure.destroy();
                    this.spawner.figureDestroy();
                
                    // 2. Ждем удаления линий (теперь через await)
                    const scorePlus = await this.field.checkLines(); 

                    // 3. Начисляем очки                
                    if (scorePlus>0) this.events.emit('updateScore', scorePlus); // Посылаем сигнал в UIScene
                    this.isBoardLocked = false; // РАЗБЛОКИРУЕМ ВВОД
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
                    ease: 'Back.easeOut', // Эффект пружинки при возврате
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
        //console.log('Save');
        this.field.saveField();
        this.spawner.saveFigures();
        const data = this.registry.get('playerData'); 
        this.game.sdk.save(data); // единственное реальное сохранение в облако есть 
        //еще сохранение в UIСцене - в gameOver();
    }

    
    gameOver() { 
        this.events.emit('showNoMoves'); // Посылаем сигнал в UIScene        
    }  
    

}