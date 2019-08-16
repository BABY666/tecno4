
//particle system credits to https://aerotwist.com/tutorials/creating-particles-with-three-js/
// and a lot of mr doob examples muchas gracias
// perlin noise shader from (perlin noise shader tutorial)
// web audio api data from blahablh
// la pagina de los ejemplos stemoski tambien
//

/*/// TABLA DE ORGANIZACION DE VARIABLES  /  REFERENCIA
		***A = particulas %
			triggereadores de A / determinan cada cuanto se triggerea / y nada mas por ahora
			. go1 = a1
			. go2 = a2
			. go"3" = a3
			variadores de A segun mouseXY
			. mX = aMx
			. mY = aMy
			cargador d archivos de A y reproductor
			. loadfileA1, loadfileA2, etc
			. bufA
			. playA (si hubiera mas formas de reproducir sustituir x playA1, playA2, etc)
			contadores de tiempo/frames (ex n)
			. nA1, nA2, nA3

		***B = bajos y esferas creo //// o plano eso no se decidio todavia
			triggereadores de B / determinan cada cuanto se triggerea / y el pitch x ahora
			. ex go3 = b1 , b2, etc
			variadores de B  segun mouseXY
			. bMx, bMy
			cargador de archivos de B y reproductor
			. loadfileB, bufB, playB
			contadores de tiempo/frames (ex n)
			. nB1 , nB2, etc

		***C = tercer sonido desconocido y relacion con el otro elemento (plano supongo)
			triggereadores de C / determinan cada cuanto se triggerea
			. c1, c2
			variadores de C segun mouseXY
			. cMx, cMy
			cargador de archivos de C y reproductor
			. loadfileC, bufC, playC
			contadores de tiempo/frames (ex n)
			. nC1, nC2 etc
*/


var boton = document.querySelector("#boton");
boton.addEventListener("click", function() { 
	var lander = document.querySelector("#lander");
	var content = document.querySelector("#container");
	lander.classList.add("invisible");
	content.classList.remove("invisible");
});
var scene, camera, renderer;
var light1, light2, sphere, plano;
var ambientLight = new THREE.AmbientLight(0x990022);
var lightColor = [0x330988, 0x4499DD, 0xEE00EE];
var particles, geometry;
var ctx; // audio context
var bufA1, bufA2, bufA3, bufB, bufC1, bufC2, bufC3; // audio buffer
var t, start = Date.now();
var mouseX = 0, mouseY = 0;
var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

/// initialize audio
var contextClass = (window.AudioContext || 
	window.webkitAudioContext ||
	window.mozAudioContext ||
	window.oAudioContext ||
	window.msAudioContext);

if (contextClass) {
	// Web Audio API is available.
	ctx = new contextClass();
} else {
	// Web Audio API is not available.
	console.log("Web audio API is not available. Use a supported browser");
}

var nA1 = 0, nA2 = 0, nA3 = 0;
var a1 = 60, a2 = 120, a3 = 80;
var nB1 = 0;
var b1 = 92;
var nC1 = 0, nC2 = 0;
var c1 = 50, c2 = 60;
var cMx, cMy;
var rotation = 0;
var b = 40; //controla el spawn maximo del random d b1, es decir cada cuando suena los bajos y cual es el rango d frecuencias posibles. o algo asi //redactar mejor//
var aMx = 10 // controla el tiempo de spawm maximo de go1 y go2 (particles)
var aMy = 10 //controla el pitch de particles

// utils functions
function getRandomInt(min, max) {
	return Math.floor(Math.random() * (max - min)) + min;
}

function map(x,a,b,c,d){
	var y = (x-a)/(b-a)*(d-c)+c;
	return y;
}

// mouse and window control functions
function onDocumentMouseMove( event ) {
	mouseX = event.clientX - windowHalfX;
	mouseY = event.clientY - windowHalfY;
}

function onWindowResize() {
	windowHalfX = window.innerWidth / 2;
	windowHalfY = window.innerHeight / 2;

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );
}

