import { Obj } from "./Obj.js";

export class SceneManager {
    constructor(canvas) {
        this.roomba = new Obj("roomba");
        this.floor = new Obj("floor");
        this.mites = [new Obj("mite1", {x: -40, y: 0, z: -35}), new Obj("mite2", {x: 40, y: 0, z: 10}), new Obj("mite3", {x: 0, y: 0, z: 50}), new Obj("mite4", {x: -20, y: 0, z: -41})]; 
        //this.mites = [new Obj("mite1", {x: -40, y: 0, z: -35})]; 
        //this.bossMite = [new Obj("bossMite", {x: -20, y: 0, z: -60}), new Obj("bossMite", {x: -50, y: 0, z: 40}), new Obj("bossMite", {x: 30, y: 0, z: -5})];
        this.bossMite = [new Obj(new Obj("bossMite", {x: -50, y: 0, z: 40}))];
        this.debris = [new Obj("debris1", {x: -20, y: 0, z: -20}), new Obj("debris2", {x: -17, y: 0, z: 30}), new Obj("debris3", {x: 40, y: 0, z: 50}), new Obj("debris4", {x: 30, y: 0, z: -50})];
        this.table = new Obj("table", {x: -30, y: 6.5, z: 30}); 
        this.sofa = new Obj("sofa", {x: 30, y: 0, z: 30});
        this.cabinet = new Obj("tv_cabinet", {x: 30, y: -1, z: -25});
        this.tv = new Obj("tv", {x: 30, y: 11, z: -20});
        this.skybox = new Obj("skybox");

        this.bossInfo = {final: false, lifes: this.bossMite.length};
        this.checkMites = [];
        for(let i = 0; i < this.mites.length; i++) {
            this.checkMites.push(false);
        }
        this.gameover = false;
    }

    async setObjects() {
        await this.roomba.loadObject("resources/objs/roomba.obj", "resources/images/roomba_texture.jpg");
        await this.floor.loadObject(null, "resources/images/parquet_texture.jpg");
        await this.table.loadObject("resources/objs/table.obj", "resources/images/white_wood_texture.jpg");
        await this.sofa.loadObject("resources/objs/sofa.obj", "resources/images/sofa_texture.jpg");
        await this.cabinet.loadObject("resources/objs/tv_cabinet.obj", "resources/images/tv_cabinet_texture.jpg");
        await this.tv.loadObject("resources/objs/tv.obj", "resources/images/tv_texture.jpg");
        await this.skybox.loadObject();
        for (let mite of this.mites) {
            await mite.loadObject("resources/objs/mite.obj", "resources/images/dark_texture.jpg");
        }
        for (let debris of this.debris) {
            await debris.loadObject("resources/objs/detriti.obj", "resources/images/iron_texture.jpg");
        }
        for (let bossMite of this.bossMite) {
            await bossMite.loadObject("resources/objs/mite.obj", "resources/images/dark_texture.jpg");
        }
        
    }
    
    checkRender() {
        return this.bossInfo.lifes > 0 && !this.gameover;
    }
    
    checkWinGame() {
        return this.bossInfo.final && this.bossInfo.lifes <= 0 && !this.gameover;
    }
    
    updateGame = (roomba) => {
        //check the evolution of the game
        //check if roomba had collisions
        const mites_position = [];
        const debris_position = [];
        for(let mite in this.mites) {
            mites_position.push(this.mites[mite].position);
        }
        for(let debris in this.debris) {
            debris_position.push(this.debris[debris].position);
        }
        const life = this.bossInfo.lifes - 1;
        const collisions = roomba.collisionChecker(mites_position, debris_position, this.bossInfo.final &&  life >= 0 ? this.bossMite[life].position : null);
        this.checkMites.forEach((mite, index) => {
            this.checkMites[index] = this.checkMites[index] ? this.checkMites[index] : collisions.mites[index];
        })
        if(this.bossInfo.final) {
            if(collisions.boss)
                this.bossInfo.lifes -= 1;
        }
        this.gameover = this.gameover ? this.gameover : collisions.gameover;
        this.bossInfo.final = this.checkMites.every(element => element === true) && !this.gameover;
    }


}