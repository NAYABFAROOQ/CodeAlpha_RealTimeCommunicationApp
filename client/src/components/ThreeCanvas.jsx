import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  RotateCcw,
  Sparkles,
  Maximize2,
  Play,
  Pause,
  Layers,
  Radio,
  Globe2,
  Volume2,
  Box,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export const ThreeCanvas = ({ className = '' }) => {
  const mountRef = useRef(null);
  const { gradientPreset, isDark } = useTheme();

  // 3D View Modes: 'core' | 'mesh' | 'audio'
  const [viewMode, setViewMode] = useState('core');
  const [isAutoRotating, setIsAutoRotating] = useState(true);
  const [isWireframe, setIsWireframe] = useState(false);
  const [particleBurstCount, setParticleBurstCount] = useState(0);

  // References to keep track of mutable Three.js objects
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const coreGroupRef = useRef(null);
  const meshGroupRef = useRef(null);
  const audioGroupRef = useRef(null);
  const burstParticlesRef = useRef([]);
  const lightsRef = useRef({});

  // Mouse drag & momentum state
  const mouseState = useRef({
    isDragging: false,
    prevX: 0,
    prevY: 0,
    rotSpeedX: 0,
    rotSpeedY: 0,
    targetRotX: 0,
    targetRotY: 0,
    mouseXNorm: 0,
    mouseYNorm: 0,
  });

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 500;

    // 2. Camera setup
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 7.2);
    cameraRef.current = camera;

    // 3. Renderer setup
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(gradientPreset.threeColors.ambient, 1.2);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(gradientPreset.threeColors.lightA, 3.2);
    dirLight1.position.set(5, 6, 6);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(gradientPreset.threeColors.lightB, 2.4);
    dirLight2.position.set(-5, -4, -4);
    scene.add(dirLight2);

    const mousePointLight = new THREE.PointLight(gradientPreset.threeColors.core, 3.5, 12);
    mousePointLight.position.set(0, 0, 4);
    scene.add(mousePointLight);

    lightsRef.current = { ambientLight, dirLight1, dirLight2, mousePointLight };

    // ==========================================
    // 5. MODE 1: CORE ORB & GYROSCOPE (Peach Worlds)
    // ==========================================
    const coreGroup = new THREE.Group();
    coreGroupRef.current = coreGroup;
    scene.add(coreGroup);

    // Inner glowing sphere
    const innerGeo = new THREE.SphereGeometry(1.0, 32, 32);
    const innerMat = new THREE.MeshStandardMaterial({
      color: gradientPreset.threeColors.core,
      emissive: gradientPreset.threeColors.core,
      emissiveIntensity: 0.6,
      roughness: 0.2,
      metalness: 0.5,
    });
    const innerSphere = new THREE.Mesh(innerGeo, innerMat);
    coreGroup.add(innerSphere);

    // Outer translucent glass shell
    const outerGeo = new THREE.IcosahedronGeometry(1.65, 4);
    const outerMat = new THREE.MeshPhysicalMaterial({
      color: gradientPreset.threeColors.glass,
      transparent: true,
      opacity: 0.68,
      roughness: 0.1,
      metalness: 0.15,
      transmission: 0.6,
      ior: 1.45,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
      wireframe: false,
    });
    const outerShell = new THREE.Mesh(outerGeo, outerMat);
    coreGroup.add(outerShell);

    // Gyroscopic Gimbal Rings (3 nested rings)
    const ringMat = new THREE.MeshStandardMaterial({
      color: gradientPreset.threeColors.rings,
      metalness: 0.85,
      roughness: 0.2,
      wireframe: false,
    });

    const ring1 = new THREE.Mesh(new THREE.TorusGeometry(2.1, 0.045, 16, 100), ringMat);
    const ring2 = new THREE.Mesh(new THREE.TorusGeometry(2.4, 0.04, 16, 100), ringMat);
    const ring3 = new THREE.Mesh(new THREE.TorusGeometry(2.7, 0.035, 16, 100), ringMat);
    ring1.rotation.x = Math.PI / 4;
    ring2.rotation.y = Math.PI / 3;
    ring3.rotation.z = Math.PI / 6;

    coreGroup.add(ring1);
    coreGroup.add(ring2);
    coreGroup.add(ring3);

    // Satellite Peer Nodes (orbiting spheres)
    const satellites = [];
    const satCount = 5;
    for (let i = 0; i < satCount; i++) {
      const satGeo = new THREE.SphereGeometry(0.16, 16, 16);
      const satMat = new THREE.MeshStandardMaterial({
        color: gradientPreset.threeColors.rings,
        emissive: gradientPreset.threeColors.rings,
        emissiveIntensity: 0.8,
        metalness: 0.7,
      });
      const sat = new THREE.Mesh(satGeo, satMat);
      sat.userData = {
        angle: (i * (Math.PI * 2)) / satCount,
        radius: 2.1 + (i % 2) * 0.5,
        speed: 0.012 + (i % 3) * 0.005,
        tilt: (i * Math.PI) / 4,
      };
      coreGroup.add(sat);
      satellites.push(sat);
    }

    // Swirling Particle Dust Cloud
    const partGeo = new THREE.BufferGeometry();
    const partCount = 380;
    const partPositions = new Float32Array(partCount * 3);
    for (let i = 0; i < partCount * 3; i += 3) {
      const radius = 2.0 + Math.random() * 2.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      partPositions[i] = radius * Math.sin(phi) * Math.cos(theta);
      partPositions[i + 1] = radius * Math.sin(phi) * Math.sin(theta);
      partPositions[i + 2] = radius * Math.cos(phi);
    }
    partGeo.setAttribute('position', new THREE.BufferAttribute(partPositions, 3));
    const partMat = new THREE.PointsMaterial({
      color: gradientPreset.threeColors.particles,
      size: 0.05,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(partGeo, partMat);
    coreGroup.add(particles);

    // ==========================================
    // 6. MODE 2: GLOBAL 3D PEER MESH
    // ==========================================
    const meshGroup = new THREE.Group();
    meshGroupRef.current = meshGroup;
    meshGroup.visible = false;
    scene.add(meshGroup);

    // Geodesic Wireframe Globe
    const globeGeo = new THREE.IcosahedronGeometry(2.2, 3);
    const globeMat = new THREE.MeshBasicMaterial({
      color: gradientPreset.threeColors.glass,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    });
    const globe = new THREE.Mesh(globeGeo, globeMat);
    meshGroup.add(globe);

    // Global Peer Nodes placed around the sphere
    const peerNodeCoords = [
      [1.5, 1.4, 0.7],
      [-1.6, 1.1, -0.9],
      [0.8, -1.7, 1.1],
      [-1.1, -1.5, -1.0],
      [1.9, -0.4, -0.8],
      [-1.8, 0.2, 1.2],
      [0.2, 2.0, -0.8],
    ];

    const nodeMeshes = [];
    peerNodeCoords.forEach((coord) => {
      const nodeGeo = new THREE.SphereGeometry(0.14, 16, 16);
      const nodeMat = new THREE.MeshStandardMaterial({
        color: gradientPreset.threeColors.core,
        emissive: gradientPreset.threeColors.core,
        emissiveIntensity: 0.9,
      });
      const nodeMesh = new THREE.Mesh(nodeGeo, nodeMat);
      nodeMesh.position.set(...coord);
      meshGroup.add(nodeMesh);
      nodeMeshes.push(nodeMesh);
    });

    // Connecting Arcs between nodes
    for (let i = 0; i < peerNodeCoords.length; i++) {
      const nextIdx = (i + 1) % peerNodeCoords.length;
      const v1 = new THREE.Vector3(...peerNodeCoords[i]);
      const v2 = new THREE.Vector3(...peerNodeCoords[nextIdx]);
      const mid = v1.clone().add(v2).multiplyScalar(0.5).normalize().multiplyScalar(2.6);
      const curve = new THREE.QuadraticBezierCurve3(v1, mid, v2);
      const points = curve.getPoints(30);
      const curveGeo = new THREE.BufferGeometry().setFromPoints(points);
      const curveMat = new THREE.LineBasicMaterial({
        color: gradientPreset.threeColors.rings,
        transparent: true,
        opacity: 0.7,
      });
      const line = new THREE.Line(curveGeo, curveMat);
      meshGroup.add(line);
    }

    // ==========================================
    // 7. MODE 3: 3D SPATIAL AUDIO SOUNDSTAGE
    // ==========================================
    const audioGroup = new THREE.Group();
    audioGroupRef.current = audioGroup;
    audioGroup.visible = false;
    scene.add(audioGroup);

    // Audio Bars Ring
    const audioBarCount = 48;
    const audioBars = [];
    const barGeo = new THREE.CylinderGeometry(0.04, 0.04, 1, 8);
    barGeo.translate(0, 0.5, 0); // anchor at base

    for (let i = 0; i < audioBarCount; i++) {
      const angle = (i / audioBarCount) * Math.PI * 2;
      const barMat = new THREE.MeshStandardMaterial({
        color: gradientPreset.threeColors.core,
        emissive: gradientPreset.threeColors.core,
        emissiveIntensity: 0.5,
        roughness: 0.3,
        metalness: 0.7,
      });
      const bar = new THREE.Mesh(barGeo, barMat);
      bar.position.set(Math.cos(angle) * 2.2, 0, Math.sin(angle) * 2.2);
      bar.rotation.y = -angle;
      bar.scale.y = 0.3;
      audioGroup.add(bar);
      audioBars.push(bar);
    }

    // Audio Center Halo
    const audioCenterGeo = new THREE.TorusGeometry(2.2, 0.05, 16, 100);
    const audioCenterMat = new THREE.MeshBasicMaterial({
      color: gradientPreset.threeColors.rings,
      transparent: true,
      opacity: 0.8,
    });
    const audioRing = new THREE.Mesh(audioCenterGeo, audioCenterMat);
    audioRing.rotation.x = Math.PI / 2;
    audioGroup.add(audioRing);

    // ==========================================
    // 8. ANIMATION LOOP
    // ==========================================
    let animationFrameId;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Handle Inertia and Mouse Momentum
      if (!mouseState.current.isDragging) {
        mouseState.current.rotSpeedX *= 0.94;
        mouseState.current.rotSpeedY *= 0.94;
        coreGroup.rotation.y += mouseState.current.rotSpeedX;
        coreGroup.rotation.x += mouseState.current.rotSpeedY;
        meshGroup.rotation.y += mouseState.current.rotSpeedX;
        meshGroup.rotation.x += mouseState.current.rotSpeedY;
        audioGroup.rotation.y += mouseState.current.rotSpeedX;
        audioGroup.rotation.x += mouseState.current.rotSpeedY;
      }

      // Auto-rotation when idle
      if (isAutoRotating) {
        coreGroup.rotation.y += 0.006;
        meshGroup.rotation.y += 0.007;
        audioGroup.rotation.y += 0.005;
      }

      // Smooth mouse hover parallax on camera & lighting
      const targetCamX = mouseState.current.mouseXNorm * 1.2;
      const targetCamY = -mouseState.current.mouseYNorm * 0.9;
      camera.position.x += (targetCamX - camera.position.x) * 0.05;
      camera.position.y += (targetCamY - camera.position.y) * 0.05;
      camera.lookAt(0, 0, 0);

      mousePointLight.position.x = mouseState.current.mouseXNorm * 4;
      mousePointLight.position.y = -mouseState.current.mouseYNorm * 4;

      // Mode 1: Core animations
      if (coreGroup.visible) {
        outerShell.rotation.y = elapsedTime * 0.15;
        outerShell.rotation.z = elapsedTime * 0.1;
        innerSphere.scale.setScalar(1 + Math.sin(elapsedTime * 2.5) * 0.06);

        ring1.rotation.y = elapsedTime * 0.4;
        ring1.rotation.x = elapsedTime * 0.3;
        ring2.rotation.z = -elapsedTime * 0.35;
        ring2.rotation.x = elapsedTime * 0.2;
        ring3.rotation.x = -elapsedTime * 0.25;
        ring3.rotation.y = -elapsedTime * 0.3;

        satellites.forEach((sat) => {
          sat.userData.angle += sat.userData.speed;
          sat.position.x = Math.cos(sat.userData.angle) * sat.userData.radius;
          sat.position.z = Math.sin(sat.userData.angle) * sat.userData.radius;
          sat.position.y = Math.sin(sat.userData.angle * 2) * 0.6;
        });

        particles.rotation.y = elapsedTime * 0.05;
      }

      // Mode 2: Mesh animations
      if (meshGroup.visible) {
        nodeMeshes.forEach((node, idx) => {
          const pulse = 1 + Math.sin(elapsedTime * 4 + idx) * 0.2;
          node.scale.setScalar(pulse);
        });
      }

      // Mode 3: Audio bar frequency simulator
      if (audioGroup.visible) {
        audioBars.forEach((bar, idx) => {
          const freq =
            Math.sin(elapsedTime * 6 + idx * 0.4) * 0.5 +
            Math.cos(elapsedTime * 12 + idx * 0.8) * 0.3 +
            0.8;
          bar.scale.y = Math.max(0.1, freq * 1.4);
        });
      }

      // Animate any active burst particles
      if (burstParticlesRef.current.length > 0) {
        burstParticlesRef.current = burstParticlesRef.current.filter((p) => {
          p.mesh.position.add(p.velocity);
          p.mesh.scale.multiplyScalar(0.95);
          p.life -= 0.025;
          if (p.life <= 0) {
            scene.remove(p.mesh);
            return false;
          }
          return true;
        });
      }

      renderer.render(scene, camera);
    };

    animate();

    // ==========================================
    // 9. RESIZE OBSERVER
    // ==========================================
    const resizeObserver = new ResizeObserver(() => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w === 0 || h === 0) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });
    resizeObserver.observe(container);

    // ==========================================
    // 10. CLEANUP
    // ==========================================
    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      if (container && renderer.domElement) {
        container.innerHTML = '';
      }
      renderer.dispose();
    };
  }, []);

  // Update Three.js materials whenever gradientPreset or isDark changes
  useEffect(() => {
    if (!sceneRef.current) return;
    const { threeColors } = gradientPreset;

    if (lightsRef.current.ambientLight) {
      lightsRef.current.ambientLight.color.setHex(threeColors.ambient);
    }
    if (lightsRef.current.dirLight1) {
      lightsRef.current.dirLight1.color.setHex(threeColors.lightA);
    }
    if (lightsRef.current.dirLight2) {
      lightsRef.current.dirLight2.color.setHex(threeColors.lightB);
    }
    if (lightsRef.current.mousePointLight) {
      lightsRef.current.mousePointLight.color.setHex(threeColors.core);
    }

    // Traverse and update materials
    sceneRef.current.traverse((child) => {
      if (child.isMesh && child.material) {
        if (child.material.isMeshStandardMaterial || child.material.isMeshPhysicalMaterial) {
          if (child.material.roughness < 0.25 && child.material.transparent) {
            child.material.color.setHex(threeColors.glass);
          } else if (child.material.metalness > 0.7) {
            child.material.color.setHex(threeColors.rings);
          } else {
            child.material.color.setHex(threeColors.core);
            if (child.material.emissive) {
              child.material.emissive.setHex(threeColors.core);
            }
          }
        } else if (child.isPoints && child.material) {
          child.material.color.setHex(threeColors.particles);
        } else if (child.isLine && child.material) {
          child.material.color.setHex(threeColors.rings);
        }
      }
    });
  }, [gradientPreset, isDark]);

  // Update view mode visibility
  useEffect(() => {
    if (coreGroupRef.current) coreGroupRef.current.visible = viewMode === 'core';
    if (meshGroupRef.current) meshGroupRef.current.visible = viewMode === 'mesh';
    if (audioGroupRef.current) audioGroupRef.current.visible = viewMode === 'audio';
  }, [viewMode]);

  // Toggle wireframe mode
  useEffect(() => {
    if (!sceneRef.current) return;
    sceneRef.current.traverse((child) => {
      if (child.isMesh && child.material) {
        if (child.geometry?.type !== 'TorusGeometry') {
          child.material.wireframe = isWireframe;
        }
      }
    });
  }, [isWireframe]);

  // Trigger interactive particle burst
  const triggerBurst = (originX = 0, originY = 0) => {
    if (!sceneRef.current) return;
    setParticleBurstCount((prev) => prev + 1);

    const burstCount = 35;
    for (let i = 0; i < burstCount; i++) {
      const geo = new THREE.SphereGeometry(0.045, 8, 8);
      const mat = new THREE.MeshBasicMaterial({
        color: gradientPreset.threeColors.particles,
        transparent: true,
        opacity: 0.9,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(originX, originY, 0);

      const angle = Math.random() * Math.PI * 2;
      const speed = 0.08 + Math.random() * 0.12;
      const vel = new THREE.Vector3(
        Math.cos(angle) * speed,
        Math.sin(angle) * speed,
        (Math.random() - 0.5) * speed
      );

      sceneRef.current.add(mesh);
      burstParticlesRef.current.push({ mesh, velocity: vel, life: 1.0 });
    }
  };

  // Mouse & Touch Interaction Handlers
  const handleMouseDown = (e) => {
    mouseState.current.isDragging = true;
    mouseState.current.prevX = e.clientX;
    mouseState.current.prevY = e.clientY;
  };

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Normalized mouse (-1 to +1)
    mouseState.current.mouseXNorm = (x / rect.width) * 2 - 1;
    mouseState.current.mouseYNorm = (y / rect.height) * 2 - 1;

    if (mouseState.current.isDragging) {
      const deltaX = e.clientX - mouseState.current.prevX;
      const deltaY = e.clientY - mouseState.current.prevY;
      mouseState.current.rotSpeedX = deltaX * 0.008;
      mouseState.current.rotSpeedY = deltaY * 0.008;

      if (coreGroupRef.current) {
        coreGroupRef.current.rotation.y += mouseState.current.rotSpeedX;
        coreGroupRef.current.rotation.x += mouseState.current.rotSpeedY;
      }
      if (meshGroupRef.current) {
        meshGroupRef.current.rotation.y += mouseState.current.rotSpeedX;
        meshGroupRef.current.rotation.x += mouseState.current.rotSpeedY;
      }
      if (audioGroupRef.current) {
        audioGroupRef.current.rotation.y += mouseState.current.rotSpeedX;
        audioGroupRef.current.rotation.x += mouseState.current.rotSpeedY;
      }

      mouseState.current.prevX = e.clientX;
      mouseState.current.prevY = e.clientY;
    }
  };

  const handleMouseUp = () => {
    mouseState.current.isDragging = false;
  };

  const handleClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 4 - 2;
    const y = -(((e.clientY - rect.top) / rect.height) * 4 - 2);
    triggerBurst(x, y);
  };

  return (
    <div className={`relative select-none group ${className}`}>
      {/* Three.js Interactive Canvas Container */}
      <div
        ref={mountRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={handleClick}
        className="w-full h-full min-h-[420px] sm:min-h-[480px] lg:min-h-[540px] cursor-grab active:cursor-grabbing rounded-3xl overflow-hidden relative"
      />

      {/* Floating 3D HUD & Controls (Peach Worlds Aesthetic) */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none z-20">
        {/* Left: 3D View Modes Pill */}
        <div className="flex items-center space-x-1 p-1 rounded-2xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-peach-200/50 dark:border-peach-400/20 shadow-lg pointer-events-auto">
          <button
            onClick={() => setViewMode('core')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              viewMode === 'core'
                ? 'bg-gradient-to-r from-orange-500 to-rose-500 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-300 hover:text-orange-500'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">3D Orb Core</span>
            <span className="sm:hidden">Core</span>
          </button>

          <button
            onClick={() => setViewMode('mesh')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              viewMode === 'mesh'
                ? 'bg-gradient-to-r from-orange-500 to-rose-500 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-300 hover:text-orange-500'
            }`}
          >
            <Globe2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Peer Mesh</span>
            <span className="sm:hidden">Mesh</span>
          </button>

          <button
            onClick={() => setViewMode('audio')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              viewMode === 'audio'
                ? 'bg-gradient-to-r from-orange-500 to-rose-500 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-300 hover:text-orange-500'
            }`}
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Spatial Wave</span>
            <span className="sm:hidden">Audio</span>
          </button>
        </div>

        {/* Right: Interactive 3D Status Badge */}
        <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-full bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-peach-200/50 dark:border-peach-400/20 text-[11px] font-semibold text-slate-700 dark:text-slate-300 shadow-sm pointer-events-auto">
          <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping" />
          <span>Interactive WebGL 3D</span>
        </div>
      </div>

      {/* Floating Bottom Toolbar (Interaction Controls) */}
      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between pointer-events-none z-20">
        <div className="flex items-center space-x-2 p-1.5 rounded-2xl bg-white/75 dark:bg-slate-900/75 backdrop-blur-xl border border-orange-200/50 dark:border-orange-400/20 shadow-lg pointer-events-auto">
          {/* Auto Rotate Toggle */}
          <button
            onClick={() => setIsAutoRotating(!isAutoRotating)}
            title={isAutoRotating ? 'Pause Rotation' : 'Resume Auto Spin'}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-orange-100/60 dark:hover:bg-orange-500/20 hover:text-orange-600 transition-colors"
          >
            {isAutoRotating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>

          {/* Wireframe Toggle */}
          <button
            onClick={() => setIsWireframe(!isWireframe)}
            title="Toggle Wireframe Hologram"
            className={`p-2 rounded-xl transition-colors ${
              isWireframe
                ? 'bg-orange-500 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:bg-orange-100/60 dark:hover:bg-orange-500/20 hover:text-orange-600'
            }`}
          >
            <Box className="w-4 h-4" />
          </button>

          {/* Trigger Particle Burst */}
          <button
            onClick={() => triggerBurst(0, 0)}
            title="Trigger Particle Stardust Burst"
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-orange-500/15 to-rose-500/15 hover:from-orange-500/25 hover:to-rose-500/25 border border-orange-300/40 dark:border-orange-400/30 text-orange-600 dark:text-orange-300 text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5 text-orange-500 animate-spin" />
            <span className="hidden sm:inline">Stardust Burst</span>
          </button>
        </div>

        {/* Drag Helper Tooltip */}
        <div className="hidden md:flex items-center space-x-1.5 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md text-white/90 text-[10px] font-medium tracking-wide">
          <span>Click & Drag to Rotate 360°</span>
        </div>
      </div>
    </div>
  );
};
