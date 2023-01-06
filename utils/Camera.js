const up = [0, 1, 0];

export class Camera {
    constructor() {
        this.position = [0, 0, 0] //l'oggetto che la camera sta guardando
        this.target = [0, 0, 0]  //la posizione della camera
        this.cambiaCamera = false;
        this.cameraAlta = false;
        this.cameraLibera = false;
        this.cameraTv = false;
        this.camera_posteriore = true;
    }
    
    createCamera() {
        const camera = m4.lookAt(this.position, this.target, up);
        return camera;
    }

    change_cameraAnteriore = () => {
        this.cambiaCamera = true;
        this.cameraLiberabis = false;
        this.cameraAlta = false;
        this.cameraLibera = false;
        this.camera_posteriore = true;
    }

    change_cameraPosteriore = () => {
        this.cambiaCamera = false;
        this.cameraLiberabis = false;
        this.cameraAlta = false;
        this.cameraLibera = false;
        this.camera_posteriore = true;
    }

    change_cameraAlta = () => {
        this.cameraAlta = true;
        this.cameraLiberabis = false;
        this.camera_posteriore = true;
    }

    change_cameraTv = () => {
        this.cameraTv = true;
    }
    

}