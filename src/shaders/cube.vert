float rand(float n) {
    return fract(sin(n) * 43758.5453123);
}

float noise(float p) {
    float fl = floor(p);
    float fc = fract(p);
    return mix(rand(fl), rand(fl + 1.0), fc);
}

uniform vec3 cameraForward;
uniform float time;
uniform float dotPower;

uniform float xDisplacementByLocalX;
uniform float xDisplacementByLocalY;
uniform float xDisplacementByLocalZ;
uniform float xDisplacementByWorldX;
uniform float xDisplacementByWorldY;
uniform float xDisplacementByWorldZ;
uniform float xDisplacementInfluence;

uniform float yDisplacementByLocalX;
uniform float yDisplacementByLocalY;
uniform float yDisplacementByLocalZ;
uniform float yDisplacementByWorldX;
uniform float yDisplacementByWorldY;
uniform float yDisplacementByWorldZ;
uniform float yDisplacementInfluence;

uniform float zDisplacementByLocalX;
uniform float zDisplacementByLocalY;
uniform float zDisplacementByLocalZ;
uniform float zDisplacementByWorldX;
uniform float zDisplacementByWorldY;
uniform float zDisplacementByWorldZ;
uniform float zDisplacementInfluence;

out vec3 worldPosition;
out float dotValue;

varying vec3 vNormal;

float power(float a, int b) {
    float result = 1.0;
    for(int i = 0; i < b; i++) {
        result *= a;
    }
    return result;
}

void main() {
    vNormal = normalize(normalMatrix * normal);

    worldPosition = vec3(modelMatrix * vec4(position, 1.0));

    vec3 camToVert = normalize(worldPosition - cameraPosition);
    dotValue = dot(camToVert, cameraForward);

    dotValue = pow(dotValue, dotPower);
    worldPosition *= dotValue;

    worldPosition.x += noise(position.x * xDisplacementByLocalX + position.y * xDisplacementByLocalY + position.z * xDisplacementByLocalZ + worldPosition.x * xDisplacementByWorldX + worldPosition.y * xDisplacementByLocalY + worldPosition.z * xDisplacementByLocalZ + time) * xDisplacementInfluence;
    worldPosition.y += noise(position.x * yDisplacementByLocalX + position.y * yDisplacementByLocalY + position.z * yDisplacementByLocalZ + worldPosition.x * yDisplacementByWorldX + worldPosition.y * yDisplacementByLocalY + worldPosition.z * yDisplacementByLocalZ + time) * yDisplacementInfluence;
    worldPosition.z += noise(position.x * zDisplacementByLocalX + position.y * zDisplacementByLocalY + position.z * zDisplacementByLocalZ + worldPosition.x * zDisplacementByWorldX + worldPosition.y * zDisplacementByLocalY + worldPosition.z * zDisplacementByLocalZ +  time) * zDisplacementInfluence;

    gl_Position = projectionMatrix * viewMatrix * vec4(worldPosition, 1.0);
}