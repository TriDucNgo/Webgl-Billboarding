var vertShader      = require('./shaders/vert.js'),
    fragShader      = require('./shaders/frag.js');

class GraphicsProgram {
    constructor() {
        this.vertexShader = vertShader();
        this.fragmentShader = fragShader();
        this.canvas = this.initCanvas(600,600);
        this.webGL = this.initWebGL();
        this.addElementsToDoc([this.initButton(), this.canvas]);
        this.billboardingEnabled = false;
        this.xRotation = 0;
        this.yRotation = 0;
        this.lastMouseX = 0;
        this.lastMouseY = 0;
        this.isDragging = true;
    }

    getWebGL() {return this.webGL;}
    getCanvas() {return this.canvas;}

    // simply get the webgl context from out canvas and clear it to begin with.
    initWebGL() {
        let webGL = this.getCanvas().getContext('webgl');
        webGL.clearColor(0.0, 0.0, 0.0, 1.0);
        webGL.viewport(0, 0, 500, 500);
        return webGL;
    }

    // compiles this vertex shader source
    compileVertexShader() {
        let vertexShader = this.webGL.createShader(this.webGL.VERTEX_SHADER);
        this.webGL.shaderSource(vertexShader, this.vertexShader);
        this.webGL.compileShader(vertexShader);
        return vertexShader;
    }

    // compiles this frag shader source
    compileFragmentShader() {
        let fragmentShader = this.webGL.createShader(this.webGL.FRAGMENT_SHADER)
        this.webGL.shaderSource(fragmentShader, this.fragmentShader)
        this.webGL.compileShader(fragmentShader)
        return fragmentShader;
    }

    // starts the program by attaching the necessary shaders and linking it to the webgl context
    startShaderProgram(vertexShader, fragmentShader) {
        let shaderProgram = this.webGL.createProgram();
        this.webGL.attachShader(shaderProgram, vertexShader)
        this.webGL.attachShader(shaderProgram, fragmentShader)
        this.webGL.linkProgram(shaderProgram)
        this.webGL.useProgram(shaderProgram)
        return shaderProgram;
    }

    // setup canvas for our graphics program and allow mouse movements
    initCanvas(width, height) {
        let canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        canvas.onmousedown = (e) => {
            this.isDragging = true
            this.lastMouseX = e.pageX
            this.lastMouseY = e.pageY
        }

        canvas.onmousemove = (e) => {
            if (this.isDragging) {
                this.xRotation += (e.pageY - this.lastMouseY) / 50
                this.yRotation -= (e.pageX - this.lastMouseX) / 50

                this.xRotation = Math.min(this.xRotation, Math.PI / 2.5)
                this.xRotation = Math.max(this.xRotation, -Math.PI / 2.5)

                this.lastMouseX = e.pageX
                this.lastMouseY = e.pageY
            }
        }
        canvas.onmouseup = (e) => {(this.isDragging = false)};

        return canvas;
    }

    // button to simply turn billboarding on and off.
    initButton() {
        var button = document.createElement('button');
        button.innerHTML = 'Enable billboarding'
        button.style.display = 'block'
        button.style.cursor = 'pointer'
        button.style.marginBottom = '3px'
        button.style.height = '40px'
        button.style.width = '160px'
        button.onclick = () => {
            this.billboardingEnabled = !this.billboardingEnabled
            button.innerHTML = (this.billboardingEnabled ? 'Disable billboarding' : 'Enable billboarding')
        }
        return button;
    }

    // convenience function to add elements onto the document.body
    addElementsToDoc(elements) {
        for(let i = 0; i < elements.length; i++) document.body.appendChild(elements[i]);
    }


}

module.exports = GraphicsProgram;