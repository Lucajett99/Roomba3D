import { degToRad } from "./utils.js";
const up = [0, 1, 0];
const D = 17;
export class Camera {
    constructor() {
        this.position = [0, 0, 0] //l'oggetto che la camera sta guardando
        this.target = [0, 0, 0]  //la posizione della camera;
        this.THETA = degToRad(86);
        this.PHI = degToRad(23);
        
        this.cameraPosteriore = true;
        this.cameraAnteriore = false;
        this.cameraAlta = false;
        this.cameraDragging = {isDragging: false, startX: null, startY: null}; // Variabili per memorizzare le coordinate del mouse quando si fa click e se l'utente sta trascinando il mouse
        this.cameraTv = false;
    }
    
    createCamera() {
        const camera = m4.lookAt(this.position, this.target, up);
        textCanvas.addEventListener('mousedown', this.onMouseDown);
        textCanvas.addEventListener('mouseup', this.onMouseUp);
        textCanvas.addEventListener('mousemove', this.onMouseMove);
        return camera;
    }

    updateCamera(x, y, z, facing) {
        if (this.cameraPosteriore) {
            this.position = [x + (D * Math.sin(degToRad(facing))), y + 7, z + (D*Math.cos(degToRad(facing)))];
            this.target = [x, y, z];
        }
        if (this.cameraDragging.isDragging) {
            this.position = [D * 1.5 * Math.sin(this.PHI) * Math.cos(this.THETA), D * 1.5 * Math.sin(this.PHI) * Math.sin(this.THETA), D * 1.5 * Math.cos(this.PHI)];
            this.target = [x, y, z];
        }
        if (this.cameraAnteriore && !this.cameraDragging.isDragging) {
            this.position = [x + (-D*Math.sin(degToRad(facing))), y + 20, z + (-D*Math.cos(degToRad(facing)))];
            this.target = [x, y, z - 2];
        }
        if (this.cameraAlta) {
            this.position = [0, 170, 30];
            this.target = [0, 0, 29];
        }
        if (this.cameraTv) {
            const x = 30;
            const y = 12;
            const z = -20;
            this.position = [x + (D * Math.sin(degToRad(1))), y + 10, z + (D*Math.cos(degToRad(1)))];
            this.target = [x, y + 4, z];
        }
    }

    change_cameraAnteriore = (x, y, z, facing) => {
        this.cameraAnteriore = true;
        this.cameraPosteriore = false;
        this.cameraAlta = false;
        this.cameraTv = false;
        this.cameraDragging.isDragging = false;
    }

    change_cameraPosteriore = (x, y, z, facing) => {
        this.cameraPosteriore = true;
        this.cameraAnteriore = false;
        this.cameraAlta = false;
        this.cameraTv = false;
        this.cameraDragging.isDragging = false;
    }

    change_cameraAlta = () => {
        this.cameraAlta = true;
        this.cameraAnteriore = false;
        this.cameraPosteriore = false;
        this.cameraTv = false;
        this.cameraDragging.isDragging = false;
    }

    change_cameraTv = () => {
        this.cameraTv = true;
        this.cameraAnteriore = false;
        this.cameraPosteriore = false;
        this.cameraAlta = false;
        this.cameraDragging.isDragging = false;
    }

    useDragging = () => {
        this.cameraDragging.isDragging = true;       
        this.cameraTv = false;
        this.cameraAnteriore = false;
        this.cameraPosteriore = false;
        this.cameraAlta = false;
    }

    /*--------------------Mouse events for dragging camera------------------------------------------ */

    // Funzione per gestire il click del mouse
    onMouseDown = (event) => {
        this.cameraDragging.startX = event.clientX;
        this.cameraDragging.startY = event.clientY;
        this.useDragging();
        event.preventDefault();
    }
      
    // Funzione per gestire il movimento del mouse
    onMouseMove = (event) => {
        if (!this.cameraDragging.isDragging) {
            return;
        }
        // Calcola le differenze tra le coordinate correnti del mouse e quelle del punto di partenza
        const dx = (-(event.clientX - this.cameraDragging.startX) * 2 * Math.PI) / canvas.width;
        const dy = (-(event.clientY - this.cameraDragging.startY) * 2 * Math.PI) / canvas.height;

        this.THETA += dx;
        this.PHI += dy;
        
        if (this.PHI < 0.22) this.PHI = 0.22;
        else if (this.PHI > 3.05) this.PHI = 3.05;
        if (this.THETA > 3.05) this.THETA = 3.05;
        
        this.cameraDragging.startX = event.clientX;
        this.cameraDragging.startY = event.clientY;
        event.preventDefault();
    }    

    // Funzione per gestire il rilascio del mouse
    onMouseUp = () => {
        this.cameraDragging.isDragging = false;
        //this.cameraPosteriore = true;
    }

}