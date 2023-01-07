const floor_bound = {x1: 67.8, x2: -67.8, z1: 67.7, z2: -67.7};
//The friction value is a value in the range [0,1]. The friction controls the percentage of speed preserved 
//Smaller value results in bigger friction, larger value results in smaller friction    
export class Roomba {
    constructor(canvas){
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
        
        
       
        if(this.#checkBound("x", floor_bound) && this.#checkBound("z", floor_bound)) {
            //Update position as position = position + velocity * delta t (delta t constant)
            this.position.x += this.speed.x;
            this.position.y += this.speed.y;
            this.position.z += this.speed.z;
        }
    }


    #checkBound(axis, boundCoords) {
        switch(axis) {
            case "x":
                return this.position.x + this.speed.x <= boundCoords.x1 && this.position.x + this.speed.x >= boundCoords.x2;
            case "z":
                return this.position.z + this.speed.z <= boundCoords.z1 && this.position.z + this.speed.z >= boundCoords.z2;
            default:
                return false;
        }
    }
    

    collisionChecker(mites_position, debris_position) {
        var mites = [false, false, false];
        var fine = false;

        for(let i = 0; i<mites_position.length; i++) {
            if (this.position.x >= mites_position[i].x -6 && this.position.x <= mites_position[i].x + 6
                && this.position.z >= mites_position[i].z -6 && this.position.z <= mites_position[i].z + 6) {
                mites[i] = true;
            }
        }

        for(let i = 0; i < debris_position.length; i++) {
            if (this.position.x >= debris_position[i].x - 3 && this.position.x <= debris_position[i].x + 3
                && this.position.z >= debris_position[i].z - 3 && this.position.z <= debris_position[i].z + 3) {
                fine = true;
            }
        }



        return {mites, fine};
                /*if (this.position.x >= -31 && this.position.x <= -19 
            && this.position.z >= -21 && this.position.z <= -9) {
                morte=1;
            }
    
        if (this.position.x >= 29 && this.position.x <= 41
            && this.position.z >= 14 && this.position.z <= 26) {
                morte=1;
                
            }
    
            if (this.position.x >= 6 && this.position.x <= 18
                && this.position.z >= -16 && this.position.z <= -4) {
                    morte=1;
                    
                }
    
        if (this.position.x >= 3 && this.position.x <= 17.5
            && this.position.z >= 23 && this.position.z <= 36.5) {
                morte=1;
                
            }
    
        if (this.position.x >= -5.5 && this.position.x <= 5
            && this.position.z >= -15 && this.position.z <= -4
            && cartella1==true && cartella2==true && cartella3==true) {
                morte=1;
            }
        
            if (this.position.x >= 0 && this.position.x <= 12
                && this.position.z >= -41 && this.position.z <= -29) {
                cartella1=true;
               }
    
        if (this.position.x >= 27 && this.position.x <= 37
            && this.position.z >= -14 && this.position.z <= -2) {
            cartella2=true;
            
            }
            
           
            if (this.position.x >= -21 && this.position.x <= -9
                && this.position.z >= 29 && this.position.z <= 41) {
                cartella3=true;
            }
    
                if (this.position.x >= -6 && this.position.x <= 6
                    && this.position.z >= -35 && this.position.z <= -23 && numcartella==3) {
                    pacco=true;
                    
                    }*/    
          
    }


    setRoombaControl(canvas, roomba){
        window.addEventListener("keydown", function (event) {
			switch (event.key) {
                case "w":
                    roomba.keyPressed.w = true;
					break;

                case "s":
                    roomba.keyPressed.s = true;
                    break;

                case "a":
                    roomba.keyPressed.a = true;
                    break;
   
                case "d":
                    roomba.keyPressed.d = true;
                    break; 
			}
		});

        window.addEventListener("keyup", function (event) {
			switch (event.key) {
                case "w":
                    roomba.keyPressed.w = false;
					break;

                case "s":
                    roomba.keyPressed.s = false;
                    break;

                case "a":
                    roomba.keyPressed.a = false;
                    break;
   
                case "d":
                    roomba.keyPressed.d = false;
                    break; 
			}
		});

    }
}