function loadFile({path, buf}) {
	var req = new XMLHttpRequest();
	req.open("GET", path, true);
	req.responseType = "arraybuffer";
	req.onload = function() {
		//decode the loaded data
		ctx.decodeAudioData(req.response, function(buffer) {
			console.log("buffer on decode", buffer);
			buf = buffer;
			return buffer
		})
	};
	req.send();
}

function loadFileA1() {
	var req = new XMLHttpRequest();
	req.open("GET","sounds/A1.wav",true);
	req.responseType = "arraybuffer";
	req.onload = function() {
			//decode the loaded data
			ctx.decodeAudioData(req.response, function(buffer) {
					bufA1 = buffer;
			});
	};
	req.send();
}

function loadFileA2() {
	var req = new XMLHttpRequest();
	req.open("GET","sounds/A2.wav",true);
	req.responseType = "arraybuffer";
	req.onload = function() {
			//decode the loaded data
			ctx.decodeAudioData(req.response, function(buffer) {
					bufA2 = buffer;

			});
	};
	req.send();
}

function loadFileA3() {
	var req = new XMLHttpRequest();
	req.open("GET","sounds/A3.wav",true);
	req.responseType = "arraybuffer";
	req.onload = function() {
			//decode the loaded data
			ctx.decodeAudioData(req.response, function(buffer) {
					bufA3 = buffer;

			});
	};
	req.send();
}


function loadFileB() {
	var req = new XMLHttpRequest();
	req.open("GET","sounds/B4.wav",true);
	req.responseType = "arraybuffer";
	req.onload = function() {
			//decode the loaded data
			ctx.decodeAudioData(req.response, function(buffer) {
					bufB = buffer;

			});
	};
	req.send();
}

function loadFileC1() {
	var req = new XMLHttpRequest();
	req.open("GET","sounds/CC1.wav",true);
	req.responseType = "arraybuffer";
	req.onload = function() {
			//decode the loaded data
			ctx.decodeAudioData(req.response, function(buffer) {
					bufC1 = buffer;

			});
	};
	req.send();
}

function loadFileC2() {
	var req = new XMLHttpRequest();
	req.open("GET","sounds/CC2.wav",true);
	req.responseType = "arraybuffer";
	req.onload = function() {
			//decode the loaded data
			ctx.decodeAudioData(req.response, function(buffer) {
					bufC2 = buffer;

			});
	};
	req.send();
}

function loadFileC3() {
	var req = new XMLHttpRequest();
	req.open("GET","sounds/CC2.wav",true);
	req.responseType = "arraybuffer";
	req.onload = function() {
			//decode the loaded data
			ctx.decodeAudioData(req.response, function(buffer) {
					bufC3 = buffer;

			});
	};
	req.send();
}
////////////////

/// agregar el numero q random como argumento a play para que conctrole un
/// nodo de audiopanner y uno que le controle la ganancia (minimamente)
function playA1(r) {
var src = ctx.createBufferSource();
src.buffer = bufA1;
src.detune.value =  getRandomInt(100,aMy); //este otro valor puede cambiar segun mouse x!!
var gain = ctx.createGain();
gain.gain.value = (Math.random(30)* /**/cMx/150 );//este valor tamb podria ser controlado segun mouse y
var panner = ctx.createStereoPanner();
panner.pan.value= (getRandomInt(-100,100))/100;
src.connect(panner);
panner.connect(gain);
gain.connect(ctx.destination);
src.start(ctx.currentTime);
}

function playA2(r) {
var src = ctx.createBufferSource();
src.buffer = bufA2;
src.detune.value =  getRandomInt(100,aMy); //este otro valor puede cambiar segun mouse x!!
var gain = ctx.createGain();
gain.gain.value = (Math.random(30)* /**/cMx/150 );//este valor tamb podria ser controlado segun mouse y
var panner = ctx.createStereoPanner();
panner.pan.value= (getRandomInt(-100,100))/100;
src.connect(panner);
panner.connect(gain);
gain.connect(ctx.destination);
src.start(ctx.currentTime);
}

