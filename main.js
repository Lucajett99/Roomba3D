import {vertShader, fragShader, skyVertShader, skyFragShader, sunVertShader, sunFragShader, colorVertShader, colorFragShader} from './utils/shaders.js';
import { Roomba } from './utils/Roomba.js';
import { Geometries } from './utils/Geometries.js';
import { createTextureLight, degToRad, depthFramebuffer, depthTextureSize } from './utils/utils.js';
"use strict";

/*-------------------------------------------VARIABILI GLOBALI-------------------------------------------------*/
//var texture_enable=true;
let cameraTarget = [0, 0, 0]     //eye location of the camera dove guardiamo
let cameraPosition = [0, 0, 0] 
var camera_posteriore=true;
var cambiaCamera=false;
var cameraAlto=false;

var n_step = 0;
var timeNow = 0;
var D = 17;

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

var cameraLiberabis = false;
var cameraLibera = false; // drag del mouse
var drag;
var bias = -0.00005;
const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
const fieldOfViewRadians = degToRad(60); 

let up = [0, 1, 0]  //se cambia up, ruota l'intero SDR, quindi cambiano gli assi
const PHYS_SAMPLING_STEP = 20; 
var doneSomething = false; 

//matri globali
var lightWorldMatrix;
var lightProjectionMatrix;
var projectionMatrix;
var cameraMatrix;

const roomba = new Roomba();
const geometries = new Geometries();


