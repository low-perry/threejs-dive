import * as THREE from "three";
import { GLTFLoader } from "jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "jsm/controls/OrbitControls.js";

const w = window.innerWidth;
const h = window.innerHeight;
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(w, h);
document.body.appendChild(renderer.domElement);

const fov = 75;
const aspect = w / h;
const near = 0.1;
const far = 1000;
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
camera.position.z = 17;
camera.position.y = 5;
camera.position.x = 10;
const scene = new THREE.Scene();

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.01;

// Add ambient light for general illumination
scene.add(new THREE.AmbientLight(0x555555));

// Increase the intensity of the existing point light
const pointLight1 = new THREE.PointLight(0xffffff, 2);
pointLight1.position.set(50, 50, 50);
scene.add(pointLight1);

// Add additional point lights at different positions
const pointLight2 = new THREE.PointLight(0xffffff, 1.5);
pointLight2.position.set(-50, 50, 50);
scene.add(pointLight2);

const pointLight3 = new THREE.PointLight(0xffffff, 1.5);
pointLight3.position.set(50, -50, 50);
scene.add(pointLight3);

const pointLight4 = new THREE.PointLight(0xffffff, 1.5);
pointLight4.position.set(50, 50, -50);
scene.add(pointLight4);

// Add a directional light for more uniform lighting
const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
directionalLight.position.set(0, 1, 0);
scene.add(directionalLight);

const loader = new GLTFLoader();

let moon1, moon2, astronaut;
let modelsLoaded = 0;

// Load moon1 glTF model
loader.load(
  "moon.glb",
  function (gltf) {
    moon1 = gltf.scene;
    // Adjust scale/rotation if needed (depends on your model)

    scene.add(moon1);
    modelsLoaded++;
    //checkModelsLoaded();
  },
  undefined,
  function (error) {
    console.error("Error loading moon.glb:", error);
  }
);

//load astronaut glTF model
loader.load(
  "astronaut1.glb",
  function (gltf) {
    astronaut = gltf.scene;
    // Adjust scale/rotation if needed (depends on your model)
    astronaut.position.copy(moon1.position);
    astronaut.position.y -= 2.7;
    astronaut.position.z += 5;
    astronaut.position.x += 1.5;
    scene.add(astronaut);
    modelsLoaded++;
    //checkModelsLoaded();
  },
  undefined,
  function (error) {
    console.error("Error loading astronaut.glb:", error);
  }
);

function animate() {
  requestAnimationFrame(animate);
  astronaut.rotation.y -= 0.01;
  moon1.rotation.y += 0.01;
  moon1.rotation.x += 0.01;
  moon1.rotation.z += 0.01;
  renderer.render(scene, camera);
  controls.update();
}

animate();