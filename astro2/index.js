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

/* const geo = new THREE.BoxGeometry(1, 1, 1);
const mat = new THREE.MeshStandardMaterial({
  color: 0xffffff,
  flatShading: true
});
const mesh = new THREE.Mesh(geo, mat);
scene.add(mesh);

const geo2 = new THREE.BoxGeometry(1, 1, 1);
const mat2 = new THREE.MeshStandardMaterial({
  color: 0xffffff,
  flatShading: true
}); */
/* const mesh2 = new THREE.Mesh(geo2, mat2);
mesh2.position.x = 2;
mesh2.position.y = 2;
mesh2.position.z = 2;
scene.add(mesh2); */

const loader = new GLTFLoader();

let moon1, moon2, astronaut;
let modelsLoaded = 0;

// Helper to check when all three models are loaded.
function checkModelsLoaded() {
  if (modelsLoaded === 3) {
    // Set astronaut's initial position to moon1's position
    astronaut.position.copy(moon1.position);
    // Offset to simulate sitting on the surface
    astronaut.position.y += 3.8;
    astronaut.position.z += 0.5;
    astronaut.position.x += 1
    // Start the simulation once all models have been loaded.
    console.log("Moon1 position: ", moon1.position);
    console.log("Moon2 position: ", moon2.position);
    console.log("Astronaut position: ", astronaut.position);
    animate();
  }
}

// Load moon1 glTF model
loader.load(
  "../assets/moon.glb",
  function (gltf) {
    moon1 = gltf.scene;
    // Adjust scale/rotation if needed (depends on your model)
    moon1.scale.set(1, 1, 1);
    scene.add(moon1);
    modelsLoaded++;
    checkModelsLoaded();
  },
  undefined,
  function (error) {
    console.error("Error loading moon.glb:", error);
  }
);

// Load moon2 glTF model
loader.load(
  "../assets/moon.glb",
  function (gltf) {
    moon2 = gltf.scene;
    moon2.scale.set(1, 1, 1);
    scene.add(moon2);
    modelsLoaded++;
    checkModelsLoaded();
  },
  undefined,
  function (error) {
    console.error("Error loading moon.glb:", error);
  }
);

// Load astronaut glTF model
loader.load(
  "../assets/astropurple.glb",
  function (gltf) {
    astronaut = gltf.scene;
    astronaut.scale.set(1, 1, 1);
    scene.add(astronaut);
    modelsLoaded++;
    checkModelsLoaded();
  },
  undefined,
  function (error) {
    console.error("Error loading astronaut1.glb:", error);
  }
);


function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
  controls.update();
}

animate();