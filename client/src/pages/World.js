import React, { useEffect, useState } from 'react';
import { Redirect, useParams } from 'react-router-dom';
import { useMutation } from '@apollo/client';
import { ENTER_WORLD } from '../utils/mutations';
import * as THREE from "three";
import Auth from '../utils/auth';
import "./World.css";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { Link } from 'react-router-dom';

const CameraControls = (camera, renderer,scene) => {
    let controls = new OrbitControls( camera , renderer.domElement);
    controls.enabled = true;
    controls.enableDamping = true;   //damping 
    controls.dampingFactor = 0.15;   //damping inertia
    controls.enableZoom = true;      //Zooming
    controls.autoRotate = false;     //Enable auto rotation
    controls.minDistance = (2+5);
    controls.maxDistance = (2+5)+20;
    controls.enablePan = false;
    controls.keys = {
        LEFT: null, //left arrow
        UP: null, // up arrow
        RIGHT: null, // right arrow
        BOTTOM: null // down arrow
    };
    controls.addEventListener("change", (e) => {
        if (renderer) renderer.render(scene, camera);
    });
    return controls;
}

const RenderWorld = ({id, me}) => {
    
    const [enterWorld, {data, loading, error}] = useMutation(ENTER_WORLD);
    const [worldError,setWorldError] = useState(false);
    const [errorMessage,setErrorMessage] = useState('');
    // const [exitWorld, {data, loading, error}] = useMutation(EXIT_WORLD);
    const world = data?.enterWorld || {};

    // Set up the scene
    let scene = new THREE.Scene();
    let camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, .1, 1000 );
    let renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    let raycaster = new THREE.Raycaster();
    let mouse = new THREE.Vector2();

    let xRotation = .5;

    let character;

    window.addEventListener("resize", 
        () => {
            let tanFOV = Math.tan( ( ( Math.PI / 180 ) * camera.fov / 2 ) );
            let windowHeight = window.innerHeight;

            camera.aspect = window.innerWidth / window.innerHeight;
            
            // adjust the FOV
            camera.fov = ( 360 / Math.PI ) * Math.atan( tanFOV * ( window.innerHeight / windowHeight ) );
            
            camera.updateProjectionMatrix();
            //camera.lookAt( scene.position );

            renderer.setSize( window.innerWidth, window.innerHeight );
            renderer.render( scene, camera );
        }, false
    );

    window.addEventListener("keydown",e=>{
        switch(e.key){
            case 'ArrowRight':
                camera.translateZ(-5);
                camera.rotateX(-xRotation)
                camera.rotateZ(.1);
                camera.rotateX(xRotation)
                camera.translateZ(5);
                break;
            case 'ArrowLeft':
                camera.translateZ(-5);
                camera.rotateX(-xRotation)
                camera.rotateZ(-.1);
                camera.rotateX(xRotation)
                camera.translateZ(5);
                break;
            case 'ArrowDown':
                if(xRotation<1) xRotation+=.1
                else break;
                camera.translateZ(-5);
                camera.rotateX(.1);
                camera.translateZ(5);
                break;
            case 'ArrowUp':
                if(xRotation>.2) xRotation-=.1
                else break;
                camera.translateZ(-5);
                camera.rotateX(-.1);
                camera.translateZ(5);
                break;
            default:
        }
    });

    function onMouseDown(e) {
        // update mouse position
        mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
        
        // Set the raycaster to check for intersected objects
        raycaster.setFromCamera( mouse, camera );

        const intersects = raycaster.intersectObjects( scene.children );

        console.log(intersects);
    }

    const drawScene = () => {
        const group = new THREE.Group();
        for(let x = 0; x < 10; x++){
            for(let y = 0; y < 10; y++){
                var tile = new THREE.Shape();
                tile.moveTo(x,y);
                tile.lineTo(x,y+1);
                tile.lineTo(x+1,y+1);
                tile.lineTo(x+1,y);

                const geometry = new THREE.ShapeGeometry(tile);
                const material = new THREE.MeshBasicMaterial({
                    color: `#aafa${Math.ceil((x+y)/2)}f`,
                    side: THREE.FrontSide,
                    depthWrite: true
                });

                const tileMesh = new THREE.Mesh(geometry,material);
                tileMesh.name="floor";
                group.add(tileMesh);
            }
        }
        scene.add(group)
    }

    const drawCharacter = () => {
        var geometry = new THREE.SphereGeometry(.1, 50, 50, 0, Math.PI * 2, 0, Math.PI * 2);
        var material = new THREE.MeshNormalMaterial();
        character = new THREE.Mesh(geometry, material);
        character.translateZ(.1)
        character.position.x = 5;
        character.position.y = 5;
        scene.add(character);
    }

    useEffect(()=>{
        function removeElementsByClass(className){
            const elements = document.getElementsByClassName(className);
            while(elements.length > 0){
                elements[0].parentNode.removeChild(elements[0]);
            }
        }
        removeElementsByClass("canvas");
        console.log(id)
        try{
            enterWorld({
                variables: {id}
            }).then(data=>{
                renderer.setClearColor(new THREE.Color("black"),1);
                renderer.domElement.className = "canvas";
                renderer.setSize( window.innerWidth, window.innerHeight);

                camera.position.z = 5;
                camera.position.y = 5;
                camera.position.x = 5;
                camera.lookAt(new THREE.Vector3(5,5,0))
                
                camera.translateZ(-5);
                camera.rotateX(.5);
                camera.translateZ(5);

                renderer.render( scene, camera );

                console.log("Entered World");
                console.log(data,me);

                // data contains all scene objects for section
                drawScene(data);

                // check that me has position, if not assign default location (5,5) at main section
                if(me.currentPosition){
                    drawCharacter(me);
                }
                else {

                }

                document.querySelector('.world-container').appendChild( renderer.domElement );
                window.addEventListener("pointerdown",onMouseDown,false);

            }).catch(err=>{
                console.log(err);
                setWorldError(true);
                setErrorMessage(err.message);
            });


            
    
            
        }catch(e){
            console.log(e)
        }

        return function cleanup () {
            window.removeEventListener("pointerdown",onMouseDown,false);
        }
    },[])

    let animate = () => {
        requestAnimationFrame( animate );
        //controls.update();
        renderer.render( scene, camera );
    };

    animate();
    return (
        <div>
            {
                worldError?
                <div className="error-div">
                    <div className="error-header">
                        Error Message
                    </div>
                    <div className="error-message">
                        {errorMessage}
                        <Link to="/"> Return home </Link>
                    </div>
                </div>:[]
            }
        </div>
    )
}

const World = ({setShowNavFooter, me}) => {
    const { id } = useParams();
    
    useEffect(()=>{
        setShowNavFooter(false);
    },[]);

    if(!Auth.loggedIn()) return <Redirect to="/login" />
    if(!id) return <Redirect to="/"/>

    return (
        <div className="world-container">
            <RenderWorld id={id} me={me}/>
        </div>
    )
}

export default World;