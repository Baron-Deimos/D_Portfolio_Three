import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const scene = new THREE.Scene();
scene.background = new THREE.Color("gainsboro");
let clock = new THREE.Clock();
/* ---------- Caméra / Renderer ---------- */
const camera = new THREE.PerspectiveCamera(
  40,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 5;
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
var light = new THREE.DirectionalLight("white", 3);
scene.add(light);

let mixer;
let modelURL = "../assets/homePage.glb",
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
  //if ( mixer ) mixer.update( delta );
  renderer.render(scene, camera);
}
animate();
