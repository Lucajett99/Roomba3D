import { skyVertShader, skyFragShader, vertShader, fragShader, colorVertShader, colorFragShader } from './utils/shaders.js';
import { Roomba } from './utils/Roomba.js';
import { SceneManager } from './utils/SceneManager.js';
import { Camera } from './utils/Camera.js';
import { Light } from './utils/Light.js';
import { createTextureLight, getManipulationPanel, degToRad, depthFramebuffer, depthTexture, depthTextureSize, drawInfo, drawGameover, drawWin } from './utils/utils.js';
"use strict";

/*-------------------------------------------VARIABILI GLOBALI-------------------------------------------------*/
var timeNow = 0; //timeNow is the time of the last frame
var bias = -0.00005; //bias for the shadow
const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight; //aspect of viewport
const fieldOfViewRadians = degToRad(60); //field of view in y axis.
const up = [0, 1, 0]  //se cambia up, ruota l'intero SDR, quindi cambiano gli assi
const PHYS_SAMPLING_STEP = 20; 

var doneSomething = false; 

const camera = new Camera();
const roomba = new Roomba();
const sceneManager = new SceneManager();
const light = new Light();
/*-------------------------------------------------------------------------------------------------------------- */

async function main () {
    //skybox program
    var skyboxProgramInfo = webglUtils.createProgramInfo(gl, [skyVertShader, skyFragShader])
    //main program
    var programInfo = webglUtils.createProgramInfo(gl, [vertShader, fragShader])
    var colorProgramInfo = webglUtils.createProgramInfo(gl, [colorVertShader, colorFragShader])

    //load objects with their textures
    await sceneManager.setObjects();
    //this is called for shadows
    createTextureLight();
    //get manipulation (lights, shadows, camera) panel
    getManipulationPanel();    

    //the following lines are for the manipulation panel
    webglLessonsUI.setupSlider("#Light_X", {value: 10, slide: light.updateLightx, min: 0, max: 450, step: 1});
    webglLessonsUI.setupSlider("#Light_Y", {value: 220, slide: light.updateLighty, min: 100, max: 450, step: 1});
    webglLessonsUI.setupSlider("#Light_Z", {value: 250, slide: light.updateLightz, min: 100, max: 450, step: 1});

    const button_camera_anteriore = document.getElementById("button_camera_anteriore");
    button_camera_anteriore.addEventListener("click", camera.change_cameraAnteriore);

    const button_camera_posteriore = document.getElementById("button_camera_posteriore");
    button_camera_posteriore.addEventListener("click", camera.change_cameraPosteriore);

    const button_camera_alta = document.getElementById("button_camera_alta");
    button_camera_alta.addEventListener("click", camera.change_cameraAlta);

    const button_camera_tv = document.getElementById("button_camera_tv");
    button_camera_tv.addEventListener("click", camera.change_cameraTv);

    const switch_shadow = document.getElementById("switch_shadow");
    switch_shadow.addEventListener('change', () => {shadow_enable = !shadow_enable;});
    
    //start the animation
    update();
    const animation = window.requestAnimationFrame(update);
    //set the loading screen invisible after 5 seconds
    const loadingScreen = document.querySelector('.loading-screen');
    setTimeout(function() {
        loadingScreen.style.display = 'none';
    }, 5000);
    

/*-----------------------------------------------------SERIE DI FUNZIONI UTILIIZZATE-----------------------------------------------------------*/
    /**
     * This function is called every frame to draw the scene
     * @param {*} time is the time of the frame 
     */
    function update(time){
        if(roomba.n_step * PHYS_SAMPLING_STEP <= timeNow){ //skip the frame if the call is too early
            const position = roomba.moveRoomba();
            //update the position of the roomba in sceneManager for the drawing
            sceneManager.roomba.changePosition(position.x , position.y, position.z);
            //with this function roomba can be controlled with the keyboard or touch (if we are on a mobile device)
            roomba.setRoombaControl(canvas, roomba);
            roomba.n_step = roomba.n_step + 1; 
            doneSomething = true;
            window.requestAnimationFrame(update);
            return; // return as there is nothing to do
        }
        timeNow = time;  
        //thisi is executed only if the frame is not skipped
        if (doneSomething) {	
            render(time);
            doneSomething = false;
        }
        window.requestAnimationFrame(update); // get next frame
    }

    /**
     * This function is used to configure and render the scene
     * @param {*} time is the time of the frame
     */
    function render(time) { 
        time *= 0.001;
        gl.enable(gl.DEPTH_TEST);
        // first draw from the POV of the light
        light.WorldMatrix = m4.lookAt(
            [light.position.x, light.position.y, light.position.z],
            [light.target.x, light.target.y, light.target.y],
            up,                                				
        );

        //this is the projection matrix of the light
        light.ProjectionMatrix = m4.perspective(
            degToRad(light.fovLight),
            light.width_projLight / light.height_projLight,
            8,  	// near: top of the frustum
        700);   // far: bottom of the frustum

        gl.bindFramebuffer(gl.FRAMEBUFFER, depthFramebuffer);
        gl.viewport(0, 0, depthTextureSize, depthTextureSize);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        drawScene(light.ProjectionMatrix, light.WorldMatrix, m4.identity(), light.WorldMatrix, colorProgramInfo, time);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        gl.clearColor(0, 0, 0, 1); //setta tutto a nero se 0,0,0,1
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);


        //the textureMatrix is a matrix that is used to transform the coordinates of the vertices for applying a texture
        let textureMatrix = m4.identity();
        textureMatrix = m4.translate(textureMatrix, 0.5, 0.5, 0.5);
        textureMatrix = m4.scale(textureMatrix, 0.5, 0.5, 0.5);
        //These last two operations allow you to transform the coordinates of the vertices for applying the texture so that it is correctly projected onto the objects.
        textureMatrix = m4.multiply(textureMatrix, light.ProjectionMatrix);
        textureMatrix = m4.multiply(textureMatrix, m4.inverse(light.WorldMatrix));

        var projection = m4.perspective(fieldOfViewRadians, aspect, 0.1, 1200);

        // Compute the camera's matrix using look at.
        var myCamera = camera.createCamera();

        // Make a view matrix from the camera matrix.
        var view = m4.inverse(myCamera);

        //check if the prospective of the camera is changed
        camera.updateCamera(roomba.position.x, roomba.position.y, roomba.position.z, roomba.facing);

        //check if the game is over or if the player has won
        if(sceneManager.checkRender()) {
            //draw the 2D graphics for the game info
            drawInfo(sceneManager.checkMites, sceneManager.bossInfo.lifes);
            //draw the skybox
            sceneManager.skybox.drawSkybox(gl, skyboxProgramInfo, view, projection);
            //draw the scene
            drawScene(projection, myCamera, textureMatrix, light.WorldMatrix, programInfo,time);
        }
        else {
            //if the game is over draw the gameover screen otherwise draw the win screen
            sceneManager.gameover ? drawGameover(animation) : drawWin(animation);
        }

    }    

    /**
     * This function is used to draw the scene
     * @param {*} projectionMatrix is a matrix that is used to determinate the perspective of the camera
     * @param {*} camera is the lookAt matrix 
     * @param {*} textureMatrix is the matrix that is used to transform the coordinates of the vertices for applying a texture
     * @param {*} lightWorldMatrix is thr matrix representing the position and orientation of light in 3D space
     * @param {*} programInfo is the rendering program
     * @param {*} time is the time of the frame
     */
    function drawScene(projectionMatrix, camera, textureMatrix, lightWorldMatrix, programInfo,time) {
        //for a view matrix take the inverse of lookAt matrix
        //make a view matrix from the camera matrix
        const viewMatrix = m4.inverse(camera);
        gl.useProgram(programInfo.program);
    
        //check if the shadows are active
        if (shadow_enable == true){
            webglUtils.setUniforms(programInfo, {
                u_view: viewMatrix,
                u_projection: projectionMatrix,
                u_bias: bias,
                u_textureMatrix: textureMatrix,
                u_projectedTexture: depthTexture,
                u_reverseLightDirection: lightWorldMatrix.slice(8, 11),
                u_lightDirection: m4.normalize([-1, 3, 5]),
                u_lightIntensity: light.lightIntensity,
                u_shadowIntensity: light.shadowIntensity,
            });
        }
        if(shadow_enable == false){
            textureMatrix = m4.identity();
            textureMatrix = m4.scale(textureMatrix, 0, 0, 0);
            webglUtils.setUniforms(programInfo, {
                u_view: viewMatrix,
                u_projection: projectionMatrix,
                u_bias: bias,
                u_textureMatrix: textureMatrix,
                u_reverseLightDirection: lightWorldMatrix.slice(8, 11),
                u_lightDirection: m4.normalize([-1, 3, 5]),
                u_lightIntensity: light.lightIntensity,
                u_shadowIntensity: light.shadowIntensity,
            });
        }
       
        //the following lines are used to draw all objects in the scene
        sceneManager.floor.drawFloor(programInfo);        
        sceneManager.roomba.drawObject(programInfo, {x: 3, y: 3, z: 3}, degToRad(roomba.facing));
        //this function is used to check if roomba had collisions
        sceneManager.updateGame(roomba);
        sceneManager.table.drawObject(programInfo, {x: 1, y: 1, z: 1});
        sceneManager.sofa.drawObject(programInfo, {x: 15, y: 30, z: 20}, degToRad(180));
        sceneManager.cabinet.drawObject(programInfo, {x: 1, y: 1, z: 1});
        sceneManager.tv.drawObject(programInfo, {x: 10, y: 10, z: 10});

        //check if the Boss is active
        if(!sceneManager.bossInfo.final) {
            //draw all the mites
            for (let mite in sceneManager.mites) {
                if(!sceneManager.checkMites[mite]) sceneManager.mites[mite].drawObject(programInfo, {x: 2.5, y: 2.5, z: 2.5}, time);
            }
            //draw all the debris
            for (let debris in sceneManager.debris) {
                sceneManager.debris[debris].drawObject(programInfo, {x: 10, y: 20, z: 10});
            }
        } else {
            //if Boss is still alive draw the boss and the debris
            if(sceneManager.bossInfo.lifes > 0) {
                for (let debris in sceneManager.debris) {
                    sceneManager.debris[debris].drawObject(programInfo, {x: 10, y: 20, z: 10});
                }
                sceneManager.bossMite[sceneManager.bossInfo.lifes - 1].drawObject(programInfo, {x: 20, y: 20, z: 20}, time);
            }
        }
    }  
}


main();
