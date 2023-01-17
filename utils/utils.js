"use strict";
//Raccoglie diverse funzioni come il caricamento di una texture da un'immqgine,
// la crezione di una texture da applicarea allo skybox,
// e tutto ciò che riguarda il caricamento di una mesh da un Obj


//Bounds of the objs [tv_cabinet, sofa, foots_table]
const objs_bounds = [{x1: 48.5, x2: 11.5, z1: -15, z2: -35}, {x1: 48.5, x2: 11.5, z1: 42, z2: 18}, {x1: -17.5, x2: -25.5, z1: 21.5, z2: 13},  {x1: -19, x2: -26, z1: 47, z2: 38.5}, {x1: -35.5, x2: -41.5, z1: 21.5, z2: 13}, {x1: -35, x2: -41.5, z1: 47, z2: 38.5}];

const floor_bounds = {x1: 67.8, x2: -67.8, z1: 67.7, z2: -67.7};

function degToRad(d) {
	return d * Math.PI / 180;
}

function radToDeg(r) {
	return r * 180 / Math.PI;
}

function isPowerOf2(value) {
    return (value & (value - 1)) == 0;		
}

//Funzione per creare la texture dello skybox
function loadSkyboxTexture() {
    const texture = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture)
    
	const faceInfos = [{target: gl.TEXTURE_CUBE_MAP_POSITIVE_X, url: 'resources/images/background/px.png',},
	{target: gl.TEXTURE_CUBE_MAP_NEGATIVE_X, url: 'resources/images/background/nx.png',},
	{target: gl.TEXTURE_CUBE_MAP_POSITIVE_Y, url: 'resources/images/background/py.png',},
	{target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, url: 'resources/images/background/ny.png',},
	{target: gl.TEXTURE_CUBE_MAP_POSITIVE_Z, url: 'resources/images/background/pz.png',},
	{target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, url: 'resources/images/background/nz.png',},
	];

    faceInfos.forEach((faceInfo) => {
        const {target, url} = faceInfo;

        // Upload the canvas to the cubemap face.
        const level = 0;
        const internalFormat = gl.RGBA;
        const width = 1024;
        const height = 1024;
        const format = gl.RGBA;
        const type = gl.UNSIGNED_BYTE;

        // setup each face so it's immediately renderable
        gl.texImage2D(target, level, internalFormat, width, height, 0, format, type, null);

        // Asynchronously load an image
        const image = new Image();
        image.src = url;
        image.addEventListener('load', function() {
            // Now that the image has loaded make copy it to the texture.
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
            gl.texImage2D(target, level, internalFormat, format, type, image);
            gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
        });
    });


    gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);

    return texture;
}


//Funzone per caricare una texture
function loadTextureFromImg(imageSrc) {
    var texture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, texture);
	 
	// Fill the texture with a 1x1 blue pixel.
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
				  new Uint8Array([0, 0, 255, 255]));

	// Asynchronously load an image
	var textureImage = new Image();
	textureImage.src = imageSrc;
	textureImage.addEventListener('load', function() {
        // Now that the image has loaded make copy it to the texture.
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,gl.UNSIGNED_BYTE, textureImage);
		  
		  // Check if the image is a power of 2 in both dimensions.
        if (isPowerOf2(textureImage.width) && isPowerOf2(textureImage.height)) {
            // Yes, it's a power of 2. Generate mips.
            gl.generateMipmap(gl.TEXTURE_2D);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST	);
        } else {
            // No, it's not a power of 2. Turn off mips and set wrapping to clamp to edge
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);	//tell WebGL to not repeat the texture in S direction
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);	//tell WebGL to not repeat the texture in T direction
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        }
	});
    return texture;
}








var depthFramebuffer, depthTextureSize, depthTexture, unusedTexture;
//funzione per creare depth framebuffer
function createTextureLight(){
	depthTexture = gl.createTexture();
	depthTextureSize = 1024;
	gl.bindTexture(gl.TEXTURE_2D, depthTexture);
	gl.texImage2D(
		gl.TEXTURE_2D,      // target
		0,                  // mip level
		gl.DEPTH_COMPONENT, // internal format
		depthTextureSize,   // width
		depthTextureSize,   // height
		0,                  // border
		gl.DEPTH_COMPONENT, // format
		gl.UNSIGNED_INT,    // type
		null);              // data
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);


	depthFramebuffer = gl.createFramebuffer();
	gl.bindFramebuffer(gl.FRAMEBUFFER, depthFramebuffer);
	gl.framebufferTexture2D(
		gl.FRAMEBUFFER,       // target
		gl.DEPTH_ATTACHMENT,  // attachment point
		gl.TEXTURE_2D,        // texture target
		depthTexture,         // texture
		0);                   // mip level

	// --------------------------------------------------
	// UNUSED TEXTURE

	// create a color texture of the same size as the depth texture
	// see article why this is needed_
	unusedTexture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, unusedTexture);
	gl.texImage2D(
		gl.TEXTURE_2D,
		0,
		gl.RGBA,
		depthTextureSize,
		depthTextureSize,
		0,
		gl.RGBA,
		gl.UNSIGNED_BYTE,
		null,
		);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

	// attach it to the framebuffer
	gl.framebufferTexture2D(
		gl.FRAMEBUFFER,        // target
		gl.COLOR_ATTACHMENT0,  // attachment point
		gl.TEXTURE_2D,         // texture target
		unusedTexture,         // texture
		0);                    // mip level
}


