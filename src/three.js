import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { RGBELoader } from "three/addons/loaders/RGBELoader.js"

const scene = new THREE.Scene();
scene.background = new THREE.Color("#202020");
let clock = new THREE.Clock();
/* ---------- Caméra / Renderer ---------- */
const camera = new THREE.PerspectiveCamera(
  40,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 30;
camera.position.y = 1;
// Gltf Camera
let blenderCamera;

const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector("#scene"),
  antialias: true,
});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

/* ---------- OrbitControls ---------- */
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.autoRotate = true;

/* ---------- Object In Scene ---------- */
let mixer;
let modelURL = "../assets/MyWorld.glb",
  model;
const loader = new GLTFLoader();
loader.load(modelURL, (gltf) => {
  blenderCamera = gltf.cameras["0"];
  model = gltf.scene;
  // fix material (metalness must be 0)
  model.traverse((child) => {
    if (child.isMesh) {
      child.material.metalness = 0;
    }
  });
  scene.add(model);
  mixer = new THREE.AnimationMixer(gltf.scene);
  gltf.animations.forEach((clip) => {
    mixer.clipAction(clip).play();
  });
});

const geometry = new THREE.BoxGeometry( 1, 1, 1 );
const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
const cube = new THREE.Mesh( geometry, material );
//scene.add( cube );

/* ---------- HDRI ---------- */
// const pmremGenerator = new THREE.PMREMGenerator( renderer );

// const hdriLoader = new RGBELoader()
// hdriLoader.load( '../assets/shy.hdr', function ( texture ) {
//   const envMap = pmremGenerator.fromEquirectangular( texture ).texture;
//   texture.dispose(); 
//   scene.environment = envMap
// } );

new RGBELoader().load('../assets/shy.hdr', texture => {
  const gen = new THREE.PMREMGenerator(renderer)
  const envMap = gen.fromEquirectangular(texture).texture
  scene.environment = envMap
  scene.background = envMap
  
  texture.dispose()
  gen.dispose()
})

/* ---------- Animation ---------- */
window.addEventListener("resize", (event) => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

function animate() {
  //controls.update();
  requestAnimationFrame(animate);
  var delta = clock.getDelta();

  // cube.rotation.x += 0.01;
	// cube.rotation.y += 0.01;

  if ( mixer ) mixer.update( delta );
  renderer.render(scene, blenderCamera);
}
animate();
