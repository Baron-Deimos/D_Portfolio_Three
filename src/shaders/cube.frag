in vec3 worldPosition;
in float dotValue;

uniform bool useAbs;
uniform float power;
uniform vec3 cameraForward;
uniform float dotPower;
uniform bool vertexLighting;

varying vec3 vNormal;

vec3 vecToAbs(vec3 v) {
    return vec3(abs(v.x), abs(v.y), abs(v.z));
}

vec3 vecToPow(vec3 v, float p) {
    v.x = pow(v.x, p);
    v.y = pow(v.y, p);
    v.z = pow(v.z, p);
    return v;
}        

vec3 clampColor(vec3 v) {
    return vec3(clamp(v.x, 0.0, 1.0), clamp(v.y, 0.0, 1.0), clamp(v.z, 0.0, 1.0));
}

void main() {
    float light = dotValue;
    if (!vertexLighting) {
        vec3 camToVert = normalize(worldPosition - cameraPosition);
        light = dot(camToVert, cameraForward);
        light = pow(light, dotPower);
    }        
        
    vec3 color = vecToAbs(worldPosition) * light;
    gl_FragColor = vec4(color, 1.0);
}