//*********************************************************************************************************************
// MESH.OBJ 

async function loadObj(url) {
    const response = await fetch(url);
    if(response.ok){
        const text = await response.text();
        return parseOBJ(text);
    }
}


function parseOBJ(text) {
	var webglVertexData = [
	    [],   // positions
	    [],   // texcoords
	    [],   // normals
	];
	
	const objPositions = [[0, 0, 0]];
  	const objTexcoords = [[0, 0]];
  	const objNormals = [[0, 0, 0]];
 
	const objVertexData = [
	    objPositions,
	    objTexcoords,
	    objNormals,
	  ];

	  // same order as `f` indices

	  //f 1/2/3 -> 1 2 3
	function addVertex(vert) {
		const ptn = vert.split('/');
		ptn.forEach((objIndexStr, i) => {
		  if (!objIndexStr) {
		    return;
		  }
		  const objIndex = parseInt(objIndexStr);
		  const index = objIndex + (objIndex >= 0 ? 0 : objVertexData[i].length);
		  //webglVertexData pubblica
		  //console.log(i);
		  webglVertexData[i].push(...objVertexData[i][index]);
		});
	}

	const keywords = {
	    v(parts) {
	      objPositions.push(parts.map(parseFloat));
	    },
	    vn(parts) {
	      objNormals.push(parts.map(parseFloat));
	    },
	    vt(parts) {
	      // should check for missing v and extra w?
	      objTexcoords.push(parts.map(parseFloat));
	    },
	    f(parts) {
	      const numTriangles = parts.length - 2;
	      for (let tri = 0; tri < numTriangles; ++tri) {
	        addVertex(parts[0]);
	        addVertex(parts[tri + 1]);
	        addVertex(parts[tri + 2]);
	      }
	    },
	  };

	//	\w* = almeno una lettere o un numero
	// ?:x = meccia gli spazi singoli bianchi (anche più di uno)
	// . = classi di caratteri, meccia ogni singolo carattere tranne i terminatori di linea
	const keywordRE = /(\w*)(?: )*(.*)/;
	const lines = text.split('\n');
	//let identifica una variabile in un determinato blocco di codice
	for (let lineNo = 0; lineNo < lines.length; ++lineNo) {
	const line = lines[lineNo].trim();
	if (line === '' || line.startsWith('#')) {
		//la riga è vuota o è un commento
	  continue;
	}
	//ritorna la stringa 
	const m = keywordRE.exec(line);
	//console.log(m);
	if (!m) {
	  continue;
	}
	const [, keyword, unparsedArgs] = m;
	const parts = line.split(/\s+/).slice(1);
	const handler = keywords[keyword];
	//console.log(parts);
	if (!handler) {
	  //console.warn('unhandled keyword:', keyword, 'at line', lineNo + 1);
	  continue;
	}

	handler(parts, unparsedArgs); //gestisce gli argomenti che non hai gestito
	}

	return webglVertexData;
}

function getManipulationPanel() {
    const manipulation_div = document.getElementById('manipulation');
    manipulation_div.innerHTML = "<div id='bottoni'> <div id='visuale'> <h2>Cambia Camera </h2> </div> <input type='button' id='button_camera_posteriore' value='Posteriore' /> <input type='button' id='button_camera_anteriore' value='Anteriore' /> <input type='button' id='button_camera_alta' value='Alta' /> <input type='button' id='button_camera_tv' value='TV' /> </div> <div id='lightManipulation'> <div id='visuale'> <h2> Cambia Luci <h2> </div> <div id='LightX'></div> <div id='LightY'></div> <div id='LightZ'></div> <div id='shadow_manipulation'>  <div id='visuale'> <h2> Imposta Ombre <h2> </div> <label class='switch'> <input type='checkbox' id='switch_shadow'> <span class='slider round'></span> </label> </div></div> ";
}


/*--------------------------------------------------TEXT DRAWING---------------------------------------------------------------------------- */

