import { skyVertShader, skyFragShader, sunVertShader, sunFragShader, colorVertShader, colorFragShader } from './utils/shaders.js';
import { Roomba } from './utils/Roomba.js';
import { Geometries } from './utils/Geometries.js';
import { Camera } from './utils/Camera.js';
import { createTextureLight, degToRad, depthFramebuffer, depthTextureSize, drawTextInfo, drawFine } from './utils/utils.js';
"use strict";

/*-------------------------------------------VARIABILI GLOBALI-------------------------------------------------*/
//var texture_enable=true


var timeNow = 0;

var x_light = 10;
var y_light= 200;
var z_light= 250;
var x_targetlight= 0;
var y_targetlight= 0;	
var z_targetlight= 0;
var width_projLight= 3000;
var height_projLight= 1200;
var fovLight = 12;
var lightIntensity= 2.5;
var shadowIntensity=0.9;

var drag;
var bias = -0.00005;
const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
const fieldOfViewRadians = degToRad(60); 

const up = [0, 1, 0]  //se cambia up, ruota l'intero SDR, quindi cambiano gli assi
const PHYS_SAMPLING_STEP = 20; 
var doneSomething = false; 

//matri globali
var lightWorldMatrix;
var lightProjectionMatrix;
var projectionMatrix;
var cameraMatrix;

const camera = new Camera();
const roomba = new Roomba();
const geometries = new Geometries();

function updateLightx(event, ui){
    x_light= ui.value;

}

function updateLighty(event, ui){
    y_light= ui.value;

}

function updateLightz(event, ui){
    z_light= ui.value;

}


