// Credit to Alexander Shah at https://zandershah.github.io/ for the concept and original code.

// Standard Normal variate using Box-Muller transform.
function gaussianRandom() {
    var u = 0, v = 0;
    while(u === 0) u = Math.random(); //Converting [0,1) to (0,1)
    while(v === 0) v = Math.random(); //Converting [0,1) to (0,1)
    return Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );
}

function Feather() {
  var size = Math.random() * 40 + 20;

  var feather = new THREE.Mesh(
    new THREE.PlaneBufferGeometry(size, size, 3),
    new THREE.MeshLambertMaterial({
      side: THREE.DoubleSide,
      map: feather_texture,
      alphaTest: 0.5,
      color: new THREE.Color(0.0, 1.0, 1.0)
    })
  );

  feather.opts = {};

  // We want all of the feathers to start on the "ground" and fly upwards.
  feather.position.set(
    gaussianRandom() * 100,
    Math.random()*700 - 300,
    gaussianRandom() * 100
  );
  feather.opts.position = {
    dx: (Math.random() - 0.5),
    dy: Math.random() + 1.2,
    dz: (Math.random() - 0.5)
  }

  feather.rotation.set(
    Math.random() * Math.PI * 2,
    Math.random() * Math.PI * 2,
    Math.random() * Math.PI * 2
  );
  feather.opts.rotation = {
    dx: (Math.random() - 0.5) / 50,
    dy: (Math.random() - 0.5) / 50,
    dz: (Math.random() - 0.5) / 50
  };

  return feather;
}

function init() {
  width = window.innerWidth;
  height = window.innerHeight;

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(45, width / height, 1, 1000);
  camera.position.set(0, 0, 0);
  camera.lookAt(new THREE.Vector3(0, 100, 0));

  feather_texture = new THREE.TextureLoader().load('data:image/png;base64,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');

  feathers = new THREE.Object3D();
  while (feathers.children.length < 100) {
    feathers.add(new Feather());
  }
  scene.add(feathers);

  scene.fog = new THREE.Fog(0xFFFFFF, 300, 1000);

  var light = new THREE.HemisphereLight();
  scene.add(light);

  renderer = new THREE.WebGLRenderer();
  renderer.setSize(width, height);
  renderer.setClearColor(0xFFFFFF);

  document.body.appendChild(renderer.domElement);

  requestAnimationFrame(animate);
}

function animate() {
  
  for (let f in feathers.children) {
    let feather = feathers.children[f];

    feather.position.x += feather.opts.position.dx;
    feather.position.y += feather.opts.position.dy;
    feather.position.z += feather.opts.position.dz;
    feather.rotation.x += feather.opts.rotation.dx;
    feather.rotation.y += feather.opts.rotation.dy;
    feather.rotation.z += feather.opts.rotation.dz;

    if (feather.position.y >= 400) {
      feather.position.set(
		gaussianRandom() * 50,
		-200,
		gaussianRandom() * 50
      );
    }
  }

  camera.position.x = Math.sin(Date.now()/2500) * 600;
  camera.position.z = Math.cos(Date.now()/2500) * 600;
  camera.lookAt(new THREE.Vector3(0, 100, 0));

  renderer.render(scene, camera);
  
  requestAnimationFrame(animate);
};

document.getElementsByTagName("body")[0].onresize = function() {
  width = window.innerWidth;
  height = window.innerHeight;

  renderer.setSize(width, height);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}

window.onload = init;