function playA3(r) {
var src = ctx.createBufferSource();
src.buffer = bufA3;
src.detune.value =  getRandomInt(100,aMy); //este otro valor puede cambiar segun mouse x!!
var gain = ctx.createGain();
gain.gain.value = (Math.random(30)* /**/cMx/150 );//este valor tamb podria ser controlado segun mouse y

var panner = ctx.createStereoPanner();
panner.pan.value= (getRandomInt(-100,100))/100;
src.connect(panner);
panner.connect(gain);
gain.connect(ctx.destination);
src.start(ctx.currentTime);
}


function playB(r) {
var src = ctx.createBufferSource();
src.buffer = bufB;
src.detune.value = (r - b/2) * ( - 10); //este otro valor puede cambiar segun mouse x!!
var gain = ctx.createGain();
gain.gain.value = (getRandomInt(50,99) / 100 /**/);
var panner = ctx.createStereoPanner();
panner.pan.value= (getRandomInt(-100,100))/100;
src.connect(panner);
panner.connect(gain);
gain.connect(ctx.destination);
src.start(ctx.currentTime);
}

function playC1(r) {
var src = ctx.createBufferSource();
src.buffer = bufC1;
src.detune.value =  getRandomInt(1,aMy/4); //este otro valor puede cambiar segun mouse x!!
var gain = ctx.createGain();
gain.gain.value = (Math.random(24)/ /**/cMx*20 );
//este valor tamb podria ser controlado segun mouse y
var panner = ctx.createStereoPanner();
panner.pan.value= (getRandomInt(-20,20))/100;
src.connect(gain);
gain.connect(panner);
gain.connect(ctx.destination);
src.start(ctx.currentTime);
}




function init(){
	renderer = new THREE.WebGLRenderer({antialias:true});
	renderer.setSize( window.innerWidth*0.75, window.innerHeight*0.75);
	document.querySelector("#container").appendChild(renderer.domElement);

	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera( 75,
		window.innerWidth/ window.innerHeight,
		1,
		5000 );
	camera.position.z = -200;

	light1 = new THREE.PointLight(lightColor[0], 6 , 150);
	light1.position.set(0,100,-100);
	scene.add(light1);
	scene.add(ambientLight);

	light2 = new THREE.PointLight(lightColor[1], 7 , 150);
	light2.position.set(0,-100,100);
	scene.add(light2);

	/// shader material
	material = new THREE.ShaderMaterial({
		side: THREE.DoubleSide,
		uniforms: {
				amp: {
					type: "f",
					value: 0.0
				},
				sync:{
					type: "f",
					value: 0.0
				},
				time: { //float initialized to 0
				type: "f",
				value: 0.0
			}
		},
		vertexShader: document.getElementById('vertexShader2').textContent,
		fragmentShader: document.getElementById('fragmentShader2').textContent
	} );
	var material2 = new THREE.MeshPhongMaterial( { color: 0xdddddd, specular: 0x999933, shininess: 20 , side: THREE.DoubleSide});

	//sphere
	sphere1 = new THREE.Mesh(new THREE.SphereGeometry(40,32,16), material2);
	sphere1.position.set(-200,0,0);
	scene.add(sphere1);
	sphere2 = new THREE.Mesh(new THREE.SphereGeometry(40,32,16), material2);
	sphere2.position.set(0,0,0);
	scene.add(sphere2);
	sphere3 = new THREE.Mesh(new THREE.SphereGeometry(40,32,16), material2);
	sphere3.position.set(200,0,0);
	scene.add(sphere3);
	camera.lookAt(scene.position);

	// plano
	plano = new THREE.Mesh(
		new THREE.PlaneGeometry(250, 250,200,200),
		material
	);
	scene.add(plano);

	//texture loader
	var textureLoader = new THREE.TextureLoader();
	var sprite1 = textureLoader.load( "textures/sprites/chip.png" );

	// particles
	var pointsMaterial = new THREE.PointsMaterial({
			size: 3, map: sprite1, blending: THREE.AdditiveBlending, transparent : true });
	geometry = new THREE.Geometry();
	for ( i = 0; i < 1000; i ++ ) {
		var vertex = new THREE.Vector3();
		vertex.x = Math.random() * 400 - 200;
		vertex.y = Math.random() * 400 - 200;
		vertex.z = Math.random() * 400 - 200;
		geometry.vertices.push( vertex );
	}
	particles = new THREE.Points(geometry, pointsMaterial);
	scene.add(particles);


	loadFile({path: "sounds/A1.wav",  buf: bufA1});
	loadFile({path: "sounds/A2.wav",  buf: bufA2});
	loadFile({path: "sounds/A3.wav",  buf: bufA3});
	loadFile({path: "sounds/B4.wav",  buf: bufB});
	loadFile({path: "sounds/CC1.wav", buf: bufC1});
	loadFile({path: "sounds/CC2.wav", buf: bufC2});
	loadFile({path: "sounds/CC2.wav", buf: bufC3});

	// loadFileA1();
	// loadFileA2();
	// loadFileA3()
	// loadFileB();
	// loadFileC1();
	// loadFileC2();
	// loadFileC3();
	console.log("bufA1", bufA1);

	document.addEventListener( 'mousemove', onDocumentMouseMove, false );
	window.addEventListener( 'resize', onWindowResize, false );
}

