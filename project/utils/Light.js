export class Light {
    constructor() {
        this.position = {x: 10, y: 220, z: 250};
        this.target = {x: 0, y: 0, z: 0};

        this.width_projLight= 3000;
        this.height_projLight= 1200;

        this.fovLight = 12;
        this.lightIntensity= 2.5;
        this.shadowIntensity=0.9;

        this.WorldMatrix = null;
        this.ProjectionMatrix = null;
    }

    updateLightx = (event, ui) => {
        this.position.x = ui.value;
    }
    
    updateLighty = (event, ui) => {
        this.position.y = ui.value;
    
    }
    
    updateLightz = (event, ui) => {
        this.position.z = ui.value;
    
    }
}