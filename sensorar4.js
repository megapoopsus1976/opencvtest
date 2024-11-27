"use strict"

import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';

export let exports = {};
window.sensorar = exports;

let doc;
let canvas;
let renderer;
let scene;
let cam;
let mir;
let quat = new THREE.Quaternion();
let quat2 = new THREE.Quaternion();
let mat = new THREE.Matrix4();
let vec = new THREE.Vector3();
let v0 = new THREE.Vector3(), v1 = new THREE.Vector3();
let s00 = new THREE.Vector3(), s0 = new THREE.Vector3(), s1 = new THREE.Vector3();
let ab = [];
let ab2 = [];
let ab_s = [];
let ibuf0, ibuf1;
let vcanv, vcanv_ctx;
let dif = 0;
let eul = new THREE.Euler(0, 0, 0, 'ZXY');
//let uskor = 0;
//let skor = 0;
let s = 0, v = 0;

let graf, gctx;

window.THREE = THREE;

exports.init = init;
export async function init(d = document) {
	doc = d;

	canvas = doc.createElement('canvas');
	canvas.className = 'canv3d';
	document.body.appendChild(canvas);
	
	const gl_opt = {
//			antialias: true,
//			premultipliedAlpha: false
		};
//	const gl = canvas.getContext("webgl", gl_opt);
	
	const render_opt = 	gl_opt;
	render_opt.canvas = canvas;
	render_opt.alpha = true;
//	render_opt.context = gl;

	renderer = new THREE.WebGLRenderer(render_opt);
//	renderer.setSize( window.innerWidth, window.innerHeight);
	renderer.setSize( 320, 180);
//	renderer.setSize( window.outerWidth, window.outerHeight);

	scene	= new THREE.Scene();

//	const loader = new THREE.GLTFLoader();
	const loader = new GLTFLoader();

	loader.load(
		'sensorar.glb',
		function ( gltf ) {
			setup_scene(gltf.scene);
			setup_anims(gltf.animations);
		},
		function ( xhr ) {
			const p = Math.round(xhr.loaded / xhr.total * 100) + '%';
//			_$('.' + app_id + ' .ldr_bar').style.width = p;
//			_$('.' + app_id + ' .ldr_txt').innerHTML = p;
			console.log( p + ' loaded' );
		},
		function (err) {
			error('Load error:' + err);
			log('Load error:', err);
		}
	);

	doc.defaultView.requestAnimationFrame(anim);
}

init();

function setup_scene(sc) {
	scene.add(sc);
	console.log('Камера');
	console.log(scene.children[0].children[1].name == 'Камера');
//	cam = scene.children[0].children[1];//scene.getObjectByName('Камера');
	cam = scene.getObjectByName('Камера');
	cam.aspect = canvas.width / canvas.height;
//	cam.fov = 2 * Math.atan2(mw / 2, mw * 0.8) * 180 / Math.PI;
	cam.fov = 50;
	cam.near = 0.1;
	cam.far = 2000;
	cam.updateProjectionMatrix();
//	const w = 10, h = 5;
//	cam = new THREE.OrthographicCamera(-w, w, h, -h, -10, 1000 );
//	cam.position.set(0, 0, 10);
	cam.rotation.set(0, 0, 0);
	cam.position.set(0, 0, 0);
//	cam.rotateX(Math.PI / 10);
	cam.matrixAutoUpdate = false;
	cam.updateMatrix();
//	mir = scene.children[0].children[0];//scene.getObjectByName('Кубик');
	mir = scene.getObjectByName('Кубик');
	mir.position.set(0, 0, 0);
	mir.matrixAutoUpdate = false;
/*	mir.children[0].material.side = THREE.FrontSide;
	mir.children[1].material.side = THREE.FrontSide;
	mir.children[2].material.side = THREE.FrontSide;
	mir.children[3].material.side = THREE.FrontSide;
	mir.children[4].material.side = THREE.FrontSide;
	mir.children[5].material.side = THREE.FrontSide;*/
	mir.updateMatrix();
}

function setup_anims(a) {
}

function anim(dmsec) {	
	if(scene && cam) {
//		console.log('a');
		cam.updateMatrixWorld(true);
		mir.updateMatrixWorld(true);
/*		let z = cam.position.z + dmsec * skor;
		if(z > 12) z = 12; else if(z < 5) z = 5;
		cam.position.z = z;*/
		renderer.render(scene, cam);
	}
	doc.defaultView.requestAnimationFrame(anim);
}

exports.on_orient = on_orient;
export function on_orient(or) {
	const so = 'landscape_left'; //getScreenOrientation();
	let ug = 0;

	if( so === 'landscape_left' ) {
		ug = 90;
	} else if(so === 'landscape_right' ) {
		ug = 270;
	};
//	_$('.ugli').innerHTML = 'alpha:' + Math.round(or.alpha) + '; beta:' + Math.round(or.beta) + '; gamma:' + Math.round(or.gamma) + '; so:' + so + '; ug:' + ug;
//	console.log('ugli', Math.round(or.alpha), Math.round(or.beta), Math.round(or.gamma));

	if(mir) {
		eul.set(0, 0, THREE.MathUtils.degToRad(ug), 'ZXY');
		quat.setFromEuler(eul);
		eul.set(THREE.MathUtils.degToRad(or.beta), THREE.MathUtils.degToRad(or.gamma), THREE.MathUtils.degToRad(or.alpha), 'ZXY');
		quat2.setFromEuler(eul).conjugate();
		quat.multiply(quat2);
//		vec.set(0, 0, 0);
		mir.matrix.makeTranslation(vec);
		mat.makeRotationFromQuaternion(quat);
		mir.matrix.multiply(mat);
	}
}

exports.mir_mat = mir_mat;
export function mir_mat(m) {
	if(mir) {
		vec.set(0, 0, -5);
		mir.matrix.makeTranslation(vec);
		mir.matrix.multiply(m);
	}
}

exports.cam_mat = cam_mat;
export function cam_mat(m) {
	if(cam) {
		cam.matrix.copy(m);
	}
}
