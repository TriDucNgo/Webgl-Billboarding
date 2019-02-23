// stores all of the necessary data to render fires
class FireDataSet {
    constructor(webGLContext, textureSrc) {
        this.fires = [];
        this.numParticles = 1000;
        this.webGL = webGLContext;
        this.fireTexture = this.webGL.createTexture();
        this.imageIsLoaded = false;
        this.fireMap = this.initFireMap(textureSrc);

        this.lifetimes     = [],
        this.triCorners    = [],
        this.texCoords     = [],
        this.vertexIndices = [],
        this.centerOffsets = [],
        this.velocities    = [];

        this.genData();
    }

    getLifeTimes() {return this.lifetimes;}
    getTriCorners() {return this.triCorners;}
    getTexCoords() {return this.texCoords;}
    getVertexindices() {return this.vertexIndices;}
    getCenterOffsets() {return this.centerOffsets;}
    getVelocities() {return this.velocities;}
    getNumParticles() {return this.numParticles;}
    getFireTexture() {return this.fireTexture;}

    ImageIsLoaded() {return this.imageIsLoaded;}

    // initialize our texture mapping and bind it to webGl context
    initFireMap(textureSrc) {
        let fireMap = new window.Image();
        fireMap.src = textureSrc;
        fireMap.onload = () => {
            this.webGL.pixelStorei(this.webGL.UNPACK_FLIP_Y_WEBGL, true)
            this.webGL.bindTexture(this.webGL.TEXTURE_2D, this.fireTexture)
            this.webGL.texImage2D(this.webGL.TEXTURE_2D, 0, this.webGL.RGBA, this.webGL.RGBA, this.webGL.UNSIGNED_BYTE, fireMap)
            this.webGL.texParameteri(this.webGL.TEXTURE_2D, this.webGL.TEXTURE_MAG_FILTER, this.webGL.LINEAR)
            this.webGL.texParameteri(this.webGL.TEXTURE_2D, this.webGL.TEXTURE_MIN_FILTER, this.webGL.LINEAR)
            this.imageIsLoaded = true;
        }

        return fireMap;
    }

    // generate data for the fires.
    genData() {

        var triCornersCycle = [
            // Bottom left corner of the square
            -1.0, -1.0,
            // Bottom right corner of the square
            1.0, -1.0,
            // Top right corner of the square
            1.0, 1.0,
            // Top left corner of the square
            -1.0, 1.0
        ];
        var texCoordsCycle = [
            // Bottom left corner of the texture
            0, 0,
            // Bottom right corner of the texture
            1, 0,
            // Top right corner of the texture
            1, 1,
            // Top left corner of the texture
            0, 1
        ];

        for (var i = 0; i < this.numParticles; i++) {
            // Particles live for up to 8 seconds
            var lifetime = 8 * Math.random();

            // Particles are placed within 0.25 units from the center of the flame
            var diameterAroundCenter = 0.5;
            var halfDiameterAroundCenter = diameterAroundCenter / 2;

            // randomly set the x displacement from the center
            var xStartOffset = diameterAroundCenter * Math.random() - halfDiameterAroundCenter;
            xStartOffset /= 4;

            // randomly set the y displacement from the center
            var yStartOffset = diameterAroundCenter * Math.random() - halfDiameterAroundCenter;
            yStartOffset /= 10;

            // randomly set the z displacement from the center
            var zStartOffset = diameterAroundCenter * Math.random() - halfDiameterAroundCenter;
            zStartOffset /= 3;

            // randomly set how fast the particle shoots up into the air
            var upVelocity = 0.1 * Math.random();

            // randomly set how much the particle drifts to the left or right
            var xSideVelocity = 0.02 * Math.random();
            if (xStartOffset > 0) {
                xSideVelocity *= -1;
            }

            // set  how much the particle drifts to the front and back
            var zSideVelocity = 0.02 * Math.random();
            if (zStartOffset > 0) { zSideVelocity *= -1;}

            // Push the data for the four corners of the particle quad
            for (var j = 0; j < 4; j++) {
                this.lifetimes.push(lifetime)

                this.triCorners.push(triCornersCycle[j * 2])
                this.triCorners.push(triCornersCycle[j * 2 + 1])

                this.texCoords.push(texCoordsCycle[j * 2])
                this.texCoords.push(texCoordsCycle[j * 2 + 1])
                this.centerOffsets.push(xStartOffset)
                // Particles that start farther from the fire's center start slightly
                // higher. This gives the bottom of the fire a slight curve
                this.centerOffsets.push(yStartOffset + Math.abs(xStartOffset / 2.0))
                this.centerOffsets.push(zStartOffset)

                this.velocities.push(xSideVelocity)
                this.velocities.push(upVelocity)
                this.velocities.push(zSideVelocity)
            }

            // Push the 6 vertices that will form our quad
            // 3 for the first triangle and 3 for the second
            this.vertexIndices = this.vertexIndices.concat([
                0, 1, 2, 0, 2, 3
            ].map(function (num) { return num + 4 * i }))
        }
    }
    addFire(posArr, colorArr) {
        this.fires.push({
            posn: posArr,
            color: colorArr
        });
    }

    drawFire(posnUniform, colorUniform) {
        for(let i = 0; i < this.fires.length; i++) {
            const fire = this.fires[i];
            this.webGL.uniform3fv(posnUniform, fire.posn);
            this.webGL.uniform4fv(colorUniform, fire.color);
            this.webGL.drawElements(this.webGL.TRIANGLES, this.numParticles * 6, this.webGL.UNSIGNED_SHORT, 0);
        }
    }
}

module.exports = FireDataSet;