import { Obj } from "./Obj.js";

export class Geometries {
    constructor(canvas) {
        this.roomba = new Obj();
        this.floor = new Obj();
        this.skybox = new Obj();
    }

    setGeo(gl) {
        //this.roomba.loadObject("resources/objs/roomba.obj", "resources/images/roomba_texture.png");
        this.loadMouse();
        this.floor.loadObject("floor","resources/images/parquet_texture.jpg");
        this.skybox.loadObject("skybox");
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