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
camera.position.z = 50;

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

// --------------------------
// 2. Load GLTF Models
// --------------------------
// We'll load three models: two for the orbiting bodies and one for the astronaut.
const loader = new GLTFLoader();

let moon1, moon2, astronaut;
let modelsLoaded = 0;

// Helper to check when all three models are loaded.
function checkModelsLoaded() {
  if (modelsLoaded === 3) {
    // Set astronaut's initial position to moon1's position
    astronaut.position.copy(moon1.position);
    astronaut.position.y -= 5.4;
    astronaut.position.z += 10;
    astronaut.position.x += 3;
    // Offset to simulate sitting on the surface
    // Start the simulation once all models have been loaded.
    console.log("Moon1 position: ", moon1.position);
    console.log("Moon2 position: ", moon2.position);
    console.log("Astronaut position: ", astronaut.position);
    animate();
  }
}

// Load moon1 glTF model
loader.load(
  "models/moon.glb",
  function (gltf) {
    moon1 = gltf.scene;
    // Adjust scale/rotation if needed (depends on your model)
    moon1.scale.set(2, 2, 2);
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
  "models/moon.glb",
  function (gltf) {
    moon2 = gltf.scene;
    moon2.scale.set(2, 2, 2);
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
  "models/astronaut1.glb",
  function (gltf) {
    astronaut = gltf.scene;
    astronaut.scale.set(2, 2, 2);
    scene.add(astronaut);
    modelsLoaded++;
    checkModelsLoaded();
  },
  undefined,
  function (error) {
    console.error("Error loading astronaut1.glb:", error);
  }
);

// --------------------------
// 3. Orbital and astronaut Jump Parameters
// --------------------------
// Two-body orbit parameters.
const m1 = 5; // Mass for moon1
const m2 = 3; // Mass for moon2
let theta = 0; // orbital phase (true anomaly)
const p = 24; // semi‑latus rectum: controls overall orbit size
const e = 0.5; // eccentricity of the orbit

// astronaut jumping variables.
let astronautOnMoon1 = true; // Indicates which body the astronaut is attached to.
let isJumping = false;
let jumpProgress = 0; // Parameter from 0 to 1 representing jump progress.
let jumpStart, jumpTarget, jumpControl;
const jumpSpeed = 0.012; // Increased from 0.005 to make jump 3x faster
const jumpHeight = 25; // Slightly increased height for a more dramatic jump

// Trigger the jump when Space is pressed.
document.addEventListener("keydown", (event) => {
  if (event.code === "Space" && !isJumping) {
    initiateAstronautJump();
  }
});

function initiateAstronautJump() {
  if (!moon1 || !moon2 || !astronaut) return;
  isJumping = true;
  jumpProgress = 0;
  
  // Calculate approximate effective jump duration accounting for easing
  const jumpDuration = 0.9 / jumpSpeed;
  
  // Predict the future position of the target moon
  const futureTheta = theta + (jumpDuration * 0.01);
  const futureR = p / (1 + e * Math.cos(futureTheta));
  const futureX = futureR * Math.cos(futureTheta);
  const futureZ = futureR * Math.sin(futureTheta);
  
  if (astronautOnMoon1) {
    jumpStart = moon1.position.clone();
    // Calculate future position of moon2
    const futurePos = new THREE.Vector3(
      -m1 / (m1 + m2) * futureX,
      0,
      -m1 / (m1 + m2) * futureZ
    );
    
    // Apply the same offsets used for positioning the astronaut
    futurePos.y -= 5.4;
    futurePos.z += 10;
    futurePos.x += 3;
    
    jumpTarget = futurePos;
  } else {
    jumpStart = moon2.position.clone();
    // Calculate future position of moon1
    const futurePos = new THREE.Vector3(
      m2 / (m1 + m2) * futureX,
      0,
      m2 / (m1 + m2) * futureZ
    );
    
    // Apply the same offsets used for positioning the astronaut
    futurePos.y -= 5.4;
    futurePos.z += 10;
    futurePos.x += 3;
    
    jumpTarget = futurePos;
  }
  
  // Define control point by taking the midpoint and adding a vertical offset
  jumpControl = jumpStart.clone().add(jumpTarget).multiplyScalar(0.5);
  jumpControl.y += jumpHeight;
}

// --------------------------
// 4. Animation Loop
// --------------------------
function animate() {
  requestAnimationFrame(animate);

  // Update the orbital positions.
  const r = p / (1 + e * Math.cos(theta));
  const x = r * Math.cos(theta);
  const z = r * Math.sin(theta);
  const r1_factor = m2 / (m1 + m2);
  const r2_factor = m1 / (m1 + m2);

  if (moon1) moon1.position.set(r1_factor * x, 0, r1_factor * z);
  if (moon2) moon2.position.set(-r2_factor * x, 0, -r2_factor * z);

  theta += 0.01;

  // Update the astronaut's position.
  if (isJumping) {
    jumpProgress += jumpSpeed;
    let t = jumpProgress;
    if (t >= 1) {
      t = 1;
      isJumping = false;
      astronautOnMoon1 = !astronautOnMoon1; // Toggle the attachment on landing.
    }
    // Quadratic Bezier interpolation:
    // pos(t) = (1-t)²*jumpStart + 2(1-t)*t*jumpControl + t²*jumpTarget
    const oneMinusT = 1 - t;
    const jumpPos = new THREE.Vector3()
      .add(jumpStart.clone().multiplyScalar(oneMinusT * oneMinusT))
      .add(jumpControl.clone().multiplyScalar(2 * oneMinusT * t))
      .add(jumpTarget.clone().multiplyScalar(t * t));
    astronaut.position.copy(jumpPos);
  } else {
    // While not jumping, the astronaut stays "attached" to its host body.
    if (astronaut) {
      if (astronautOnMoon1 && moon1) {
        astronaut.position.copy(moon1.position);
        astronaut.position.y -= 5.4;
        astronaut.position.z += 10;
        astronaut.position.x += 3;
      } else if (moon2) {
        astronaut.position.copy(moon2.position);
        astronaut.position.y -= 5.4;
        astronaut.position.z += 10;
        astronaut.position.x += 3;
      }
    }
  }

  renderer.render(scene, camera);
}
 
// --------------------------
// 5. Handle Window Resize
// --------------------------
window.addEventListener("resize", onWindowResize, false);
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
