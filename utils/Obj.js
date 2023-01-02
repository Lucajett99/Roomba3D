import { loadObj, loadTextureFromImg, loadSkyboxTexture, degToRad } from "./utils.js";

export class Obj {
    constructor(position){
        this.position = position;
        this.bufferInfo = null;
        this.texture = null;
    }

    async loadObject(obj, texture) {
        if(obj == 'skybox') {
            this.#loadSkyBox();
            return;
        }
        else if(obj == 'floor') {
            this.#loadFloor(texture);
            return;
        }
        else {
            const webglVertexData = await loadObj(obj);
            //TODO: capire come funziona questo array
            const obj_array = {
                position: {numComponents: 3, data: webglVertexData[0],},
                texcoord: {numComponents: 2, data: webglVertexData[1],},
                normal: {numComponents: 3, data: webglVertexData[2],},
            }
            this.bufferInfo = webglUtils.createBufferInfoFromArrays(gl, obj_array);
            texture ? this.texture = loadTextureFromImg(texture) : null;
        }
    }

    drawObject(ProgramInfo, position){
        let u_model4 = m4.scale(m4.translation(position.x, position.y, position.z), 3, 3, 3)
        u_model4 = m4.yRotate(u_model4, degToRad(this.facing))
        //u_model4 = m4.yRotate(u_model4, degToRad(180));

        webglUtils.setBuffersAndAttributes(gl, ProgramInfo, this.bufferInfo)
        webglUtils.setUniforms(ProgramInfo, {
            u_colorMult: [0.5, 0.5, 1, 1],
            u_world: u_model4,
            u_texture: this.texture,
        })
        webglUtils.drawBufferInfo(gl, this.bufferInfo)
    }

    #loadFloor(texture) {
		const S = 70; 		
		const H = 0; 
		const textureCoords = [ 0,0, 1,0, 0,1, 1,1,];

		const arrays_floor = {
		   position: 	{ numComponents: 3, data: [-S,H,-S, S,H,-S, -S,H,S,  S,H,S, ], },
		   texcoord: 	{ numComponents: 2, data: textureCoords, },
		   //color: 	{ numComponents: 3, data: [0.7,0.7,0.7,  0.7,0.7,0.7,  0.7,0.7,0.7,  0.7,0.7,0.7], },
		   indices: 	{ numComponents: 3, data: [0,2,1, 	2,3,1,], },
		   normal:		{numComponents: 3, data: [0,1,0,	0,1,0,	0,1,0,	0,1,0,], },
		};

		this.bufferInfo = webglUtils.createBufferInfoFromArrays(gl, arrays_floor);
        this.texture = loadTextureFromImg(texture)
        //console.log("bufferInfo_florr", bufferInfo_floor)
    }

    #loadSkyBox(){
        this.bufferInfo = webglUtils.createBufferInfoFromArrays(gl, {
           position: {
               data: new Float32Array([
                   -1, -1, // bottom-left triangle
                    1, -1,
                   -1,  1,
                   -1,  1, // top-right triangle
                    1, -1,
                    1,  1,
               ]),
               numComponents: 2,
           },
       });
       this.texture = loadSkyboxTexture();
    //console.log("bufferInfo_skybox", bufferInfo_skybox)
    }

}