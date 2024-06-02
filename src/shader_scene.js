import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GUI } from 'dat.gui'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

function lerp (start, end, amt){
    return (1-amt)*start+amt*end
}

let uniforms = {};

async function fetchVertexShader() {
    const res = await fetch('../src/shaders/cube.vert');
    const text = await res.text();
    return text;
}   

async function fetchFragmentShader() {
    const res = await fetch('../src/shaders/cube.frag');
    const text = await res.text();
    return text;
}

const vertexShader = await fetchVertexShader();
const fragmentShader = await fetchFragmentShader();


const clock = new THREE.Clock();
clock.start();
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 0.1, 1000 );
camera.position.y = 2;

const renderer = new THREE.WebGLRenderer({canvas:document.querySelector('#scene'), antialias:true});
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
renderer.toneMapping = THREE.ReinhardToneMapping;
document.body.appendChild( renderer.domElement );

const light = new THREE.PointLight( 0xD9D9D9, 1, 100 );
light.position.set( 5, 5, 5 );

const spotlight = new THREE.SpotLight(0xD9D9D9, 1, 0);
spotlight.position.set(0, 5, 0);

const ambientLight = new THREE.AmbientLight(0x191919, 2);
scene.add(ambientLight, light, spotlight);

const axesHelper = new THREE.AxesHelper(16);
//scene.add(axesHelper);

const controls = new OrbitControls(camera, renderer.domElement);




let meshControls = {
    resolution: 128,
    resolutionMultiplier:1,
    wireframe: false,
    backface: false
};

let sceneControls = {
    showAxis: false
};

let shaderControl = {
    dotPower: 5,
    vertexLighting: true,
    xDisplacement: {
        byLocalX: 0.84,
        byLocalY: 0.0,
        byLocalZ: 0.0,
        byWorldX: 0.0,
        byWorldY: 0.0,
        byWorldZ: 0.0,
        influence: 1.15,
    }, 
    yDisplacement: {
        byLocalX: 0.95,
        byLocalY: 0.0,
        byLocalZ: 0.0,
        byWorldX: 0.0,
        byWorldY: 0.0,
        byWorldZ: 0.0,
        influence: 1.15,
    }, 
    zDisplacement: {
        byLocalX: 1.13,
        byLocalY: 0.0,
        byLocalZ: 0.0,
        byWorldX: 0.0,
        byWorldY: 0.0,
        byWorldZ: 0.0,
        influence: 1.31,
    }
};

let cameraControl = {
    useFreeCam: false,
    speed: 0.38,
    xMultiply: 2.4,
    yMultiply: 7.9,
    zMultiply: 3.9,
};

let bloomControl = {
    strength: 0.6,
    radius: 1.05,
    threshold: 0.0
};

uniforms.time = {type: 'float', value: clock.getElapsedTime()};
uniforms.cameraForward = {type: 'vec3', value: new THREE.Vector3(0.0, 0.0, 0.0)};
uniforms.dotPower = {type: 'float', value: shaderControl.dotPower};
uniforms.vertexLighting = {type: 'bool', value: shaderControl.vertexLighting};

uniforms.xDisplacementByLocalX = {type: 'float', value: shaderControl.xDisplacement.byLocalX};
uniforms.xDisplacementByLocalY = {type: 'float', value: shaderControl.xDisplacement.byLocalY};
uniforms.xDisplacementByLocalZ = {type: 'float', value: shaderControl.xDisplacement.byLocalZ};
uniforms.xDisplacementByWorldX = {type: 'float', value: shaderControl.xDisplacement.byWorldX};
uniforms.xDisplacementByWorldY = {type: 'float', value: shaderControl.xDisplacement.byWorldY};
uniforms.xDisplacementByWorldZ = {type: 'float', value: shaderControl.xDisplacement.byWorldZ};
uniforms.xDisplacementInfluence = {type: 'float', value: shaderControl.xDisplacement.influence};

uniforms.yDisplacementByLocalX = {type: 'float', value: shaderControl.yDisplacement.byLocalX};
uniforms.yDisplacementByLocalY = {type: 'float', value: shaderControl.yDisplacement.byLocalY};
uniforms.yDisplacementByLocalZ = {type: 'float', value: shaderControl.yDisplacement.byLocalZ};
uniforms.yDisplacementByWorldX = {type: 'float', value: shaderControl.yDisplacement.byWorldX};
uniforms.yDisplacementByWorldY = {type: 'float', value: shaderControl.yDisplacement.byWorldY};
uniforms.yDisplacementByWorldZ = {type: 'float', value: shaderControl.yDisplacement.byWorldZ};
uniforms.yDisplacementInfluence = {type: 'float', value: shaderControl.yDisplacement.influence};