function drawWin(animation){
    window.cancelAnimationFrame(animation);
    window.addEventListener("keypress", function(event) {
        if (event.key === "Enter") {
            window.location.reload();
            event.preventDefault();
        }
    });
    const background_image = new Image();
    background_image.src = "resources/images/end_game_background.png";
    background_image.addEventListener('load', function() {});
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.drawImage(background_image, 0, 0, text.clientWidth, text.clientHeight);
    ctx.font = '50pt Games, sans-serif';
    ctx.fillStyle = 'white';
    ctx.fillText("COMPLIMENTI", 330, 200);
    ctx.fillText("  HAI VINTO ", 330, 300);
    ctx.font = '18pt Games, sans-serif';
    ctx.fillText("Se vuoi rigiocare premi il tasto invio e attendi", 240, 400);
}

function drawGameover(animation) {
    window.cancelAnimationFrame(animation);
    window.addEventListener("keypress", function(event) {
        if (event.key === "Enter") {
            window.location.reload();
            event.preventDefault();
        }
    });
    const background_image = new Image();
    background_image.src = "resources/images/end_game_background.png";
    background_image.addEventListener('load', function() {});
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.drawImage(background_image, 0, 0, text.clientWidth, text.clientHeight);
    ctx.font = '80pt VT323, sans-serif';
    ctx.fillStyle = 'green';
    ctx.fillText("GAME OVER", 350, 300);
    ctx.font = '20pt VT323, sans-serif';
    ctx.fillText("Se vuoi rigiocare premi il tasto invio e attendi", 280, 350);
}

function drawTextInfo(parassiti, bossLife){
    const n_parassiti = parassiti.length;
    const parassiti_raccolti = parassiti.filter(value => value === true).length;

    const image_info = new Image();
    image_info.src = "resources/images/background_info2.png";
    image_info.addEventListener('load', function() {});

    const image_wasd= new Image(); 
    image_wasd.src = "resources/images/wasd.png";
    image_wasd.addEventListener('load', function() {});;

    if( (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) ) {
        ctx.drawImage(image_wasd, 15, 260);
        ctx.drawImage(image_info, 1, 420);
    }
    else{
        ctx.drawImage(image_info, 1, 420);
    }
    //testo
    if (parassiti_raccolti == n_parassiti){ 
        ctx.font = '20pt Games, sans-serif';
        ctx.fillStyle = 'green';
        ctx.fillText("Complimenti !  Hai raccolto tutti i parassiti", 220, 460);
        ctx.font = '16pt Games, sans-serif';
        ctx.fillStyle = 'rgb(240,240,240)';
        ctx.fillText("e' arrivato il Boss dei parassiti", 20, 500);
        ctx.fillText(`Vite del Boss : ${bossLife}`, 20, 520);

        ctx.font = '12pt Games, sans-serif';
        ctx.fillStyle = 'red';
        ctx.fillText("ATTENZIONE : IL BOSS SI TELETRASPORTA", 20, 560);
    }
    else {
        ctx.font = '20pt Games, sans-serif';
        ctx.fillStyle = 'rgb(240,240,240)';
        ctx.fillText("Prova a raccogliere tutti i parassiti ", 300, 460);
        ctx.font = '16pt Games, sans-serif';
        ctx.fillText(`Parassiti da raccogliere :  ${n_parassiti - parassiti_raccolti}`, 20, 520);
    }

    //attention
    ctx.font = '12pt Games, sans-serif';
    ctx.fillStyle = 'red';
    ctx.fillText("Attenzione : evita i pezzi di ferro per non rompere Roomba", 20, 580);

    //info
    ctx.font = '12pt sans-serif';
    ctx.fillStyle = 'rgb(240,240,240)';
    ctx.fillText("-------------------------------------------------", 850, 500);
    ctx.fillText("|", 850, 509);
    ctx.fillText("|", 850, 524);
    ctx.fillText("|", 850, 539);
    ctx.fillText("|", 850, 554);
    ctx.fillText("|", 850, 569);
    ctx.fillText("|", 850, 584);
    ctx.fillText("|", 850, 599);
    ctx.font = '13pt Games, sans-serif';
    ctx.fillStyle = '#00cc00';
    ctx.fillText("	              CONTROLLO MOVIMENTO 		",  780, 520);
    ctx.font = '11pt Games, sans-serif';
    ctx.fillText("          W : avanti           A : sinistra", 810, 560); 
    ctx.fillText("          S : indietro         D : destra", 810, 580); 
    ctx.font = '13pt Copperplate';
}



export {objs_bounds, floor_bounds, depthFramebuffer, depthTexture, depthTextureSize, getManipulationPanel, drawWin, drawGameover, drawTextInfo, loadObj, loadTextureFromImg, degToRad, radToDeg, createTextureLight, loadSkyboxTexture};