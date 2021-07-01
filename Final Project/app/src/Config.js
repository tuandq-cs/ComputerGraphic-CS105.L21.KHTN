
const ASPECT = window.innerWidth / window.innerHeight;

const CAMERA_CONFIG = {
    'perspective': {
        fov: 60,
        aspect: ASPECT,
        near: 0.1,
        far: 1000.0
    },
    'orthographic': {
        aspect: ASPECT,
        width: 10,
        height: 10 / ASPECT,
        near: -10,
        far: 100
    }
};

const ORIGINAL_BOX_SIZE = {
    'height': 1,
    'width': 3,
    'depth': 3
};

const hslColorLiteral = (hue) => {
    return `hsl(${hue}, 100%, 50%)`;
}

const SPEED = 0.008;


export { CAMERA_CONFIG, ORIGINAL_BOX_SIZE, SPEED, hslColorLiteral};