import { loadObj, loadTextureFromImg, loadSkyboxTexture, degToRad } from "./utils.js";

//This class is used to create an object for the scene and is used for laoding and drawing the object
export class Obj {
    constructor(name, position = {x: 0, y: 0, z: 0}) {
        this.name = name; //the name of the object
        this.position = position; //the position of the object
        this.bufferInfo = null; //the bufferInfo of the object
        this.texture = null; //the texture of the object
    }

    /**
     * This method is used to load an object from a local file
     * @param {String} obj is the path of the obj file
     * @param {String} texture is the path of the texture file
     * @returns null
     */
    async loadObject(obj, texture) {
        //for the skybox and the floor we have to load the obj and the texture in a different way
        if(this.name == 'skybox') {
            this.loadSkyBox();
            return;
        }
        else if(this.name == 'floor') {
            this.loadFloor(texture);
            return;
        }
        else {
            //load the obj from a local file
            const webglVertexData = await loadObj(obj);
            const obj_array = {
                position: {numComponents: 3, data: webglVertexData[0],},
                texcoord: {numComponents: 2, data: webglVertexData[1],},
                normal: {numComponents: 3, data: webglVertexData[2],},
            }
            this.bufferInfo = webglUtils.createBufferInfoFromArrays(gl, obj_array);
            //load the texture from a local file
            this.texture = texture ? loadTextureFromImg(texture) : null;
        }
    }

    /**
     * This method is used to draw the object
     * @param {ProgramInfo} the webgl programInfo
     * @param {scale} the scale of the object
     * @param {rotation} the rotation of the object (optional)
     */
    drawObject = (ProgramInfo, scale, rotation = 0) => {
        //scale the object and translate it to the specified position
        let u_model = m4.scale(m4.translation(this.position.x, this.position.y, this.position.z), scale.x, scale.y, scale.z)
        u_model = m4.yRotate(u_model, rotation);
        webglUtils.setBuffersAndAttributes(gl, ProgramInfo, this.bufferInfo)
        webglUtils.setUniforms(ProgramInfo, {
            u_colorMult: [0.7, 0.7, 0.7, 1.0] ,
            u_world: u_model,
            u_texture: this.texture,

        });
        webglUtils.drawBufferInfo(gl, this.bufferInfo);
    }

    //This method is used change the position of the object (it is used only for roomba object)
    changePosition(x, y, z) {
        this.position.x = x;
        this.position.y = y;
        this.position.z = z;
    }

    //This method is used to draw the floor
    drawFloor(ProgramInfo){
        let u_modelfloor = m4.identity()
        webglUtils.setBuffersAndAttributes(gl, ProgramInfo, this.bufferInfo)
        webglUtils.setUniforms(ProgramInfo, {
            u_world: u_modelfloor,
            u_texture: this.texture,
        })
        webglUtils.drawBufferInfo(gl, this.bufferInfo)
    }

    //This method is used to load the floor obj manually
    loadFloor(texture) {
		const S = 70; 		
		const H = 0; 
		const textureCoords = [ 0,0, 1,0, 0,1, 1,1,];

		const arrays_floor = {
		   position: 	{ numComponents: 3, data: [-S,H,-S, S,H,-S, -S,H,S,  S,H,S,], },
		   texcoord: 	{ numComponents: 2, data: textureCoords, },
		   indices: 	{ numComponents: 3, data: [0,2,1, 	2,3,1,], },
		   normal:		{ numComponents: 3, data: [0,1,0,	0,1,0,	0,1,0,	0,1,0,], }, // the triangles are oriented upward
		};

		this.bufferInfo = webglUtils.createBufferInfoFromArrays(gl, arrays_floor);
        //load the texture from a local file
        this.texture = loadTextureFromImg(texture)
    }

    //This method is used to draw the skybox
    drawSkybox(gl, skyboxProgramInfo, view, projection) {
        //is used to ensure that objects farther away are drawn last and thus covered by those closer to them
        gl.depthFunc(gl.LEQUAL)

        const viewMatrix = m4.copy(view);

        //remove translations because the skybox must always stay in the same place
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

    //This method is used to load the skybox obj manually
    loadSkyBox(){
        this.bufferInfo = webglUtils.createBufferInfoFromArrays(gl, {
           position: {
            //quadrato di dimensioni 2x2
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
       //load the texture from a cube map texture
       this.texture = loadSkyboxTexture();
    }

}