async function main () {
    var mites = [false, false, false];
    var fine = false;
    //skybox program
    var skyboxProgramInfo = webglUtils.createProgramInfo(gl, [skyVertShader, skyFragShader])

    //sun program
    var sunProgramInfo = webglUtils.createProgramInfo(gl, [sunVertShader, sunFragShader])

    var colorProgramInfo = webglUtils.createProgramInfo(gl, [colorVertShader, colorFragShader])

    const button_camera_anteriore = document.getElementById("button_camera_anteriore");
    button_camera_anteriore.addEventListener("click", camera.change_cameraAnteriore);

    const button_camera_posteriore = document.getElementById("button_camera_posteriore");
    button_camera_posteriore.addEventListener("click", camera.change_cameraPosteriore);

    const button_camera_alta = document.getElementById("button_camera_alta");
    button_camera_alta.addEventListener("click", camera.change_cameraAlta);

    const button_camera_tv = document.getElementById("button_camera_tv");
    button_camera_tv.addEventListener("click", camera.change_cameraTv);

    await geometries.setGeo(gl);
    createTextureLight();
    webglLessonsUI.setupSlider("#LightX", {value: 10, slide: updateLightx, min: 0, max: 450, step: 1});
    webglLessonsUI.setupSlider("#LightY", {value: 200, slide: updateLighty, min: 100, max: 450, step: 1});
    webglLessonsUI.setupSlider("#LightZ", {value: 250, slide: updateLightz, min: 100, max: 350, step: 1});
    update();
    window.requestAnimationFrame(update);
    

    /*-----------------------------------------------------SERIE DI FUNZIONI UTILIIZZATE-----------------------------------------------------------*/
    function update(time){
        if(roomba.n_step * PHYS_SAMPLING_STEP <= timeNow){ //skip the frame if the call is too early
            roomba.moveRoomba(); 
            roomba.setRoombaControl(canvas, roomba);
            roomba.n_step = roomba.n_step + 1; 
            doneSomething = true;
            window.requestAnimationFrame(update);
            return; // return as there is nothing to do
        }
        timeNow = time;   
        if (doneSomething) {	
            render(time);   
            doneSomething = false;
        }
        window.requestAnimationFrame(update); // get next frame
    }

    
    function render(time) { 
        time *= 0.001;
        gl.enable(gl.DEPTH_TEST);
        // first draw from the POV of the light
        lightWorldMatrix = m4.lookAt(
            [x_light, y_light, z_light],          			// position
            [x_targetlight, y_targetlight, z_targetlight], 	// target
            up,                                				// up
        );

        lightProjectionMatrix = m4.perspective(
            degToRad(fovLight),
            width_projLight / height_projLight,
            8,  	// near: top of the frustum
            700);   // far: bottom of the frustum

        gl.bindFramebuffer(gl.FRAMEBUFFER, depthFramebuffer);
        gl.viewport(0, 0, depthTextureSize, depthTextureSize);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);


        drawScene(lightProjectionMatrix, lightWorldMatrix, m4.identity(), lightWorldMatrix, colorProgramInfo, time);

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        gl.clearColor(0, 0, 0, 1); //setta tutto a nero se 0,0,0,1
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);


        let textureMatrix = m4.identity();
        textureMatrix = m4.translate(textureMatrix, 0.5, 0.5, 0.5);
        textureMatrix = m4.scale(textureMatrix, 0.5, 0.5, 0.5);
        textureMatrix = m4.multiply(textureMatrix, lightProjectionMatrix);
        textureMatrix = m4.multiply(textureMatrix, m4.inverse(lightWorldMatrix));
                

        var projection = m4.perspective(fieldOfViewRadians, aspect, 0.1, 1200);

        // Compute the camera's matrix using look at.
        var myCamera = camera.createCamera();

        // Make a view matrix from the camera matrix.
        var view = m4.inverse(myCamera);

        const posX = roomba.position.x;
        const posY = roomba.position.y;
        const posZ = roomba.position.z;
        const facing = roomba.facing;

        camera.updateCamera(posX, posY, posZ, facing);

        /*
        if(camera.cameraLiberabis){
            camera.position = [D*1.5*Math.sin(PHI)*Math.cos(THETA),D*1.5*Math.sin(PHI)*Math.sin(THETA),D*1.5*Math.cos(PHI)];
        }
        }*/
        drawScene(projection, myCamera, textureMatrix, lightWorldMatrix, sunProgramInfo,time);
        drawSkybox(gl, skyboxProgramInfo, view, projection)
        fine ? drawFine() : drawTextInfo();
    }

    function drawRoomba(ProgramInfo){
        let u_model4 = m4.scale(m4.translation(roomba.position.x, roomba.position.y, roomba.position.z), 3, 3, 3)
        u_model4 = m4.yRotate(u_model4, degToRad(roomba.facing))
    //  u_model4 = m4.yRotate(u_model4, degToRad(180));

        webglUtils.setBuffersAndAttributes(gl, ProgramInfo, geometries.roomba.bufferInfo)
        webglUtils.setUniforms(ProgramInfo, {
            u_colorMult: [0.5, 0.5, 1, 1],
            u_world: u_model4,
            u_texture: geometries.roomba.texture,
        })
        webglUtils.drawBufferInfo(gl, geometries.roomba.bufferInfo)
        const mites_position = [geometries.mites[0].position, geometries.mites[1].position, geometries.mites[2].position];
        const debris_position = [geometries.debris[0].position, geometries.debris[1].position, geometries.debris[2].position];
        const collisions = roomba.collisionChecker(mites_position, debris_position);
        mites[0] = mites[0] ? mites[0] : collisions.mites[0];
        mites[1] = mites[1] ? mites[1] : collisions.mites[1];
        mites[2] = mites[2] ? mites[2] : collisions.mites[2];
        fine = fine ? fine : collisions.fine;
    }
    

    function drawFloor(ProgramInfo){
        let u_modelfloor = m4.identity()
        webglUtils.setBuffersAndAttributes(gl, ProgramInfo, geometries.floor.bufferInfo)
        webglUtils.setUniforms(ProgramInfo, {
            u_world: u_modelfloor,
            u_texture: geometries.floor.texture,
        })
        webglUtils.drawBufferInfo(gl, geometries.floor.bufferInfo)
    }

    function drawSkybox(gl, skyboxProgramInfo, view, projection) {
            gl.depthFunc(gl.LEQUAL) //non so perchè è necessario per lo skybox

        const viewMatrix = m4.copy(view);

        // remove translations
        viewMatrix[12] = 0;
        viewMatrix[13] = 0;
        viewMatrix[14] = 0;

        let viewDirectionProjectionMatrix = m4.multiply(projection, viewMatrix)
        let viewDirectionProjectionInverse = m4.inverse(viewDirectionProjectionMatrix)
        gl.useProgram(skyboxProgramInfo.program);
        webglUtils.setBuffersAndAttributes(gl, skyboxProgramInfo, geometries.skybox.bufferInfo)
        webglUtils.setUniforms(skyboxProgramInfo, {
            u_viewDirectionProjectionInverse: viewDirectionProjectionInverse,
            u_skybox: geometries.skybox.texture,
        })
        webglUtils.drawBufferInfo(gl, geometries.skybox.bufferInfo)
    }

    function drawScene( projectionMatrix, camera, textureMatrix, lightWorldMatrix, programInfo,time) {
        const viewMatrix = m4.inverse(camera);
        gl.useProgram(programInfo.program);
    
        if (texture_enable==true){
            webglUtils.setUniforms(programInfo, {
                u_view: viewMatrix,
                u_projection: projectionMatrix,
                u_bias: bias,
                u_textureMatrix: textureMatrix,
                u_projectedTexture: depthTexture,
                u_reverseLightDirection: lightWorldMatrix.slice(8, 11),
                u_lightDirection: m4.normalize([-1, 3, 5]),
                u_lightIntensity: lightIntensity,
                u_shadowIntensity: shadowIntensity,
            });
        }
        if(texture_enable==false){
            textureMatrix = m4.identity();
            textureMatrix = m4.scale(textureMatrix, 0, 0, 0);
            webglUtils.setUniforms(programInfo, {
                u_view: viewMatrix,
                u_projection: projectionMatrix,
                u_bias: bias,
                u_textureMatrix: textureMatrix,
                u_reverseLightDirection:lightWorldMatrix.slice(8, 11),
                u_lightDirection: m4.normalize([-1, 3, 5]),
                u_lightIntensity: lightIntensity,
                u_shadowIntensity: shadowIntensity,
            });
        }
       
        drawFloor(programInfo);
        drawRoomba(programInfo);
        geometries.table.drawObject(programInfo, {x: 1, y: 2, z: 1});
        geometries.sofa.drawObject(programInfo, {x: 15, y: 30, z: 20}, degToRad(180));
        geometries.cabinet.drawObject(programInfo, {x: 1, y: 1, z: 1});
        geometries.tv.drawObject(programInfo, {x: 10, y: 10, z: 10});
        //geometries.debris.drawObject(programInfo, {x: 10, y: 1, z: 10});
        for (let mite in geometries.mites) {
            if(!mites[mite]) geometries.mites[mite].drawObject(programInfo, {x: 4, y: 4, z: 4}, time);
        }
        for (let debris in geometries.debris) {
            geometries.debris[debris].drawObject(programInfo, {x: 10, y: 5, z: 10});
        }
    }  
}




main();