async function main () {
    const meshProgramInfo = webglUtils.createProgramInfo(gl, [vertShader, fragShader]);

    //skybox program
    var skyboxProgramInfo = webglUtils.createProgramInfo(gl, [skyVertShader, skyFragShader])

    //sun program
    var sunProgramInfo = webglUtils.createProgramInfo(gl, [sunVertShader, sunFragShader])

    var colorProgramInfo = webglUtils.createProgramInfo(gl, [colorVertShader, colorFragShader])

    const image_info = new Image();
    image_info.src = "resources/images/background_info.jpg";
    image_info.addEventListener('load', function() {});

    const image_wasd= new Image(); 
    image_wasd.src = "resources/images/wasd.png";
    image_wasd.addEventListener('load', function() {});

    const image_frecce = new Image();
    image_frecce.src = "resources/images/frecce.png";
    image_frecce.addEventListener('load', function() {});

    await geometries.setGeo(gl);
    createTextureLight();
    update();
    window.requestAnimationFrame(update);
    

    /*-----------------------------------------------------SEREI DI FUNZIONI UTILIIZZATE-----------------------------------------------------------*/
    function update(time){
        if(n_step * PHYS_SAMPLING_STEP <= timeNow){ //skip the frame if the call is too early
            roomba.moveRoomba(); 
            roomba.setRoombaControl(canvas, roomba);
            n_step++; 
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
        var camera = m4.lookAt(cameraPosition, cameraTarget, up);

        // Make a view matrix from the camera matrix.
        var view = m4.inverse(camera);

        const posX = roomba.position.x;
        const posY = roomba.position.y;
        const posZ = roomba.position.z;
        const facing = roomba.facing;


        if (camera_posteriore){
            cameraPosition = [posX +(D*Math.sin(degToRad(facing))), posY+7, posZ+(D*Math.cos(degToRad(facing)))]            
        }

        if(cameraLiberabis){
            cameraPosition = [D*1.5*Math.sin(PHI)*Math.cos(THETA),D*1.5*Math.sin(PHI)*Math.sin(THETA),D*1.5*Math.cos(PHI)];
        }

        if(cambiaCamera && !cameraLiberabis){   
            cameraPosition = [posX+(-D*Math.sin(degToRad(facing))), posY+20, posZ+(-D*Math.cos(degToRad(facing)))];		
        }

        if (cameraAlto){
            cameraPosition=[0,105,2];
        }
            
        if(!cameraAlto){
            cameraTarget = [posX, posY, posZ]}
        else{
            cameraTarget = [0,0,0];
        }
        drawScene(projection,camera, textureMatrix, lightWorldMatrix, sunProgramInfo,time);
        drawSkybox(gl, skyboxProgramInfo, view, projection)
        drawTextInfo();
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
    }


    function drawTextInfo(){
        if( (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) ) {
        ctx.drawImage(wasd_keys, 80, 330);
        ctx.drawImage(freccie, 540, 330);  
        //ctx.drawImage(button1, 300, 450);
        //ctx.drawImage(button3, 440, 450);  
        ctx.drawImage(image_info, 871.5, 17);
        } 
        else{ctx.drawImage(image_info, 871.5, 1);}
        //testo
        ctx.font = '14pt Calibri';
        ctx.fillStyle = 'black';
        ctx.fillText("Prova a raccogliere tutta", 880, 50);
        ctx.fillText("la polvere ", 880, 70);
        ctx.font = '14pt Calibri';
        ctx.fillStyle = 'red';
        //numcartella=cartella1+cartella2+cartella3;
        var numcartella = 0;
        if ((numcartella)==3){
            ctx.fillStyle = 'green';
            ctx.fillText("          Complimenti!!!!!", 880, 100);
            ctx.fillText("    Hai raccolto tutte le cartelle", 880, 120);
            ctx.font = '14pt Calibri'; 
            ctx.fillStyle = 'red';
            ctx.fillText("      Hai fatto infuriare il boss!", 880, 190);
            ctx.fillText("Cosa nasconde alle sue spalle?", 880, 210);
        }
        else
            ctx.fillText(`Cartelle da raccogliere ${3-numcartella}`, 880, 100)
            
        /*if (pacco==true){
            ctx.fillStyle = 'green';
            ctx.fillText("    Grazie per aver recuperato", 880, 230);
            ctx.fillText("    tutti i preziosi documenti!!", 880, 250);
        }*/

        ctx.font = '12pt Calibri';
        ctx.fillStyle = 'purple';
        ctx.fillText("Attenzione evita i virus rotanti per ", 880, 140);
        ctx.fillText("non rimetterci i circuiti", 880, 160);
        ctx.font = '10pt Calibri';
        ctx.fillStyle = 'black';
        ctx.fillText("----------------------------------------------------------", 871, 270);
        ctx.font = '16pt Calibri';
        ctx.fillStyle = 'red';
        ctx.fillText("	             CONTROLLI 		", 870, 290);
        ctx.font = '13pt Calibri';
        ctx.fillStyle = 'black';
        ctx.fillText("          Controllo movimento", 880, 310);
        ctx.font = '12pt Calibri';
        ctx.fillText("          W avanti            A sinistra", 880, 330); 
        ctx.fillText("          S indietro          D destra", 880, 350); 
        ctx.font = '13pt Calibri';
        ctx.fillText("Controllo movimento camera", 880, 380);
        ctx.fillText("con le freccie direzionali ⇑⇓⇒⇐", 880, 400); 
        ctx.fillText("o con il movimento del mouse", 880, 420);
        ctx.font = '13pt Calibri';
        ctx.fillText("Puoi avvicinare e allontare la", 880, 440); 
        ctx.fillText("camera con la rotella del mouse", 880, 460); 
        
    /*if(morte==1){  
            ctx.drawImage(matrix,0,0,text.clientWidth,text.clientHeight);
            ctx.drawImage(retry,480, 175);
        }*/
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

    function drawVirus(ProgramInfo,time){
        let u_model = m4.identity()
        
    //  u_model = m4.xRotate(u_model, 123)
        u_model = m4.scale(m4.translation(-25, 5.5, -15), 5.5,5.5,5.5)
        u_model = m4.yRotate(u_model, time)
        webglUtils.setBuffersAndAttributes(gl, ProgramInfo, geometries.mite.bufferInfo)
        webglUtils.setUniforms(ProgramInfo, {
            u_world: u_model,
            u_texture: geometries.mite.texture,
        })
        webglUtils.drawBufferInfo(gl, geometries.mite.bufferInfo)
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

        //geometries.roomba.drawObject(programInfo, {x: geometries.roomba.position.x, y: geometries.roomba.position.y, z: geometries.roomba.position.z});
        drawRoomba(programInfo)
        drawVirus(programInfo)
        drawFloor(programInfo)
    }   
}




main();