uniforms.zDisplacementByLocalX = {type: 'float', value: shaderControl.zDisplacement.byLocalX};
uniforms.zDisplacementByLocalY = {type: 'float', value: shaderControl.zDisplacement.byLocalY};
uniforms.zDisplacementByLocalZ = {type: 'float', value: shaderControl.zDisplacement.byLocalZ};
uniforms.zDisplacementByWorldX = {type: 'float', value: shaderControl.zDisplacement.byWorldX};
uniforms.zDisplacementByWorldY = {type: 'float', value: shaderControl.zDisplacement.byWorldY};
uniforms.zDisplacementByWorldZ = {type: 'float', value: shaderControl.zDisplacement.byWorldZ};
uniforms.zDisplacementInfluence = {type: 'float', value: shaderControl.zDisplacement.influence};



let geometry;
let material;
let mesh;

function generateMesh() {
    if (mesh) {
        scene.remove(mesh);
    }

    const res = meshControls.resolution * meshControls.resolutionMultiplier;
    geometry = new THREE.BoxGeometry(res, res, res, res, res, res);
    material = new THREE.ShaderMaterial({
        uniforms: uniforms,
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        wireframe: meshControls.wireframe,
        side: meshControls.backface ? THREE.DoubleSide : THREE.FrontSide
    })
    mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
}

generateMesh();


const renderScene = new RenderPass( scene, camera );
const composer = new EffectComposer(renderer);
composer.addPass(renderScene);

const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    1.0,
    0.1,
    0.2,
);
composer.addPass(bloomPass);

function updateBloom() {
    bloomPass.strength = bloomControl.strength;
    bloomPass.radius = bloomControl.radius;
    bloomPass.threshold = bloomControl.threshold;
}


const gui = new GUI();

const sceneFolder = gui.addFolder('Scene');
sceneFolder.add(sceneControls, 'showAxis').onChange(function() {
    sceneControls.showAxis ? scene.add(axesHelper) : scene.remove(axesHelper);
});
//sceneFolder.open();

const meshFolder = gui.addFolder('Mesh');
meshFolder.add(meshControls, 'resolution', 1, 128).onChange(generateMesh);
meshFolder.add(meshControls, 'resolutionMultiplier').onChange(generateMesh);
meshFolder.add(meshControls, 'wireframe').onChange(generateMesh);
meshFolder.add(meshControls, 'backface').onChange(generateMesh);
//meshFolder.open();

const shaderFolder = gui.addFolder('Shader');
shaderFolder.add(shaderControl, 'dotPower', 1, 32);
shaderFolder.add(shaderControl, 'vertexLighting');

const xDisplacementFolder = shaderFolder.addFolder('xDisplacement');
xDisplacementFolder.add(shaderControl.xDisplacement, 'byLocalX', 0.0, 2, 0.01);
xDisplacementFolder.add(shaderControl.xDisplacement, 'byLocalY', 0.0, 2, 0.01);
xDisplacementFolder.add(shaderControl.xDisplacement, 'byLocalZ', 0.0, 2, 0.01);
xDisplacementFolder.add(shaderControl.xDisplacement, 'byWorldX', 0.0, 2, 0.01);
xDisplacementFolder.add(shaderControl.xDisplacement, 'byWorldY', 0.0, 2, 0.01);
xDisplacementFolder.add(shaderControl.xDisplacement, 'byWorldZ', 0.0, 2, 0.01);
xDisplacementFolder.add(shaderControl.xDisplacement, 'influence', 0.0, 2, 0.01).onChange(function(){console.log(material.uniforms)});
xDisplacementFolder.open();

const yDisplacementFolder = shaderFolder.addFolder('yDisplacement');
yDisplacementFolder.add(shaderControl.yDisplacement, 'byLocalX', 0.0, 2, 0.01);
yDisplacementFolder.add(shaderControl.yDisplacement, 'byLocalY', 0.0, 2, 0.01);
yDisplacementFolder.add(shaderControl.yDisplacement, 'byLocalZ', 0.0, 2, 0.01);
yDisplacementFolder.add(shaderControl.yDisplacement, 'byWorldX', 0.0, 2, 0.01);
yDisplacementFolder.add(shaderControl.yDisplacement, 'byWorldY', 0.0, 2, 0.01);
yDisplacementFolder.add(shaderControl.yDisplacement, 'byWorldZ', 0.0, 2, 0.01);
yDisplacementFolder.add(shaderControl.yDisplacement, 'influence', 0.0, 2, 0.01).onChange(function(){console.log(material.uniforms)});
yDisplacementFolder.open();