function render() {
	// actualizar variables
	t = Date.now() * 0.00005;
	nA1 ++;
	nA2 ++;
	nA3 ++;
	nB1 ++;
	nC1 ++;
	nC2 ++;
	rotation += 0.005;
	aMx = map(mouseX,-683,682,2,30);
	aMy = map(mouseY,-339, 338,300,450);
	cMx = map(mouseX,-683,682,50,10);

	// reproducción de sonidos
	if (a1 == nA1 ){
			playA1(a1);
			nA1= 0;
			a1 = getRandomInt(1,aMx);
			for ( var i = 0, l = geometry.vertices.length; i < l; i ++ ) {

				geometry.vertices[ i ].x += (Math.random()-0.5) * aMx;

			}
	};

	if (a2 == nA2 ){
			playA2(a2);
			nA2 = 0;
			a2 = getRandomInt(1,aMx);
			for ( var i = 0, l = geometry.vertices.length; i < l; i ++ ) {

				geometry.vertices[ i ].y += (Math.random()-0.5) * aMx;

			}
	};

	if (a3 == nA3){
		playA3(a3);
		nA3 = 0;
		ar = getRandomInt(1, aMx);
		for ( var i = 0, l = geometry.vertices.length; i < l; i ++ ) {

			geometry.vertices[ i ].y += (Math.random()-0.5) * aMx ;

		}
	};

	if (b1 == nB1 ){
			playB(b1);
			nB1= 0;
			light1.position.x = (b1 - 20) * 10  ;// se usa b1 - 20 porque sabemos q los valores q puede tomar b1 son de 1 a 40, b es constante
			light2.position.x = (- b1 + 20) * 10  ;
			b1 = getRandomInt(13,b); // variable max 40

	};

	if (c1 == nC1){
			playC1(c1);
			l
			material.uniforms[ 'sync' ].value = getRandomInt(5,20);
			nC1 = 0;
			c1 = getRandomInt(7,cMx);
	}

	// escena visual
	particles.geometry.verticesNeedUpdate = true;

	plano.rotation.z = rotation/3;
	plano.rotation.x = rotation/2;

	camera.position.x += ( (mouseX/4) - camera.position.x ) * 0.05;
	camera.position.y += ( - (mouseY/3) - camera.position.y ) * 0.05;

	camera.lookAt( scene.position );

	material.uniforms[ 'time' ].value = .0005 * ( Date.now() - start );
	material.uniforms[ 'amp' ].value = cMx / 70 ;

	requestAnimationFrame( render );
	renderer.render(scene, camera);
};


init();
render();


