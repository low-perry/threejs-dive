import * as THREE from "three";
// @ts-ignore
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
camera.position.z = 2;

const scene = new THREE.Scene();

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.01;

const loader = new THREE.TextureLoader();
const geo = new THREE.IcosahedronGeometry(1, 12);
const mat = new THREE.MeshStandardMaterial({
 map: loader.load("../assets/earthmap1k.jpg"),
});
const earthMesh = new THREE.Mesh(geo, mat);
scene.add(earthMesh);


const hemiLight = new THREE.HemisphereLight(0xffffff, 0x000000);
scene.add(hemiLight);

function animate() {
  earthMesh.rotation.y += 0.01;
  earthMesh.rotation.x += 0.01;
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
  controls.update();
}
animate();