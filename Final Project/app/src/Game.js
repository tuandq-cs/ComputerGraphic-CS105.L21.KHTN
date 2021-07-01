import { 
    Scene,
    PerspectiveCamera, OrthographicCamera,
    WebGLRenderer,
    Color
} from 'three';

import { OrbitControls} from 'three/examples/jsm/controls/OrbitControls';
import { GameEnvironment } from './Environment';
import { CAMERA_CONFIG, SPEED, ORIGINAL_BOX_SIZE} from './Config';


class Game { 
    constructor(){
        this._Initialize();
        this._scoreElement = document.getElementById("score");
        this._instructionsElement = document.getElementById("instructions");
        this._resultsElement = document.getElementById("results");
    }

    _Initialize(){
        this._paused = false; // In case pause game
        this._gameStarted = false;
        this._gameEnded = false;
        this._lastTime = 0;
        this._speed = SPEED;
        this._LoadScene();
        this._LoadCamera();
        this._LoadRenderer();
        this._LoadControls();
        this._LoadEnvironment();
        this._LoadAnimation();
        this._AddEventListener();
        this._renderer.setAnimationLoop(this._animation);
    }

    _LoadScene(){
        this._scene = new Scene();
        // this._scene.background = new Color('white');
    }

    _LoadCamera(){
        /*
        * Perspective camera
            const { fov, aspect, near, far} = CAMERA_CONFIG['perspective'];
            this._camera = new PerspectiveCamera(fov, aspect, near, far);
        */
        const { width, height, near, far } = CAMERA_CONFIG['orthographic'];
        this._camera = new OrthographicCamera(
            width / -2, // left
            width / 2, // right
            height / 2, // top
            height / -2, // bottom
            near, // near plane
            far // far plane
        );
        this._camera.position.set(4, 4, 4);
        this._camera.lookAt(0, 0, 0);
    }
    
    _LoadRenderer(){
        this._renderer = new WebGLRenderer();
        this._renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this._renderer.domElement);
    }

    _LoadControls(){
        this._controls = new OrbitControls(
            this._camera, this._renderer.domElement);
        this._controls.target.set(0, 0, 0);
        this._controls.update();
    }

    _LoadEnvironment(){
        this._environment = new GameEnvironment({ scene: this._scene });
    }

    _LoadAnimation(){
        this._animation = (time) => {
            if (this._lastTime){
                const timePassed = time - this._lastTime;
                const stack = this._environment.stack;
                const topLayer = stack[stack.length - 1];
                const boxShouldMove = !this._gameEnded && this._gameStarted & !this._paused;
                if (boxShouldMove){
                    topLayer.threejs.position[topLayer.direction] += this._speed * timePassed;
                    if (topLayer.threejs.position[topLayer.direction]> 10){
                        this._gameOver();
                    }
                }
                if (this._camera.position.y < ORIGINAL_BOX_SIZE['height'] * (this._environment.stack.length - 2) + 4){
                    this._camera.position.y += this._speed * timePassed;
                }
                this._renderer.render(this._scene, this._camera);
            }
            this._lastTime = time;
        };
    }

    _StartGame() {
        this._gameStarted = true;
        this._gameEnded = false;
        this._lastTime = 0;
        if (this._instructionsElement) this._instructionsElement.style.display = "none";
        if (this._resultsElement) this._resultsElement.style.display = "none";
        if (this._scoreElement) this._scoreElement.innerText = 0;
        if (this._scene) {
            // Remove every Mesh from the scene
            while (this._scene.children.find((c) => c.type == "Mesh")) {
                const mesh = this._scene.children.find((c) => c.type == "Mesh");
                this._scene.remove(mesh);
            }
            this._environment.InitializeLayer();
        }
        if (this._camera){
            // Reset camera positions
            this._camera.position.set(4, 4, 4);
            this._camera.lookAt(0, 0, 0);
        }
    }

    _EventHandler(){
        if (this._gameStarted == false) this._StartGame();
        else {
            if (this._gameEnded) return;
            const isSuccess = this._environment.splitBlockAndAddNextOneIfOverlaps();
            if (!isSuccess) {
                this._gameOver();
            }
            if (this._scoreElement) this._scoreElement.innerText = parseInt(this._scoreElement.innerText) + 1;
        }
    }

    _gameOver(){
        const stack = this._environment.stack
        const topLayer = stack[stack.length - 1];
        this._scene.remove(topLayer.threejs);
        this._gameEnded = true;
        if (this._resultsElement) this._resultsElement.style.display = "flex";
    }

    _AddEventListener(){
        window.addEventListener('resize', () => {
            this._OnWindowResize();
        }, false);
        window.addEventListener("click", () => {
            this._EventHandler();
        });
        window.addEventListener("touchstart", () => {
            this._EventHandler();
        });
        window.addEventListener('keydown', (event) => {
            if (event.key == ' '){
                event.preventDefault();
                this._EventHandler();
            }
            if (event.key == 'R' || event.key == 'r'){
                event.preventDefault();
                this._StartGame();
            }
        });
    }

    _OnWindowResize() {
        /*
        * Perspective camera
            this._camera.aspect = window.innerWidth / window.innerHeight;
            this._camera.updateProjectionMatrix();
            this._renderer.setSize(window.innerWidth, window.innerHeight);
        */
        console.log("resize", window.innerWidth, window.innerHeight);
        const aspect = window.innerWidth / window.innerHeight;
        const width = 10;
        const height = width / aspect;
        
        this._camera.top = height / 2;
        this._camera.bottom = height / -2;
        
        // Reset renderer
        this._renderer.setSize(window.innerWidth, window.innerHeight);
        this._renderer.render(this._scene, this._camera);
    }
}
export { Game }