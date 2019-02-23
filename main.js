const glMat4            = require('gl-mat4'),
      Clock             = require('./TimeHandler.js'),
      FireData          = require('./FireDataSet.js'),
      GraphicsProgram   = require('./GraphicsProgram');


// ============MAIN OBJECTS TO MANAGE MY PROGRAM =================

var MyGraphicsProgram = new GraphicsProgram();
var TimeHandler = new Clock(0);
var webGL = MyGraphicsProgram.getWebGL();
var FireDataSet = new FireData(webGL, 'fire-texture-atlas.jpg');

// ===================================================================

// ========================= SHADERS ==================================
var vertexShader = MyGraphicsProgram.compileVertexShader();
var fragmentShader = MyGraphicsProgram.compileFragmentShader();
var shaderProgram = MyGraphicsProgram.startShaderProgram(vertexShader, fragmentShader);


var lifetimeAttr = webGL.getAttribLocation(shaderProgram, 'aLifetime'),
    texCoordAttr = webGL.getAttribLocation(shaderProgram, 'aTextureCoords'),
    triCornerAttr = webGL.getAttribLocation(shaderProgram, 'aTriCorner'),
    centerOffsetAttr = webGL.getAttribLocation(shaderProgram, 'aCenterOffset'),
    velocityAttr = webGL.getAttribLocation(shaderProgram, 'aVelocity');

// ENABLE VERTEX ATTRIBUTES
webGL.enableVertexAttribArray(lifetimeAttr);
webGL.enableVertexAttribArray(texCoordAttr);
webGL.enableVertexAttribArray(triCornerAttr);
webGL.enableVertexAttribArray(centerOffsetAttr);
webGL.enableVertexAttribArray(velocityAttr);



// =============================================================================



// ========================= SEND DATA TO GPU ==================================

// GET LOCATION OF UNIFORMS
var timeUni = webGL.getUniformLocation(shaderProgram, 'uTime'),
    timeUniFrag = webGL.getUniformLocation(shaderProgram, 'uTimeFrag'),
    firePosUni = webGL.getUniformLocation(shaderProgram, 'uFirePos'),
    perspectiveUni = webGL.getUniformLocation(shaderProgram, 'uPMatrix'),
    viewUni = webGL.getUniformLocation(shaderProgram, 'uViewMatrix'),
    colorUni = webGL.getUniformLocation(shaderProgram, 'uColor'),
    fireAtlasUni = webGL.getUniformLocation(shaderProgram, 'uFireAtlas'),
    useBillboardUni = webGL.getUniformLocation(shaderProgram, 'uUseBillboarding');


// Push all of the particle attrs to the GPU
function createBuffer (bufferType, DataType, data) {
  var buffer = webGL.createBuffer();
  webGL.bindBuffer(webGL[bufferType], buffer);
  webGL.bufferData(webGL[bufferType], new DataType(data), webGL.STATIC_DRAW);
  return buffer;
}

createBuffer('ARRAY_BUFFER', Float32Array, FireDataSet.getLifeTimes());
webGL.vertexAttribPointer(lifetimeAttr, 1, webGL.FLOAT, false, 0, 0);

createBuffer('ARRAY_BUFFER', Float32Array, FireDataSet.getTexCoords());
webGL.vertexAttribPointer(texCoordAttr, 2, webGL.FLOAT, false, 0, 0);

createBuffer('ARRAY_BUFFER', Float32Array, FireDataSet.getTriCorners());
webGL.vertexAttribPointer(triCornerAttr, 2, webGL.FLOAT, false, 0, 0);

createBuffer('ARRAY_BUFFER', Float32Array, FireDataSet.getCenterOffsets());
webGL.vertexAttribPointer(centerOffsetAttr, 3, webGL.FLOAT, false, 0, 0);

createBuffer('ARRAY_BUFFER', Float32Array, FireDataSet.getVelocities());
webGL.vertexAttribPointer(velocityAttr, 3, webGL.FLOAT, false, 0, 0);

createBuffer('ELEMENT_ARRAY_BUFFER', Uint16Array, FireDataSet.getVertexindices());

webGL.enable(webGL.BLEND);
webGL.blendFunc(webGL.ONE, webGL.ONE);

webGL.activeTexture(webGL.TEXTURE0)
webGL.bindTexture(webGL.TEXTURE_2D, FireDataSet.getFireTexture())
webGL.uniform1i(fireAtlasUni, 0)

webGL.uniformMatrix4fv(perspectiveUni, false, glMat4.perspective([], Math.PI / 3, 1, 0.01, 1000));

// add two fires to our data set. one is red and one is green
FireDataSet.addFire([0.0, 0.0, 0.0], [0.8, 0.25, 0.25, 1.0]);
FireDataSet.addFire([0.25, 0.0, 0.0], [0.0, 0.25, 0.0, 0]);


// =================== SETUP CAMERA && ACTUALLY DRAW OUT THE DATA =========================
function createCamera () {
    var camera = glMat4.create()

    // Start our camera off at a height of 0.25 and 1 unit
    // away from the origin
    glMat4.translate(camera, camera, [0.5, 0.25, 0.75])

    // Rotate our camera around the y and x axis of the world
    // as the viewer clicks or drags their finger
    var xAxisRotation = glMat4.create()
    var yAxisRotation = glMat4.create()
    glMat4.rotateX(xAxisRotation, xAxisRotation, -MyGraphicsProgram.xRotation)
    glMat4.rotateY(yAxisRotation, yAxisRotation, MyGraphicsProgram.yRotation)
    glMat4.multiply(camera, xAxisRotation, camera)
    glMat4.multiply(camera, yAxisRotation, camera)

    // Make our camera look at the first red fire
    var cameraPos = [camera[12], camera[13], camera[14]]
    glMat4.lookAt(camera, cameraPos, [0.0, 0.0, 0.0], [0, 1, 0])

    return camera
}

function draw () {
  // Once the image is loaded start drawing our particle effect
  if (FireDataSet.ImageIsLoaded()) {
    webGL.clear(webGL.COLOR_BUFFER_BIT | webGL.DEPTH_BUFFER_BIT);

    TimeHandler.incrementClockTime();

    // Pass the current time into our vertex and fragment shaders
    webGL.uniform1f(timeUni, TimeHandler.getClockTime());
    webGL.uniform1f(timeUniFrag, TimeHandler.getClockTime());

    // Pass our world view matrix into our vertex shader
    webGL.uniformMatrix4fv(viewUni, false, createCamera());

    webGL.uniform1i(useBillboardUni, MyGraphicsProgram.billboardingEnabled);
    FireDataSet.drawFire(firePosUni, colorUni);

  }

  window.requestAnimationFrame(draw)
}

// =============================================================================


draw();