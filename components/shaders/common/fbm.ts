import simplexNoise from "./simplexNoise";

const fbm = `
${simplexNoise}

mat2 rotate2D(float angle) {
    float s = sin(angle);
    float c = cos(angle);

    return mat2(
        c, -s,
        s,  c
    );
}

float fbm(vec3 p){

    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;

    for(int i = 0; i < 5; i++){

        value += amplitude * snoise(
            p * frequency
        );

        p.xy *= rotate2D(0.5);

        frequency *= 2.0;
        amplitude *= 0.5;
    }

    return value;

}

vec2 flowField(vec2 uv, float time){

    float x = fbm(
        vec3(
            uv * 2.5,
            time * 0.15
        )
    );

    float y = fbm(
        vec3(
            uv * 2.5 + 8.3,
            time * 0.15
        )
    );

    return vec2(x, y);

}
`;

export default fbm;