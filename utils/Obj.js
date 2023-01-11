import { loadObj, loadTextureFromImg, loadSkyboxTexture, degToRad } from "./utils.js";

export class Obj {
    constructor(name, position = {x: 0, y: 0, z: 0}) {
        this.name = name;
        this.position = position;
        this.bufferInfo = null;
        this.texture = null;
    }

    async loadObject(obj, texture) {
        if(this.name == 'skybox') {
            this.#loadSkyBox();
            return;
        }
        else if(this.name == 'floor') {
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

    drawObject = (ProgramInfo, scale, rotation = 0) => {
        let u_model = m4.scale(m4.translation(this.position.x, this.position.y, this.position.z), scale.x, scale.y, scale.z)
        u_model = m4.yRotate(u_model, rotation);
        webglUtils.setBuffersAndAttributes(gl, ProgramInfo, this.bufferInfo)
        webglUtils.setUniforms(ProgramInfo, {
            u_colorMult: [0.5, 0.5, 1, 1],
            u_world: u_model,
            u_texture: this.texture,
        })
        webglUtils.drawBufferInfo(gl, this.bufferInfo);
    }

    changePosition(x, y, z) {
        this.position.x = x;
        this.position.y = y;
        this.position.z = z;
    }

    drawFloor(ProgramInfo){
        let u_modelfloor = m4.identity()
        webglUtils.setBuffersAndAttributes(gl, ProgramInfo, this.bufferInfo)
        webglUtils.setUniforms(ProgramInfo, {
            u_world: u_modelfloor,
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

    drawSkybox(gl, skyboxProgramInfo, view, projection) {
        gl.depthFunc(gl.LEQUAL) //non so perchè è necessario per lo skybox

        const viewMatrix = m4.copy(view);

        // remove translations
        viewMatrix[12] = 0;
        viewMatrix[13] = 0;
        viewMatrix[14] = 0;

        let viewDirectionProjectionMatrix = m4.multiply(projection, viewMatrix)
        let viewDirectionProjectionInverse = m4.inverse(viewDirectionProjectionMatrix)
        gl.useProgram(skyboxProgramInfo.program);
        webglUtils.setBuffersAndAttributes(gl, skyboxProgramInfo, this.bufferInfo)
        webglUtils.setUniforms(skyboxProgramInfo, {
            u_viewDirectionProjectionInverse: viewDirectionProjectionInverse,
            u_skybox: this.texture,
        })
        webglUtils.drawBufferInfo(gl, this.bufferInfo)
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