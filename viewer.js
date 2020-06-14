var camera,
  controls,
  scene,
  renderer,
  texture,
  Etexture = false,
  material,
  skinData = false,
  pulsT = false,
  movT = false,
  model = false;

var config = {
    fov: 45,
    webgl: {
      preserveDrawingBuffer: true,
      precision: "mediump",
      powerPreference: "high-performance",
      alpha: true,
      antialias: true,
    },
    params: new URLSearchParams(window.location.search),
    camP: [0, 10, 0],
  },
  lights = [new THREE.AmbientLight(new THREE.Color(0x919191))];
function get(name) {
  var value = config.params.get(name);
  return value ? value : false;
}
init();
//render(); // remove when using next line for animation loop (requestAnimationFrame)
animate();
function init() {
  scene = new THREE.Scene();
  scene.background = get("back")?get("back"):null
  scene.autoUpdate = true;
  renderer = new THREE.WebGLRenderer(config.webgl);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  camera = new THREE.PerspectiveCamera(
    config.fov,
    window.innerWidth / window.innerHeight,
    1,
    1000
  );
  camera.position.set(config.camP[0], config.camP[1], config.camP[2]);
  scene.add(camera);
  for (light of lights) scene.add(light);
  // controls

  controls = new THREE.OrbitControls(camera, renderer.domElement);

  controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled

  controls.screenSpacePanning = true;

  //controls.maxPolarAngle = Math.PI / 2;

  window.addEventListener("resize", onWindowResize, false);

  if (get("skinIdP")) {
    load({
      skinIdP: get("skinIdP"),
    });
  }
}
function load(conf) {
  skinData = items[Number(conf.skinIdP)];
  var modelurl = "",
    scale = 1;
  if (skinData.weapon) {
    var weapon = h[skinData.weapon];
    var id = skinData.weapon;

    skinId = false;
    var E, T;
    if (skinData.mid !== undefined) {
      E = utils.url("texture2", id + `_${skinData.mid}_e`);
      T = utils.url("texture2", id + `_${skinData.mid}`);
    } else if (skinData.tex && skinData.sameGlow) {
      var tex = skinData.tex;
      E = utils.url("texture3", tex);
      T = E;
    } else if (skinData.wire) {
    } else {
      E = utils.url("texture", id + `_${skinData.id}_e`);
      T = utils.url("texture", id + `_${skinData.id}`);
    }
    if (!skinData.wire) {
      texture = new THREE.TextureLoader().load(T);
    }
    if (skinData.glow || skinData.sameGlow) {
      Etexture = new THREE.TextureLoader().load(E);
    }
    if (skinData.pulsT) pulsT = true;
    if (skinData.movT) movT = skinData.movT;
    material = new THREE.MeshPhongMaterial({
      map: texture,
      color: new THREE.Color(16777215),
      emissive: Etexture ? new THREE.Color("white") : new THREE.Color("black"),
      emissiveMap: Etexture ? Etexture : null,
      transparent: skinData.opac?true:false,
      opacity: skinData.opac?skinData.opac:1
    });
    if (skinData.wire) {
      material.wireframe = true;
    }
    scale =
      skinData.mid !== undefined
        ? 1
          ? skinData.scl
          : skinData.scl
        : h[skinData.weapon].scale;
    modelurl = utils.url(
      "model",
      skinData.mid !== undefined ? `${id}_${skinData.mid}` : id
    );
  } else if (skinData.type) {
    var url = types[skinData.type] + skinData.id;
    if (skinData.movT) movT = skinData.movT;
    var texUrl;
    if (skinData.tex) {
      texUrl = skinData.tex;
    } else {
      texUrl = url + (skinData.tex ? `_${skinData.tex}` : "");
    }
    modelurl = utils.url("model2", url);
    scale = skinData.scl == undefined ? 1 : skinData.scl;
    if (skinData.sclMlt) {
      scale = scale * skinData.sclMlt;
    }
    switch (skinData.type) {
      case 3:
      case 1:
      case 2:
        texture = new THREE.TextureLoader().load(utils.url("texture3", texUrl));
        if (skinData.glow) {
          Etexture = new THREE.TextureLoader().load(
            utils.url("texture3", texUrl + "_e")
          );
        } else if (skinData.sameGlow) {
          Etexture = new THREE.TextureLoader().load(
            utils.url("texture3", texUrl)
          );
        }

        break;
        case 5:
          var obj = new THREE.GLTFLoader().load(`./dye_${skinData.id}.gltf`,function(){
            
          })
        break;
    }

    material = new THREE.MeshPhongMaterial({
      map: texture,
      color: new THREE.Color("white"),
      emissive: new THREE.Color(Etexture ? "white" : "black"),
      emissiveMap: Etexture ? Etexture : null,
      transparent: skinData.opac?true:false,
      opacity: skinData.opac?skinData.opac:1
    });
  }
  var obj = new THREE.OBJLoader().load(modelurl, function (object) {
    object.name = "weapon";
    model = object;
    console.log(scale);
    object.scale.set(scale, scale, scale);
    object.traverse(function (child) {
      if (child instanceof THREE.Mesh) {
        child.material = material;
      }
    });
    scene.add(object);
  });
  
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}
function lerp({
  from = 0,
  to = 1,
  duration = 300,
  ease = easeOut,
  onUpdate,
  onEnd,
} = {}) {
  const delta = to - from;
  const startTime = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const latest = from + ease(progress) * delta;

    if (onUpdate) onUpdate(latest);

    if (progress < 1) {
      requestAnimationFrame(update);
    }
    if (latest == to) {
      if (onEnd) {
        onEnd();
      }
    }
  }

  requestAnimationFrame(update);
}
function easeOut(progress, power = 2) {
  return 1 - (1 - progress) ** power;
}

var c = 1677721;
function animate() {
  if (skinData.rgb) {
    if (!skinData.rgbs) {
      c += Math.floor(5 * Math.PI);
    } else {
      c += Math.floor(skinData.rgb * 10);
    }
    material.color = new THREE.Color(c);
    material.emissive = material.color;
  }
  if (skinData.rAnim) {
    if (model) {
      model.rotation[skinData.rAnimA ? skinData.rAnimA : "x"] +=
        skinData.rAnim * 10;
    }
  }
  if (skinData.movT) {
    texture.wrapS = texture.wrapY = THREE.RepeatWrapping;
    material.emissiveMap.wrapS = material.emissiveMap.wrapY =
      THREE.RepeatWrapping;
  }
  requestAnimationFrame(animate);
  if (skinData) {
    if (movT) {
      material.map.offset.x += skinData.movT * 20;
      material.emissiveMap.offset.x = material.map.offset.x;
    }
    if (material && pulsT) {
      material.emissiveIntensity = Math.abs(Math.sin(Date.now() / 400) * 0.75);
      material.emissiveIntensity += 0.05;
    }
    if (skinData.rgb) {
      //material.color +=1
    }
  }
  controls.update(); // only required if controls.enableDamping = true, or if controls.autoRotate = true

  render();
}

function render() {
  renderer.render(scene, camera);
}
