import { degToRad } from "./utils.js";
const up = [0, 1, 0];
const D = 17;

//This class is used to create a camera for the scene
export class Camera {
    constructor() {
        this.position = [0, 0, 0]; //the position of the camera
        this.target = [0, 0, 0];  //the point the camera is looking at
        this.THETA = degToRad(86);
        this.PHI = degToRad(23);
        
        //variables that handle camera change
        this.cameraPosteriore = true;
        this.cameraAnteriore = false;
        this.cameraAlta = false;
        this.cameraDragging = {isDragging: false, startX: null, startY: null}; // Variabili per memorizzare le coordinate del mouse quando si fa click e se l'utente sta trascinando il mouse
        this.cameraTv = false;
    }
    
    /**
     * This method is called for creating the camera matrix
     * @returns {Float32Array} the camera matrix
     */
    createCamera() {
        const camera = m4.lookAt(this.position, this.target, up);
        textCanvas.addEventListener('mousedown', this.onMouseDown);
        textCanvas.addEventListener('mouseup', this.onMouseUp);
        textCanvas.addEventListener('mousemove', this.onMouseMove);
        return camera;
    }

    /**
     * This method is called for updating the camera position
     * @param {*} x is the x coordinate of position to update
     * @param {*} y is the y coordinate of position to update
     * @param {*} z is the z coordinate of position to update
     */
    updateCamera(x, y, z, facing) {
        if (this.cameraPosteriore) {
            this.position = [x + (D * Math.sin(degToRad(facing))), y + 7, z + (D*Math.cos(degToRad(facing)))];
            this.target = [x, y, z];
        }
        //this is used only when the user is dragging the camera
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

    /**All the following methods are used for changing the camera view */

    change_cameraAnteriore = () => {
        this.cameraAnteriore = true;
        this.cameraPosteriore = false;
        this.cameraAlta = false;
        this.cameraTv = false;
        this.cameraDragging.isDragging = false;
    }

    change_cameraPosteriore = () => {
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

    //Method for handling mouse up event
    onMouseDown = (event) => {
        this.cameraDragging.startX = event.clientX;
        this.cameraDragging.startY = event.clientY;
        this.useDragging();
        event.preventDefault();
    }
      
    //Method for handling mouse down event
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

    //Method for handling mouse up event
    onMouseUp = () => {
        this.cameraDragging.isDragging = false;
        //this.cameraPosteriore = true;
    }

}