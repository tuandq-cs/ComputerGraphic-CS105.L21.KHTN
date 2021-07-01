import {
    DirectionalLight, AmbientLight,
    BoxGeometry,
    MeshPhongMaterial,
    Mesh,
    Color
} from "three";

import { ORIGINAL_BOX_SIZE, hslColorLiteral } from './Config';

class GameEnvironment{
    constructor(params){
        this._params = params;
        this._overhangs = [];
        this._InitializeLight();
        this.InitializeLayer();
    }
    
    get stack(){
        return this._stack || [];
    }

    _InitializeLight(){
        this._listLight = [];
        const ambientLight = new AmbientLight(0xffffff, 0.6);
        this._listLight.push(ambientLight);
        const dirLight = new DirectionalLight(0xffffff, 0.6);
        dirLight.position.set(10, 20, 0);
        this._listLight.push(dirLight);
        this._params.scene.add(...this._listLight);
    }

    InitializeLayer(){
        this._stack = [];
        // Foundation
        this.addLayer(0, 0, ORIGINAL_BOX_SIZE['width'], ORIGINAL_BOX_SIZE['depth']);
        // First layer
        this.addLayer(-10, 0, ORIGINAL_BOX_SIZE['width'], ORIGINAL_BOX_SIZE['depth'], 'x');
    }

    addLayer(x, z, width, depth, direction){
        const y = ORIGINAL_BOX_SIZE['height'] * this._stack.length;
        const layer = this._generateBox(x, y, z, width, depth);
        layer.direction = direction;
        this._stack.push(layer);
    }

    _addOverhang(x, z, width, depth) {
        const y = ORIGINAL_BOX_SIZE['height'] * (this._stack.length - 1); // Add the new box one the same layer
        const overhang = this._generateBox(x, y, z, width, depth, true);
        this._overhangs.push(overhang);
    }
      

    _generateBox(x, y, z, width, depth){
        const geometry = new BoxGeometry( width, ORIGINAL_BOX_SIZE['height'], depth );
        const color = new Color(hslColorLiteral(30 + this._stack.length * 4));
        const material = new MeshPhongMaterial({ color });
        const mesh = new Mesh(geometry, material);
        mesh.position.set(x, y, z);
        this._params.scene.add(mesh);
        return {
            threejs: mesh,
            width,
            depth
        };
    }

    splitBlockAndAddNextOneIfOverlaps(){
        const topLayer = this._stack[this._stack.length - 1];
        const previousLayer = this._stack[this._stack.length - 2];

        const direction = topLayer.direction;

        const size = direction == "x" ? topLayer.width : topLayer.depth;
        const delta =
            topLayer.threejs.position[direction] -
            previousLayer.threejs.position[direction];
        const overhangSize = Math.abs(delta);
        const overlap = size - overhangSize;
        if (overlap > 0){
            this._cutBox(topLayer, overlap, size, delta);
            // // Next layer
            const nextX = direction == "x" ? topLayer.threejs.position.x : -10;
            const nextZ = direction == "z" ? topLayer.threejs.position.z : -10;
            const newWidth = topLayer.width; // New layer has the same size as the cut top layer
            const newDepth = topLayer.depth; // New layer has the same size as the cut top layer
            const nextDirection = direction == "x" ? "z" : "x";

            this.addLayer(nextX, nextZ, newWidth, newDepth, nextDirection);
            return true;
        }
        return false;
    }

    _cutBox(topLayer, overlap, size, delta){
        const direction = topLayer.direction;
        const newWidth = direction == "x" ? overlap : topLayer.width;
        const newDepth = direction == "z" ? overlap : topLayer.depth;

        // Update metadata
        topLayer.width = newWidth;
        topLayer.depth = newDepth;
        // Update ThreeJS model
        topLayer.threejs.scale[direction] = overlap / size;
        topLayer.threejs.position[direction] -= delta / 2;
    }
}

export { GameEnvironment }