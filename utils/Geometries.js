import { Obj } from "./Obj.js";

export class Geometries {
    constructor(canvas) {
        this.roomba = new Obj("roomba");
        this.floor = new Obj("floor");
        this.mites = [new Obj("mite1", {x: -40, y: 0, z: -35}), new Obj("mite2", {x: -30, y: 0, z: -30}), new Obj("mite3", {x: -20, y: 0, z: -41})]; 
        this.debris = [new Obj("debris1", {x: -20, y: 0, z: -20}), new Obj("debris2", {x: 5, y: 0, z: 30}), new Obj("debris3", {x: 40, y: 0, z: 50})];
        this.table = new Obj("table", {x: -30, y: 0, z: 30}); 
        this.sofa = new Obj("sofa", {x: 30, y: 0, z: 30});
        this.cabinet = new Obj("tv_cabinet", {x: 30, y: 0, z: -25});
        this.tv = new Obj("tv", {x: 30, y: 12, z: -20});
        this.skybox = new Obj("skybox");
    }

    async setGeo(gl) {
        await this.roomba.loadObject("resources/objs/roomba.obj", "resources/images/dark_texture.jpg");
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
    }
}



/*
function loadRoomba() {
    loadObj("resources/objs/roomba.obj")
    //TODO: capire come funziona questo array
    const roomba_array = {
        position: {numComponents: 3, data: webglVertexData[0],},
        texcoord: {numComponents: 2, data: webglVertexData[1],},
        normal: {numComponents: 3, data: webglVertexData[2],},
    }
    roomba.bufferInfo = webglUtils.createBufferInfoFromArrays(gl, roomba_array);
    //roomba.texture = loadTextureFromImg("resources/images/roomba_texture.png")
    console.log(roomba)
}
*/
/*
function drawMouse(ProgramInfo){
    let u_model4 = m4.scale(m4.translation(posX, posY, posZ), 3, 3, 3)
    u_model4 = m4.yRotate(u_model4, degToRad(facing))
   // u_model4 = m4.yRotate(u_model4, degToRad(180));
    webglUtils.setBuffersAndAttributes(gl, ProgramInfo, bufferInfo_mouse)
    webglUtils.setUniforms(ProgramInfo, {
       // u_colorMult: [0.5, 0.5, 1, 1],
        u_world: u_model4,
        u_texture: texture_mouse,
    })
    webglUtils.drawBufferInfo(gl, bufferInfo_mouse)
}*/