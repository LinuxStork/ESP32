#ifndef SITE_H
#define SITE_H

const char* htmlCode = R"html(
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title></title>
    <style>
      html,
      body {
        margin: 0;
        padding: 0;
        overflow-x: hidden;
        overflow-y: auto;
        height: 100%;
      }
      button {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        opacity: 0;
        z-index: 999;
        cursor: pointer;
      }
      p {
	      position: absolute;
	      top: 80%;
	      width: 100%;
	      text-align: center;
	      z-index: 100;
	      display:block;
        color: white;
}
    </style>
  </head>
  <body>
  <button id="btn" onclick="refreshPage()"></button>
  <p id="step"></p>

    <script type="module">
      import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
      import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";

      function refreshPage() {
        location.reload();
      }
      document.getElementById('btn').addEventListener('click', refreshPage);

      // Postavljanje Three.js scene
      const scene = new THREE.Scene();

      // Kamera
      const aspect = window.innerWidth / window.innerHeight;
      const camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 1000);
      camera.position.z = 10;
      camera.position.x = 5;
      camera.position.y = 10;
      camera.lookAt(0, 1.5, 0);
      camera.updateProjectionMatrix();

      // Svjetlo
      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
      directionalLight.position.set(10, 5, 10);
      scene.add(directionalLight);

      // Postavljanje renderera
      const renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(window.innerWidth, window.innerHeight);
      document.body.appendChild(renderer.domElement);

      // Stvoranje poda
      const floorGeometry = new THREE.PlaneGeometry(20, 20);
      const floorMaterial = new THREE.MeshStandardMaterial({
        color: 0x888888,
        side: THREE.DoubleSide,
      });
      const floor = new THREE.Mesh(floorGeometry, floorMaterial);
      floor.rotation.x = Math.PI / 2;
      scene.add(floor);

      let base;
      let shoulder1;
      let shoulder2;
      let upperArm;
      let hand;
      let gripper;

      // Kreiranje nove instance GLTFLoader-a
      const loader = new GLTFLoader();

      // Funkcija za učitavanje modela i vraćanje promise
      function loadModels() {
        return new Promise((resolve, reject) => {
          let timeout = setTimeout(() => {
            reject();
          }, 10000);

          //Baza | Base
          loader.load("http://167.235.195.106:80/Base.glb", (gltf) => {
            base = gltf.scene;
            base.scale.set(20, 20, 20);
            scene.add(base);
            //Rame | Shoulder
            loader.load("http://167.235.195.106:80/Shoulder.glb", (gltf) => {
              shoulder1 = gltf.scene;
              shoulder1.translateY(0.05);
              shoulder1.translateZ(0.035);
              shoulder1.translateX(0.015);
              base.add(shoulder1);
              loader.load("http://167.235.195.106:80/Shoulder.glb", (gltf) => {
                shoulder2 = gltf.scene;
                shoulder2.translateY(0.05);
                shoulder2.translateZ(-0.03);
                shoulder2.translateX(0.015);
                base.add(shoulder2);
              });
              //Nadlaktica | UpperArm
              loader.load("http://167.235.195.106:80/UpperArm.glb", (gltf) => {
                upperArm = gltf.scene;
                upperArm.translateY(0.12);
                upperArm.translateZ(-0.0135);
                shoulder1.add(upperArm);
                //Ruka | Hand
                loader.load("http://167.235.195.106:80/Hand.glb", (gltf) => {
                  hand = gltf.scene;
                  hand.translateY(0.092);
                  hand.translateZ(-0.021);
                  upperArm.add(hand);
                  //Hvataljka | Gripper
                  loader.load("http://167.235.195.106:80/Gripper.glb", (gltf) => {
                    gripper = gltf.scene;
                    gripper.translateY(0.035);
                    gripper.translateZ(0.027);
                    gripper.translateX(-0.005);
                    hand.add(gripper);
                    resolve();
                  });
                });
              });
            });
          });
        });
      }
      // Pozivanje funkcije loadModels(), ako su 3D modeli uspječno učitani pozivanje funkcije rotateJoints()
      loadModels()
        .then(() => {
          rotateJoints();
        })
        .catch((error) => {
          // Ako se 3D modeli ne uspiju učitati, stvorite vizualizaciju ruke robota s oblicima i zatim pozovite funkciju rotateJoints()
          // Baza | Base
          base = new THREE.Mesh(new THREE.BoxGeometry(2, 1, 2), new THREE.MeshStandardMaterial({ color: 0xff0000 }));
          scene.add(base);

          // Rame | Shoulder
          shoulder1 = new THREE.Object3D();
          shoulder2 = new THREE.Object3D();
          shoulder1.translateY(0.5);
          shoulder2.translateY(0.5);
          shoulder2.translateZ(0.6);
          base.add(shoulder1);
          base.add(shoulder2);

          let shoulderObject1 = new THREE.Mesh(new THREE.BoxGeometry(0.5, 3.5, 0.1), new THREE.MeshStandardMaterial({ color: 0xff0000 }));
          let shoulderObject2 = new THREE.Mesh(new THREE.BoxGeometry(0.5, 3.5, 0.1), new THREE.MeshStandardMaterial({ color: 0xff0000 }));
          shoulderObject1.translateY(1);
          shoulderObject2.translateY(1);
          shoulder1.add(shoulderObject1);
          shoulder2.add(shoulderObject2);

          // Nadlaktica | UpperArm
          upperArm = new THREE.Object3D();
          upperArm.translateY(2.5);
          upperArm.translateZ(0.3);
          shoulder1.add(upperArm);

          let upperArmObject = new THREE.Mesh(new THREE.BoxGeometry(0.5, 1.5, 0.5), new THREE.MeshStandardMaterial({ color: 0x000000 }));
          upperArmObject.translateY(0.5);
          upperArm.add(upperArmObject);

          // Ruka | Hand
          hand = new THREE.Object3D();
          hand.translateY(0.55);
          upperArm.add(hand);

          let handObject = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.6, 0.5), new THREE.MeshStandardMaterial({ color: 0xfffff }));
          handObject.translateY(1);
          hand.add(handObject);

          // Hvataljka | Gripper
          gripper = new THREE.Object3D();
          gripper.translateY(1);
          gripper.translateZ(0.35);
          hand.add(gripper);

          let gripperObject = new THREE.Mesh(new THREE.BoxGeometry(0.5, 1, 0.3), new THREE.MeshStandardMaterial({ color: 0xaa000 }));
          gripperObject.translateY(0.5);
          gripper.add(gripperObject);

          rotateJoints();
        });

      function rotateJoints() {
        // Inicijalizacija web socketa
        const esp32 = "ws://" + window.location.hostname + "/ws";
        const socket = new WebSocket(esp32);

        // Slušanje poruka s web socketa
        socket.addEventListener("message", (event) => {
          console.log("Received message:", event.data);
          const [joint, value, step] = event.data.split(" ");
          if (joint == "base") {
            options.base = parseFloat(value);
          } else if (joint == "shoulder") {
            options.shoulder1 = parseFloat(value);
            options.shoulder2 = parseFloat(value);
          } else if (joint == "upperArm") {
            options.upperArm = parseFloat(value);
          } else if (joint == "hand") {
            options.hand = parseFloat(value);
          } else if (joint == "gripper") {
            options.gripper = parseFloat(value);
          }
          if(step == 0){
            document.getElementById("step").textContent = "";
          }else{
            document.getElementById("step").textContent = "Step: " + step;
          }
        });

        const options = {
          base: 0,
          shoulder1: 0,
          shoulder2: 0,
          upperArm: 0,
          hand: 0,
          gripper: 0,
          //gripperTop: 0,
        };

        const zAxis = new THREE.Vector3(0, 0, 1);
        const yAxis = new THREE.Vector3(0, 1, 0);
        const xAxis = new THREE.Vector3(1, 0, 0);

        // Funkcija za rendering
        const render = function () {
          requestAnimationFrame(render);

          // Rotiranje zglobova na temelju vrijednosti web socketa
          base.setRotationFromAxisAngle(yAxis, options.base * (Math.PI / 180));
          shoulder1.setRotationFromAxisAngle(zAxis, options.shoulder1 * (Math.PI / 180));
          shoulder2.setRotationFromAxisAngle(zAxis, options.shoulder2 * (Math.PI / 180));
          upperArm.setRotationFromAxisAngle(zAxis, -options.upperArm * (Math.PI / 180));
          hand.setRotationFromAxisAngle(yAxis, options.hand * (Math.PI / 180));
          gripper.setRotationFromAxisAngle(zAxis, options.gripper * (Math.PI / 180));

          renderer.render(scene, camera);
        };
        render();
      }
    </script>
  </body>

</html>
)html";
#endif
