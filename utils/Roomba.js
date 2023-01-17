import { objs_bounds, floor_bounds } from "./utils.js";


//The friction value is a value in the range [0,1]. The friction controls the percentage of speed preserved 
//Smaller value results in bigger friction, larger value results in smaller friction    
export class Roomba {
    constructor(){
        this.position = {x: 0, y: 0, z: 0}; // x, y, z 
        this.speed = {x: 0, y: 0, z: 0}; //x, y, z
        this.friction = {x: 0.8, y: 1, z: 0.99 }; //grande attrito sulla X, nullo sulla y, piccolo sulla z
        this.facing = 0;
        this.steering = 0;
        this.n_step = 0;
        this.maxAcceleration  = 0.005;
        this.grip = 0.35; // quanto il facing macchina si adegua velocemente allo sterzo
        this.velSterzo = 3.2;         // A
        this.velRitornoSterzo = 0.84; // B, sterzo massimo = A*B / (1-B)
        //Dict to track which key is being pressed
        this.keyPressed = { w: false, a: false, s: false, d: false }
    }
    
    //Do a physics step, independent from the rendering. 
    moveRoomba(){
        //Speed in space
        var roombaSpeed = {x : 0, y : 0, z : 0}; //x, y, z
        //From speed world frame to speed car frame
        var cosf = Math.cos(this.facing * Math.PI / 180.0);
        var sinf = Math.sin(this.facing * Math.PI / 180.0);
        roombaSpeed.x = +cosf*this.speed.x - sinf*this.speed.z;
        roombaSpeed.y = this.speed.y;
        roombaSpeed.z = +sinf*this.speed.x + cosf*this.speed.z;
        
        //Steering handling
        if(this.keyPressed.a) this.steering += this.velSterzo;
        if(this.keyPressed.d) this.steering -= this.velSterzo;
        this.steering *= this.velRitornoSterzo; //goingBackToLockedSteering
        
        if(this.keyPressed.w) roombaSpeed.z -= this.maxAcceleration;
        if(this.keyPressed.s) roombaSpeed.z += this.maxAcceleration;
        
        //Friction handling
        roombaSpeed.x *= this.friction.x;
        roombaSpeed.y *= this.friction.y;
        roombaSpeed.z *= this.friction.z;
        //MISSING ROTAZIONE MOZZO RUOTE
        
        // l'orientamento del mouse segue quello dello sterzo
        // (a seconda della velocita' sulla z)
        this.facing = this.facing - (roombaSpeed.z * this.grip) * this.steering;
        
        //Back to speed coordinate world
        this.speed.x = +cosf * roombaSpeed.x + sinf * roombaSpeed.z;
        this.speed.y = roombaSpeed.y;
        this.speed.z = -sinf * roombaSpeed.x + cosf * roombaSpeed.z;
        
        
        let x = this.position.x;
        let y = this.position.y;
        let z = this.position.z;
        let collision = false;
        for(let bound in objs_bounds) {
            if(!collision)
                collision = this.#checkBounds(objs_bounds[bound]) && !collision;
        }
        if(this.#checkBounds(floor_bounds) && !collision) {
            this.position.x = x = this.position.x + this.speed.x;
            this.position.y = y = this.position.y + this.speed.y;
            this.position.z = z = this.position.z + this.speed.z;
        }
        return {x: x, y: y, z: z};
    }

    
    collisionChecker(mites_position, debris_position, bossPosition) {
        const mites = [];
        var gameover = false;
        var boss = false;
        mites_position.forEach(index => {
            mites.push(false);
        });
        
        for(let i = 0; i < mites_position.length; i++) {
            if (this.position.x >= mites_position[i].x -6 && this.position.x <= mites_position[i].x + 6
                && this.position.z >= mites_position[i].z -6 && this.position.z <= mites_position[i].z + 6) {
                    mites[i] = true;
                }
        }

        for(let i = 0; i < debris_position.length; i++) {
            if (this.position.x >= debris_position[i].x - 5 && this.position.x <= debris_position[i].x + 5
                && this.position.z >= debris_position[i].z - 5 && this.position.z <= debris_position[i].z + 5) {
                gameover = true;
            }
        }
        
        if(bossPosition) {
            if (this.position.x >= bossPosition.x - 8 && this.position.x <= bossPosition.x + 8
                && this.position.z >= bossPosition.z - 8 && this.position.z <= bossPosition.z + 8) {
                    boss = true;
                }
        }
        return {mites, gameover, boss};
    }
    
    setRoombaControl = () => {
        //Check if the device is a mobile or a desktop
        if( (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) ) {
            window.addEventListener("touchstart", this.touchDownEvents, true);
            window.addEventListener("touchend", this.touchUpEvents, true);
        }
        else {
            window.addEventListener("keydown", this.keyDownEvents, true);
            window.addEventListener("keyup", this.keyUpEvents, true);
        }
    }

    keyDownEvents = (event) => {
        switch (event.key) {
            case "w":
                this.keyPressed.w = true;
                break;
            case "s":
                this.keyPressed.s = true;
                break;  
            case "a":
                this.keyPressed.a = true;
                break;
            case "d":
                this.keyPressed.d = true;
                break; 
        }
    }

    keyUpEvents = (event) => {
        switch (event.key) {
            case "w":
                this.keyPressed.w = false;
                break;
                
            case "s":
                this.keyPressed.s = false;
                break;
            case "a":
                this.keyPressed.a = false;
                break;
                
            case "d":
                this.keyPressed.d = false;
                break; 
        }
    }
                    
    touchDownEvents = (e) => {
        this.touch = e.touches[0];
        const x = this.touch.pageX - canvas.offsetLeft;
        const y = this.touch.pageY - canvas.offsetTop;      
        // THE W KEY
        if (x >= 109 && y >= 284 && x <= 127 && y <= 310) this.keyPressed.w = true;
        // THE S KEY
        if (x >= 109 && y >= 356 && x <= 131 && y <= 380) this.keyPressed.s = true;
        // THE A KEY
        if (x >= 42 && y >= 356 && x <= 62 && y <= 380) this.keyPressed.a = true;
        // THE D KEY
        if (x >= 178 && y >= 356 && x <= 199 && y <= 380) this.keyPressed.d = true;
    }

    touchUpEvents = () => {
        const x = this.touch.pageX - canvas.offsetLeft;
        const y = this.touch.pageY - canvas.offsetTop;
        // THE W KEY
        if (x >= 109 && y >= 284 && x <= 127 && y <= 310) this.keyPressed.w = false;
        // THE S KEY
        if (x >= 109 && y >= 356 && x <= 131 && y <= 380) this.keyPressed.s = false;
        // THE A KEY
        if (x >= 42 && y >= 356 && x <= 62 && y <= 380) this.keyPressed.a = false;
        // THE D KEY
        if (x >= 178 && y >= 356 && x <= 199 && y <= 380) this.keyPressed.d = false;
    }

    #checkBounds(boundsCoords) {
        return this.position.x + this.speed.x <= boundsCoords.x1 && this.position.x + this.speed.x >= boundsCoords.x2 &&
            this.position.z + this.speed.z <= boundsCoords.z1 && this.position.z + this.speed.z >= boundsCoords.z2;
    }
    
}

    