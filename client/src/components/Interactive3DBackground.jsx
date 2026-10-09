import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  Sparkles,
  Pause,
  Play,
  Plus,
  RefreshCw,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export const Interactive3DBackground = () => {
  const mountRef = useRef(null);
  const { gradientPreset, isDark, bg3DMode, currentBg3D, cycleBg3DMode } = useTheme();

  const [isFloating, setIsFloating] = useState(true);

  // References for Three.js engine
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const activeVisualGroupRef = useRef(null);
  const secondaryGroupRef = useRef(null);
  const burstParticlesRef = useRef([]);
  const itemsDataRef = useRef([]);
  const lightsRef = useRef({});

  // Mouse screen & world state
  const mouseState = useRef({
    screenX: 0,
    screenY: 0,
    worldX: 0,
    worldY: 0,
    prevWorldX: 0,
    prevWorldY: 0,
    speed: 0,
    isHovering: false,
  });

  // Rebuild scene elements whenever bg3DMode or isDark changes
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // 2. Camera setup - orthographic-like gentle perspective
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 11);
    cameraRef.current = camera;

    // 3. WebGL Renderer
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

    // 4. Soft Warm Lights (Strictly warm peach / amber / coral / rose, ZERO PURPLE & ZERO BLUE)
    const ambientLight = new THREE.AmbientLight(gradientPreset.threeColors.ambient, 1.45);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(gradientPreset.threeColors.lightA, 2.8);
    dirLight1.position.set(5, 8, 6);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(gradientPreset.threeColors.lightB, 2.0);
    dirLight2.position.set(-5, -6, -3);
    scene.add(dirLight2);

    const mouseLight = new THREE.PointLight(gradientPreset.threeColors.waveColor, 2.4, 12);
    mouseLight.position.set(0, 0, 4);
    scene.add(mouseLight);

    lightsRef.current = { ambientLight, dirLight1, dirLight2, mouseLight };

    // Primary & secondary groups for 3D elements
    const visualGroup = new THREE.Group();
    scene.add(visualGroup);
    activeVisualGroupRef.current = visualGroup;

    const secondaryGroup = new THREE.Group();
    scene.add(secondaryGroup);
    secondaryGroupRef.current = secondaryGroup;

    itemsDataRef.current = [];
    burstParticlesRef.current = [];

    // ========================================================
    // BUILD VISUALS BASED ON SELECTED 3D MODE (bg3DMode)
    // ========================================================

    if (bg3DMode === 'bubbles') {
      // ----------------------------------------------------
      // MODE 1: CUTE TRANSLUCENT GLASS BUBBLES
      // ----------------------------------------------------
      const bubbleCount = 26;
      for (let i = 0; i < bubbleCount; i++) {
        const radius = 0.28 + Math.random() * 0.55;
        const bubbleGeo = new THREE.SphereGeometry(radius, 32, 32);

        const bubbleMat = new THREE.MeshPhysicalMaterial({
          color: gradientPreset.threeColors.waveColor,
          roughness: 0.08,
          transmission: 0.85,
          thickness: 0.4,
          ior: 1.35,
          clearcoat: 1.0,
          clearcoatRoughness: 0.05,
          transparent: true,
          opacity: isDark ? 0.72 : 0.55,
        });

        const bubbleMesh = new THREE.Mesh(bubbleGeo, bubbleMat);
        const x = (Math.random() - 0.5) * 16;
        const y = (Math.random() - 0.5) * 12;
        const z = (Math.random() - 0.5) * 4;
        bubbleMesh.position.set(x, y, z);

        // Glossy white specular shine dot
        const shineGeo = new THREE.SphereGeometry(radius * 0.22, 16, 16);
        const shineMat = new THREE.MeshBasicMaterial({
          color: 0xffffff,
          transparent: true,
          opacity: 0.65,
        });
        const shineMesh = new THREE.Mesh(shineGeo, shineMat);
        shineMesh.position.set(-radius * 0.42, radius * 0.42, radius * 0.5);
        shineMesh.scale.set(1.4, 0.7, 0.5);
        shineMesh.rotation.z = Math.PI / 4;
        bubbleMesh.add(shineMesh);

        // Secondary bottom reflection
        const shine2Geo = new THREE.SphereGeometry(radius * 0.12, 12, 12);
        const shine2Mesh = new THREE.Mesh(shine2Geo, shineMat);
        shine2Mesh.position.set(radius * 0.38, -radius * 0.38, radius * 0.4);
        bubbleMesh.add(shine2Mesh);

        visualGroup.add(bubbleMesh);

        itemsDataRef.current.push({
          type: 'bubble',
          mesh: bubbleMesh,
          radius,
          vx: (Math.random() - 0.5) * 0.008,
          vy: 0.006 + Math.random() * 0.012,
          wobbleSpeed: 1.2 + Math.random() * 1.8,
          phase: Math.random() * Math.PI * 2,
        });
      }

      // Add gentle stardust twinkles in background
      const sparkleCount = 100;
      const sparkleGeo = new THREE.BufferGeometry();
      const sparklePos = new Float32Array(sparkleCount * 3);
      for (let i = 0; i < sparkleCount * 3; i += 3) {
        sparklePos[i] = (Math.random() - 0.5) * 18;
        sparklePos[i + 1] = (Math.random() - 0.5) * 14;
        sparklePos[i + 2] = (Math.random() - 0.5) * 6;
      }
      sparkleGeo.setAttribute('position', new THREE.BufferAttribute(sparklePos, 3));
      const sparkleMat = new THREE.PointsMaterial({
        color: gradientPreset.threeColors.particleColor,
        size: 0.05,
        transparent: true,
        opacity: isDark ? 0.6 : 0.4,
        blending: THREE.AdditiveBlending,
      });
      secondaryGroup.add(new THREE.Points(sparkleGeo, sparkleMat));

    } else if (bg3DMode === 'petals') {
      // ----------------------------------------------------
      // MODE 2: SOFT PEACH & CORAL PETAL DRIFT
      // ----------------------------------------------------
      const petalCount = 42;

      // Custom smooth curved petal geometry
      const createPetalGeometry = () => {
        const shape = new THREE.Shape();
        shape.moveTo(0, -0.3);
        shape.bezierCurveTo(0.24, -0.1, 0.32, 0.3, 0, 0.6);
        shape.bezierCurveTo(-0.32, 0.3, -0.24, -0.1, 0, -0.3);
        const geo = new THREE.ShapeGeometry(shape, 12);
        const pos = geo.attributes.position;
        // Subtle 3D cup curvature
        for (let j = 0; j < pos.count; j++) {
          const px = pos.getX(j);
          const py = pos.getY(j);
          pos.setZ(j, (Math.sin(py * 2.5) + Math.cos(px * 3.5)) * 0.06);
        }
        geo.computeVertexNormals();
        return geo;
      };

      const sharedPetalGeo = createPetalGeometry();

      for (let i = 0; i < petalCount; i++) {
        const scale = 0.55 + Math.random() * 0.6;
        // Warm peach, coral and rose hues
        const petalMat = new THREE.MeshStandardMaterial({
          color: Math.random() > 0.4 ? gradientPreset.threeColors.waveColor : gradientPreset.threeColors.particleColor,
          roughness: 0.45,
          metalness: 0.02,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: isDark ? 0.78 : 0.65,
        });

        const petalMesh = new THREE.Mesh(sharedPetalGeo, petalMat);
        const x = (Math.random() - 0.5) * 18;
        const y = (Math.random() - 0.5) * 14;
        const z = (Math.random() - 0.5) * 4;
        petalMesh.position.set(x, y, z);
        petalMesh.scale.set(scale, scale, scale);
        petalMesh.rotation.set(
          Math.random() * Math.PI * 2,
          Math.random() * Math.PI * 2,
          Math.random() * Math.PI * 2
        );

        visualGroup.add(petalMesh);

        itemsDataRef.current.push({
          type: 'petal',
          mesh: petalMesh,
          scale,
          vx: (Math.random() - 0.5) * 0.006 - 0.003,
          vy: -(0.007 + Math.random() * 0.012),
          rotXSpeed: (Math.random() - 0.5) * 0.02,
          rotYSpeed: (Math.random() - 0.5) * 0.025,
          rotZSpeed: (Math.random() - 0.5) * 0.015,
          phase: Math.random() * Math.PI * 2,
          flutterSpeed: 1.2 + Math.random() * 1.5,
        });
      }

    } else if (bg3DMode === 'sparkles') {
      // ----------------------------------------------------
      // MODE 3: FAIRY STARDUST & GLOWING EMBERS
      // ----------------------------------------------------
      const sparkleCount = 240;
      const sparkleGeo = new THREE.BufferGeometry();
      const sparklePos = new Float32Array(sparkleCount * 3);
      const sparkleSizes = new Float32Array(sparkleCount);

      for (let i = 0; i < sparkleCount; i++) {
        sparklePos[i * 3] = (Math.random() - 0.5) * 20;
        sparklePos[i * 3 + 1] = (Math.random() - 0.5) * 14;
        sparklePos[i * 3 + 2] = (Math.random() - 0.5) * 6;
        sparkleSizes[i] = 0.04 + Math.random() * 0.08;
      }
      sparkleGeo.setAttribute('position', new THREE.BufferAttribute(sparklePos, 3));

      const sparkleMat = new THREE.PointsMaterial({
        color: gradientPreset.threeColors.particleColor,
        size: 0.07,
        transparent: true,
        opacity: isDark ? 0.8 : 0.6,
        blending: THREE.AdditiveBlending,
      });

      const sparklePoints = new THREE.Points(sparkleGeo, sparkleMat);
      visualGroup.add(sparklePoints);

      // Plus 18 3D star sparkle crosses that rotate in 3D
      const starGeo = new THREE.OctahedronGeometry(0.2, 0);
      for (let i = 0; i < 18; i++) {
        const starMat = new THREE.MeshBasicMaterial({
          color: gradientPreset.threeColors.gridColor,
          transparent: true,
          opacity: 0.75,
        });
        const starMesh = new THREE.Mesh(starGeo, starMat);
        starMesh.scale.set(0.25, 1.4, 0.25);
        starMesh.position.set(
          (Math.random() - 0.5) * 16,
          (Math.random() - 0.5) * 12,
          (Math.random() - 0.5) * 3
        );
        visualGroup.add(starMesh);

        itemsDataRef.current.push({
          type: 'star',
          mesh: starMesh,
          rotSpeed: 0.015 + Math.random() * 0.02,
          pulsePhase: Math.random() * Math.PI * 2,
          baseY: starMesh.position.y,
        });
      }

      itemsDataRef.current.push({
        type: 'sparkleCloud',
        points: sparklePoints,
        geo: sparkleGeo,
        posArray: sparklePos,
      });

    } else if (bg3DMode === 'silk-waves') {
      // ----------------------------------------------------
      // MODE 4: ORGANIC SILK RIBBONS (NO WIREFRAME, NO GRID)
      // ----------------------------------------------------
      const ribbonCount = 4;
      for (let r = 0; r < ribbonCount; r++) {
        const planeGeo = new THREE.PlaneGeometry(18, 2.4, 52, 14);
        const silkMat = new THREE.MeshPhysicalMaterial({
          color: r % 2 === 0 ? gradientPreset.threeColors.waveColor : gradientPreset.threeColors.particleColor,
          roughness: 0.22,
          transmission: 0.65,
          thickness: 0.25,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: isDark ? 0.65 : 0.48,
          clearcoat: 0.8,
        });

        const silkMesh = new THREE.Mesh(planeGeo, silkMat);
        const yOffset = (r - 1.5) * 2.8;
        silkMesh.position.set(0, yOffset, (r - 1.5) * 1.2);
        silkMesh.rotation.x = -Math.PI / 10 + (r * 0.05);
        silkMesh.rotation.z = (r % 2 === 0 ? 1 : -1) * 0.08;
        visualGroup.add(silkMesh);

        itemsDataRef.current.push({
          type: 'silkRibbon',
          mesh: silkMesh,
          geo: planeGeo,
          origPositions: Float32Array.from(planeGeo.attributes.position.array),
          phase: r * 1.2,
          speed: 1.1 + r * 0.2,
        });
      }

    } else if (bg3DMode === 'crystals') {
      // ----------------------------------------------------
      // MODE 5: TRANSLUCENT FLOATING GEM PRISMS
      // ----------------------------------------------------
      const gemCount = 22;
      for (let i = 0; i < gemCount; i++) {
        const radius = 0.26 + Math.random() * 0.42;
        const gemGeo = i % 2 === 0
          ? new THREE.OctahedronGeometry(radius, 0)
          : new THREE.IcosahedronGeometry(radius, 0);

        const gemMat = new THREE.MeshPhysicalMaterial({
          color: gradientPreset.threeColors.waveColor,
          roughness: 0.06,
          transmission: 0.88,
          thickness: 0.55,
          ior: 1.45,
          clearcoat: 1.0,
          clearcoatRoughness: 0.05,
          transparent: true,
          opacity: isDark ? 0.82 : 0.68,
        });

        const gemMesh = new THREE.Mesh(gemGeo, gemMat);
        const x = (Math.random() - 0.5) * 16;
        const y = (Math.random() - 0.5) * 12;
        const z = (Math.random() - 0.5) * 3.5;
        gemMesh.position.set(x, y, z);
        gemMesh.rotation.set(
          Math.random() * Math.PI * 2,
          Math.random() * Math.PI * 2,
          Math.random() * Math.PI * 2
        );

        visualGroup.add(gemMesh);

        itemsDataRef.current.push({
          type: 'gem',
          mesh: gemMesh,
          radius,
          vx: (Math.random() - 0.5) * 0.005,
          vy: (Math.random() - 0.5) * 0.005,
          rotX: (Math.random() - 0.5) * 0.018,
          rotY: (Math.random() - 0.5) * 0.022,
          rotZ: (Math.random() - 0.5) * 0.015,
          phase: Math.random() * Math.PI * 2,
        });
      }
    }

    // ========================================================
    // SMOOTH ANIMATION LOOP
    // ========================================================
    let animationFrameId;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Convert mouse position to approximate 3D world plane at z=0
      const vector = new THREE.Vector3(mouseState.current.screenX, mouseState.current.screenY, 0.5);
      vector.unproject(camera);
      const dir = vector.sub(camera.position).normalize();
      const distance = -camera.position.z / dir.z;
      const mouseWorldPos = camera.position.clone().add(dir.multiplyScalar(distance));

      mouseState.current.prevWorldX = mouseState.current.worldX;
      mouseState.current.prevWorldY = mouseState.current.worldY;
      mouseState.current.worldX = mouseWorldPos.x;
      mouseState.current.worldY = mouseWorldPos.y;

      const mdx = mouseWorldPos.x - mouseState.current.prevWorldX;
      const mdy = mouseWorldPos.y - mouseState.current.prevWorldY;
      mouseState.current.speed = Math.sqrt(mdx * mdx + mdy * mdy);

      mouseLight.position.x = mouseWorldPos.x;
      mouseLight.position.y = mouseWorldPos.y;

      if (isFloating) {
        // Update items based on current mode
        itemsDataRef.current.forEach((item) => {
          if (item.type === 'bubble') {
            // Bubbles: upward drift with wobble
            item.mesh.position.y += item.vy;
            item.mesh.position.x += Math.sin(elapsedTime * item.wobbleSpeed + item.phase) * 0.005 + item.vx;

            if (item.mesh.position.y > 7.5) {
              item.mesh.position.y = -7.5;
              item.mesh.position.x = (Math.random() - 0.5) * 16;
            }
            if (item.mesh.position.x > 9.5) item.mesh.position.x = -9.5;
            if (item.mesh.position.x < -9.5) item.mesh.position.x = 9.5;

            // Cursor repulsion
            const dx = item.mesh.position.x - mouseWorldPos.x;
            const dy = item.mesh.position.y - mouseWorldPos.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 2.5 && dist > 0.05) {
              const force = (2.5 - dist) * 0.018;
              item.mesh.position.x += (dx / dist) * force;
              item.mesh.position.y += (dy / dist) * force;
              item.mesh.scale.set(1.08, 0.92, 1.05);
            } else {
              item.mesh.scale.lerp(new THREE.Vector3(1, 1, 1), 0.08);
            }

          } else if (item.type === 'petal') {
            // Petals: downward drift with flutter & wind gust
            item.mesh.position.y += item.vy;
            item.mesh.position.x += Math.sin(elapsedTime * item.flutterSpeed + item.phase) * 0.008 + item.vx;

            // 3D flutter rotations
            item.mesh.rotation.x += item.rotXSpeed;
            item.mesh.rotation.y += item.rotYSpeed;
            item.mesh.rotation.z += item.rotZSpeed;

            // Seamless wrap-around
            if (item.mesh.position.y < -7.5) {
              item.mesh.position.y = 7.5;
              item.mesh.position.x = (Math.random() - 0.5) * 18;
            }
            if (item.mesh.position.x < -10) item.mesh.position.x = 10;
            if (item.mesh.position.x > 10) item.mesh.position.x = -10;

            // Cursor wind gust
            const dx = item.mesh.position.x - mouseWorldPos.x;
            const dy = item.mesh.position.y - mouseWorldPos.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 3.0 && dist > 0.05) {
              const gust = (3.0 - dist) * 0.025;
              item.mesh.position.x += (dx / dist) * gust;
              item.mesh.position.y += (dy / dist) * gust;
              item.mesh.rotation.z += gust * 2.0;
            }

          } else if (item.type === 'star') {
            // Stars: rotating sparkle
            item.mesh.rotation.y += item.rotSpeed;
            item.mesh.rotation.z += item.rotSpeed * 0.7;
            const scale = 1.0 + Math.sin(elapsedTime * 2.5 + item.pulsePhase) * 0.25;
            item.mesh.scale.set(0.25 * scale, 1.4 * scale, 0.25 * scale);

          } else if (item.type === 'sparkleCloud') {
            // Sparkles slow rotation
            item.points.rotation.y = elapsedTime * 0.015;

          } else if (item.type === 'silkRibbon') {
            // Silk waves: gentle undulating sine wave deformation
            const posAttr = item.geo.attributes.position;
            const count = posAttr.count;
            for (let i = 0; i < count; i++) {
              const ox = item.origPositions[i * 3];
              const oy = item.origPositions[i * 3 + 1];

              // Smooth sinusoidal wave displacement
              const waveZ = Math.sin(ox * 0.35 + elapsedTime * item.speed + item.phase) * 0.65 +
                            Math.cos(oy * 0.8 + elapsedTime * 1.0) * 0.25;

              // Mouse ripple interaction
              const worldRibbonX = item.mesh.position.x + ox;
              const worldRibbonY = item.mesh.position.y + oy;
              const rdx = worldRibbonX - mouseWorldPos.x;
              const rdy = worldRibbonY - mouseWorldPos.y;
              const rDist = Math.sqrt(rdx * rdx + rdy * rdy);
              const mouseRipple = rDist < 3.0 ? Math.sin((3.0 - rDist) * 3.0 - elapsedTime * 4.0) * 0.35 : 0;

              posAttr.setZ(i, waveZ + mouseRipple);
            }
            posAttr.needsUpdate = true;
            item.geo.computeVertexNormals();

          } else if (item.type === 'gem') {
            // Gem: slowly tumbling
            item.mesh.rotation.x += item.rotX;
            item.mesh.rotation.y += item.rotY;
            item.mesh.rotation.z += item.rotZ;

            item.mesh.position.x += item.vx + Math.sin(elapsedTime * 0.8 + item.phase) * 0.003;
            item.mesh.position.y += item.vy + Math.cos(elapsedTime * 0.6 + item.phase) * 0.003;

            // Cursor push
            const dx = item.mesh.position.x - mouseWorldPos.x;
            const dy = item.mesh.position.y - mouseWorldPos.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 2.5 && dist > 0.05) {
              const impulse = (2.5 - dist) * 0.02;
              item.mesh.position.x += (dx / dist) * impulse;
              item.mesh.position.y += (dy / dist) * impulse;
              item.mesh.rotation.x += impulse * 3;
            }
          }
        });
      }

      // Animate burst particles
      if (burstParticlesRef.current.length > 0) {
        burstParticlesRef.current = burstParticlesRef.current.filter((p) => {
          p.mesh.position.add(p.velocity);
          p.mesh.scale.multiplyScalar(0.96);
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

    // Resize observer
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

    // Global pointer move
    const handleGlobalMouseMove = (e) => {
      mouseState.current.screenX = (e.clientX / window.innerWidth) * 2 - 1;
      mouseState.current.screenY = -(e.clientY / window.innerHeight) * 2 + 1;
      mouseState.current.isHovering = true;
    };

    window.addEventListener('mousemove', handleGlobalMouseMove);

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      if (container && renderer.domElement) {
        container.innerHTML = '';
      }
      renderer.dispose();
    };
  }, [bg3DMode, isDark]);

  // Update light & material colors when gradientPreset changes without full rebuild
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
    if (lightsRef.current.mouseLight) {
      lightsRef.current.mouseLight.color.setHex(threeColors.waveColor);
    }

    itemsDataRef.current.forEach((item) => {
      if (item.mesh && item.mesh.material) {
        item.mesh.material.color?.setHex(threeColors.waveColor);
      }
    });
  }, [gradientPreset]);

  // Canvas click handler: spawns mode-specific interactive effects!
  const handleCanvasClick = () => {
    if (!sceneRef.current) return;

    const wx = mouseState.current.worldX;
    const wy = mouseState.current.worldY;

    // Spawn 16 sparkling burst particles at click location
    const count = 16;
    for (let i = 0; i < count; i++) {
      const geo = new THREE.SphereGeometry(0.05, 8, 8);
      const mat = new THREE.MeshBasicMaterial({
        color: gradientPreset.threeColors.particleColor,
        transparent: true,
        opacity: 0.9,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(wx, wy, 0.5);

      const angle = Math.random() * Math.PI * 2;
      const speed = 0.05 + Math.random() * 0.12;
      const vel = new THREE.Vector3(
        Math.cos(angle) * speed,
        Math.sin(angle) * speed,
        (Math.random() - 0.5) * speed
      );

      sceneRef.current.add(mesh);
      burstParticlesRef.current.push({ mesh, velocity: vel, life: 1.0 });
    }
  };

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
      {/* 3D WebGL Multi-Mode Canvas Layer */}
      <div
        ref={mountRef}
        onClick={handleCanvasClick}
        title={`Click anywhere for 3D interactive ${currentBg3D.name} effects!`}
        className="w-full h-full pointer-events-auto cursor-pointer"
      />

      {/* Dynamic 3D Visual HUD Pill in Top Right */}
      <div className="absolute top-4 right-4 z-20 pointer-events-auto flex items-center space-x-1.5 p-1 rounded-2xl bg-white/85 dark:bg-stone-900/85 backdrop-blur-xl border border-orange-200/60 dark:border-orange-500/25 shadow-lg">
        {/* Switcher Pill Button */}
        <button
          onClick={cycleBg3DMode}
          title={`Active: ${currentBg3D.name} (${currentBg3D.tagline}). Click to switch to next 3D Visual!`}
          className="px-2.5 py-1 text-xs font-semibold text-orange-700 dark:text-orange-300 flex items-center gap-1.5 hover:bg-orange-50 dark:hover:bg-stone-800 rounded-xl transition-colors cursor-pointer group"
        >
          <span className="text-sm">{currentBg3D.icon}</span>
          <span>{currentBg3D.name}</span>
          <RefreshCw className="w-3 h-3 text-orange-500 group-hover:rotate-180 transition-transform" />
        </button>

        {/* Interactive Burst Sparkle Button */}
        <button
          onClick={handleCanvasClick}
          title="Spawn 3D sparkles at center"
          className="p-1.5 rounded-lg text-stone-500 hover:text-orange-600 dark:text-stone-400 hover:bg-orange-50 dark:hover:bg-stone-800 transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 text-orange-500" />
        </button>

        {/* Pause / Resume Float Button */}
        <button
          onClick={() => setIsFloating(!isFloating)}
          title={isFloating ? 'Pause 3D Physics' : 'Resume 3D Physics'}
          className="p-1.5 rounded-lg text-stone-500 hover:text-orange-600 dark:text-stone-400 hover:bg-orange-50 dark:hover:bg-stone-800 transition-colors cursor-pointer"
        >
          {isFloating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  );
};
