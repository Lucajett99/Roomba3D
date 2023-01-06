import { degToRad } from "./utils.js";
const up = [0, 1, 0];
const D = 17;
export class Camera {
    constructor() {
        this.position = [0, 0, 0] //l'oggetto che la camera sta guardando
        this.target = [0, 0, 0]  //la posizione della camera;
        this.cameraAnteriore = false;
        this.cameraPosteriore = true;
        this.cameraAlta = false;
        this.cameraLibera = false;
        this.cameraTv = false;
    }
    
    createCamera() {
        const camera = m4.lookAt(this.position, this.target, up);
        return camera;
    }

    updateCamera(x, y, z, facing) {
        if (this.cameraAnteriore) {
            this.position = [x + (-D*Math.sin(degToRad(facing))), y + 20, z + (-D*Math.cos(degToRad(facing)))];
            this.target = [x, y, z];
        }
        if (this.cameraPosteriore) {
            this.position = [x + (D * Math.sin(degToRad(facing))), y + 7, z + (D*Math.cos(degToRad(facing)))];
            this.target = [x, y, z];
        }
        if (this.cameraAlta) {
            this.position = [0, 105, 2];
            this.target = [0, 0, 0];
        }
        if (this.cameraTv) {
            const x = 30;
            const y = 12;
            const z = -20;
            this.position = [x + (D * Math.sin(degToRad(0))), y + 10, z + (D*Math.cos(degToRad(0)))];
            this.target = [x, y + 4, z];
        }
    }

    change_cameraAnteriore = (x, y, z, facing) => {
        this.cameraAnteriore = true;
        this.cameraPosteriore = false;
        this.cameraAlta = false;
        this.cameraTv = false;
    }

    change_cameraPosteriore = (x, y, z, facing) => {
        this.cameraPosteriore = true;
        this.cameraAnteriore = false;
        this.cameraAlta = false;
        this.cameraTv = false;
    }

    change_cameraAlta = () => {
        this.cameraAlta = true;
        this.cameraAnteriore = false;
        this.cameraPosteriore = false;
        this.cameraTv = false;
    }

    change_cameraTv = () => {
        this.cameraTv = true;
        this.cameraAnteriore = false;
        this.cameraPosteriore = false;
        this.cameraAlta = false;
    }
    

}