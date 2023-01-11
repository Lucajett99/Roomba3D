"use strict";
//Raccoglie diverse funzioni come il caricamento di una texture da un'immqgine,
// la crezione di una texture da applicarea allo skybox,
// e tutto ciò che riguarda il caricamento di una mesh da un Obj

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

function drawWin(){
    /*window.addEventListener("keypress", function(event) {
        if (event.key === "Enter") {
            repeat();
            event.preventDefault();
        }
   });*/
    const winner = new Image();
    winner.src = "resources/images/white_background.png";
    winner.addEventListener('load', function() {});
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.drawImage(winner, 0, 0, text.clientWidth, text.clientHeight);
    ctx.font = '50pt Bowlby One SC';
    ctx.fillStyle = 'black';
    ctx.fillText("COMPLIMENTI", 290, 190);
    ctx.fillText("    HAI VINTO ", 290, 290);
}

function drawGameover(){
    const game_over = new Image();
    game_over.src = "resources/images/game_over.png";
    game_over.addEventListener('load', function() {});
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.drawImage(game_over, 0, 0, text.clientWidth, text.clientHeight);
}

function drawTextInfo(parassiti, bossLife){
    const n_parassiti = parassiti.length;
    const parassiti_raccolti = parassiti.filter(value => value === true).length;

    const image_info = new Image();
    image_info.src = "resources/images/background_info2.png";
    image_info.addEventListener('load', function() {});

    const image_wasd= new Image(); 
    image_wasd.src = "resources/images/wasd.png";
    image_wasd.addEventListener('load', function() {});

    const image_frecce = new Image();
    image_frecce.src = "resources/images/frecce.png";
    image_frecce.addEventListener('load', function() {});

    if( (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) ) {
    ctx.drawImage(wasd_keys, 80, 330);
    ctx.drawImage(freccie, 540, 330);  
    //ctx.drawImage(button1, 300, 450);
    //ctx.drawImage(button3, 440, 450);  
    ctx.drawImage(image_info, 871.5, 17);
    } 
    else{ctx.drawImage(image_info, 871.5, 1);}
    //testo
    ctx.font = '14pt Copperplate';
    ctx.fillStyle = 'black';
    ctx.fillText("Prova a raccogliere tutti", 880, 50);
    ctx.fillText("i parassiti ", 880, 70);
    ctx.font = '14pt Copperplate';
    ctx.fillStyle = 'red';
    if (parassiti_raccolti == n_parassiti){
        ctx.fillStyle = 'green';
        ctx.fillText("    Complimenti!!!!!", 880, 100);
        ctx.fillText("  Hai raccolto tutti i parassiti", 880, 120);
        ctx.font = '14pt Copperplate'; 
        ctx.fillStyle = 'red';
        ctx.fillText(" Hai fatto infuriare il boss dei parassiti!", 880, 190);
        ctx.fillText("    (ATTENTO HA 3 VITE E SI TELETRASPORTA!)", 880, 210);
        ctx.fillText(`Vite del Boss: ${bossLife}`, 880, 230)
    }
    else if(bossLife == 0) {
        ctx.fillStyle = 'green';
        ctx.fillText("    Grazie per aver aspirato tutti i parassiti  ", 880, 100);
    }
    else
        ctx.fillText(`Parassiti da raccogliere ${n_parassiti - parassiti_raccolti}`, 880, 100)
    
    


    ctx.font = '12pt Copperplate';
    ctx.fillStyle = 'purple';
    ctx.fillText("Attenzione evita i pezzi di ferro per ", 880, 140);
    ctx.fillText("non rompere Roomba", 880, 160);
    ctx.font = '10pt Copperplate';
    ctx.fillStyle = 'Copperplate';
    ctx.fillText("----------------------------------------------------------", 871, 270);
    ctx.font = '16pt Copperplate';
    ctx.fillStyle = 'red';
    ctx.fillText("	             CONTROLLI 		", 870, 290);
    ctx.font = '13pt Copperplate';
    ctx.fillStyle = 'black';
    ctx.fillText("          Controllo movimento", 880, 310);
    ctx.font = '12pt Copperplate';
    ctx.fillText("          W avanti            A sinistra", 880, 330); 
    ctx.fillText("          S indietro          D destra", 880, 350); 
    ctx.font = '13pt Copperplate';
    ctx.fillText("Controllo movimento camera", 880, 380);
    ctx.fillText("con le freccie direzionali ⇑⇓⇒⇐", 880, 400); 
    ctx.fillText("o con il movimento del mouse", 880, 420);
    ctx.font = '13pt Copperplate';
    ctx.fillText("Puoi avvicinare e allontare la", 880, 440); 
    ctx.fillText("camera con la rotella del mouse", 880, 460); 
}



export {depthFramebuffer, depthTexture, depthTextureSize, getManipulationPanel, drawWin, drawGameover, drawTextInfo, loadObj, loadTextureFromImg, degToRad, radToDeg, createTextureLight, loadSkyboxTexture};