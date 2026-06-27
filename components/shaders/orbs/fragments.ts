const fragmentShader = `
uniform float uTime;

uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;
uniform vec3 uColor4;

varying vec2 vUv;

float random(vec2 st){
    return fract(
        sin(dot(st.xy, vec2(12.9898,78.233)))
        *43758.5453123
    );
}

float noise(vec2 st){

    vec2 i = floor(st);
    vec2 f = fract(st);

    float a = random(i);
    float b = random(i + vec2(1.0,0.0));
    float c = random(i + vec2(0.0,1.0));
    float d = random(i + vec2(1.0,1.0));

    vec2 u = f*f*(3.0-2.0*f);

    return mix(a,b,u.x)
        + (c-a)*u.y*(1.0-u.x)
        + (d-b)*u.x*u.y;
}

void main(){

    vec2 uv = vUv;

    float n1 = noise(
        uv*3.0 +
        uTime*0.08
    );

    float n2 = noise(
        uv*6.0 -
        uTime*0.05
    );

    float flow = (n1+n2)*0.5;

    uv.x += (flow-0.5)*0.15;
    uv.y += (flow-0.5)*0.08;

    vec3 c1 = mix(
        uColor1,
        uColor2,
        smoothstep(
            0.0,
            0.35,
            uv.y
        )
    );

    vec3 c2 = mix(
        c1,
        uColor3,
        smoothstep(
            0.30,
            0.70,
            uv.y
        )
    );

    vec3 color = mix(
        c2,
        uColor4,
        smoothstep(
            0.70,
            1.0,
            uv.y
        )
    );

    gl_FragColor = vec4(
        color,
        1.0
    );

}
`;

export default fragmentShader;