const zDisplacementFolder = shaderFolder.addFolder('zDisplacement');
zDisplacementFolder.add(shaderControl.zDisplacement, 'byLocalX', 0.0, 2, 0.01);
zDisplacementFolder.add(shaderControl.zDisplacement, 'byLocalY', 0.0, 2, 0.01);
zDisplacementFolder.add(shaderControl.zDisplacement, 'byLocalZ', 0.0, 2, 0.01);
zDisplacementFolder.add(shaderControl.zDisplacement, 'byWorldX', 0.0, 2, 0.01);
zDisplacementFolder.add(shaderControl.zDisplacement, 'byWorldY', 0.0, 2, 0.01);
zDisplacementFolder.add(shaderControl.zDisplacement, 'byWorldZ', 0.0, 2, 0.01);
zDisplacementFolder.add(shaderControl.zDisplacement, 'influence', 0.0, 2, 0.01).onChange(function(){console.log(material.uniforms)});
zDisplacementFolder.open();

shaderFolder.close();

const cameraFolder = gui.addFolder('Camera');
cameraFolder.add(cameraControl, 'useFreeCam');
cameraFolder.add(cameraControl, 'speed', 0, 2);
cameraFolder.add(cameraControl, 'xMultiply', 0, 10);
cameraFolder.add(cameraControl, 'yMultiply', 0, 10);
cameraFolder.add(cameraControl, 'zMultiply', 0, 10);
//cameraFolder.open();

const bloomFolder = gui.addFolder('Bloom');
bloomFolder.add(bloomControl, "strength", 0, 3);
bloomFolder.add(bloomControl, "radius", 0, 3);
bloomFolder.add(bloomControl,"threshold", 0, 3);
//bloomFolder.open();

function rendering() {
	requestAnimationFrame( rendering );

    updateBloom();
    let cameraForward = new THREE.Vector3(0.0, 0.0, 0.0);
    camera.getWorldDirection(cameraForward);

    material.uniforms.cameraForward.value = cameraForward;
    material.uniforms.time.value = clock.getElapsedTime();
    material.uniforms.dotPower.value = shaderControl.dotPower;
    material.uniforms.vertexLighting.value = shaderControl.vertexLighting;

    material.uniforms.xDisplacementByLocalX.value = shaderControl.xDisplacement.byLocalX;
    material.uniforms.xDisplacementByLocalY.value = shaderControl.xDisplacement.byLocalY;
    material.uniforms.xDisplacementByLocalZ.value = shaderControl.xDisplacement.byLocalZ;
    material.uniforms.xDisplacementByWorldX.value = shaderControl.xDisplacement.byWorldX;
    material.uniforms.xDisplacementByWorldY.value = shaderControl.xDisplacement.byWorldY;
    material.uniforms.xDisplacementByWorldZ.value = shaderControl.xDisplacement.byWorldZ;
    material.uniforms.xDisplacementInfluence.value = shaderControl.xDisplacement.influence;

    material.uniforms.yDisplacementByLocalX.value = shaderControl.yDisplacement.byLocalX;
    material.uniforms.yDisplacementByLocalY.value = shaderControl.yDisplacement.byLocalY;
    material.uniforms.yDisplacementByLocalZ.value = shaderControl.yDisplacement.byLocalZ;
    material.uniforms.yDisplacementByWorldX.value = shaderControl.yDisplacement.byWorldX;
    material.uniforms.yDisplacementByWorldY.value = shaderControl.yDisplacement.byWorldY;
    material.uniforms.yDisplacementByWorldZ.value = shaderControl.yDisplacement.byWorldZ;
    material.uniforms.yDisplacementInfluence.value = shaderControl.yDisplacement.influence;

    material.uniforms.zDisplacementByLocalX.value = shaderControl.zDisplacement.byLocalX;
    material.uniforms.zDisplacementByLocalY.value = shaderControl.zDisplacement.byLocalY;
    material.uniforms.zDisplacementByLocalZ.value = shaderControl.zDisplacement.byLocalZ;
    material.uniforms.zDisplacementByWorldX.value = shaderControl.zDisplacement.byWorldX;
    material.uniforms.zDisplacementByWorldY.value = shaderControl.zDisplacement.byWorldY;
    material.uniforms.zDisplacementByWorldZ.value = shaderControl.zDisplacement.byWorldZ;
    material.uniforms.zDisplacementInfluence.value = shaderControl.zDisplacement.influence;

    if (!cameraControl.useFreeCam) {
        let value = clock.getElapsedTime() * cameraControl.speed;
        camera.position.x = Math.cos(value) * cameraControl.xMultiply;
        camera.position.z = Math.sin(value) * cameraControl.zMultiply;
        camera.position.y = Math.sin(value + Math.cos(value)) * cameraControl.yMultiply;
        camera.lookAt(0, 0, 0);
    }

    composer.render( scene, camera );
}

rendering();