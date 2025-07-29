import React, { useRef, useEffect, useState, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Html, Environment } from '@react-three/drei'; // Pastikan Environment diimpor
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { useLoader } from '@react-three/fiber';
import { EXRLoader } from 'three/examples/jsm/loaders/EXRLoader';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import FuzzyText from './AnimationComponent/FuzzyText';
import SplashCursor from './AnimationComponent/SplashCursor';
import MetaBalls from './AnimationComponent/MetaBall';
import DecryptedText from './AnimationComponent/DecryptedText';
import './App.css'; 

function Loader() {
  return <Html center><div style={{ color: 'white' }}>Loading Scene...</div></Html>;
}

// Box dimodifikasi untuk 'melempar' bayangan (castShadow)
function Box({ targetRotation }) {
  const meshRef = useRef();
  const boxSize = 2.5;
  const [isHovered, setIsHovered] = useState(false);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.x += (targetRotation.x - meshRef.current.rotation.x) * 0.1;
      meshRef.current.rotation.y += (targetRotation.y - meshRef.current.rotation.y) * 0.1;
    }
  });

  const htmlProps = {
    transform: true,
    occlude: true,
    scale: 0.5,
    className: "html-content",
  };

  return (
    <mesh
      ref={meshRef}
      onPointerOver={() => setIsHovered(true)}
      onPointerOut={() => setIsHovered(false)}
    >
      <boxGeometry args={[boxSize, boxSize, boxSize]} />
      <meshStandardMaterial
        color="#4A445C"
        opacity={0}      // Atur tingkat transparansi (0 sepenuhnya transparan, 1 sepenuhnya buram)
        transparent={true} // Aktifkan mode transparansi
        depthWrite={false} // Penting untuk urutan rendering yang benar pada objek transparan
        side={THREE.DoubleSide} // Pastikan kedua sisi material dirender (penting jika ada rotasi)
      />

      {/* SISI 0: DEPAN */}
      <Html position={[0, 0, boxSize / 2 + 0.01]} {...htmlProps}>
        <div className="wrapper">
          <FuzzyText baseIntensity={isHovered ? 0.6 : 0.2} enableHover={false}>
            Scroll Down
          </FuzzyText>
        </div>
      </Html>

      {/* SISI 1: KANAN */}
      <Html position={[boxSize / 2 + 0.01, 0, 0]} rotation-y={Math.PI / 2} {...htmlProps}>
        <div className="wrapper">
          <MetaBalls
            color="#ffffff"
            cursorBallColor="#ffffff"
            cursorBallSize={2}
            ballCount={15}
            animationSize={30}
            enableMouseInteraction={true}
            enableTransparency={true}
            hoverSmoothness={0.05}
            clumpFactor={1}
            speed={0.3}
          />
        </div>
      </Html>

      {/* SISI 2: BELAKANG */}
      <Html position={[0, 0, -boxSize / 2 - 0.01]} rotation-y={Math.PI} {...htmlProps}>
        <div className="wrapper">
          <h2>PURPOSE</h2>
          <p>Mencoba Three JS dan React menggunakan FIBER</p>
          <p>hehe</p>
        </div>
      </Html>

      {/* SISI 3: KIRI */}
      <Html position={[-boxSize / 2 - 0.01, 0, 0]} rotation-y={-Math.PI / 2} {...htmlProps}>
        <div className="wrapper">
          <DecryptedText text="Hey There!!!" />
          <br />
          <h2>Hover It</h2>
        </div>
      </Html>

      {/* SISI 4: ATAS */}
      <Html position={[0, boxSize / 2 + 0.01, 0]} rotation-x={-Math.PI / 2} {...htmlProps}>
        <div className="wrapper">
          <h2>Menggunakan</h2>
          <h2>ChatGPT dan Gemini</h2>
        </div>
      </Html>
      
      {/* SISI 5: BAWAH */}
      <Html position={[0, -boxSize / 2 - 0.01, 0]} rotation-x={Math.PI / 2} {...htmlProps}>
        <div className="wrapper">
          <h2>Ngeleg Wak</h2>
          <h1>WKKWKWKWKWK</h1>
        </div>
      </Html>
    </mesh>
  );  
}

function RotatingEnvironment({ targetRotation }) {
  const scrollGroupRef = useRef();
  const ambientGroupRef = useRef();

  // 1. PASTIKAN ANDA MENGGUNAKAN useLoader DENGAN EXRLoader
  const texture = useLoader(EXRLoader, '/starmap_2020_4k.exr');

  // 2. PASTIKAN useEffect INI ADA UNTUK MENGATUR MAPPING
  useEffect(() => {
    if (texture) {
      texture.mapping = THREE.EquirectangularReflectionMapping;
    }
  }, [texture]);

  useFrame((state, delta) => {
    // ... (logika rotasi tidak perlu diubah)
    if (scrollGroupRef.current) {
      scrollGroupRef.current.rotation.x = THREE.MathUtils.lerp(scrollGroupRef.current.rotation.x, targetRotation.x, 0.05);
      scrollGroupRef.current.rotation.y = THREE.MathUtils.lerp(scrollGroupRef.current.rotation.y, targetRotation.y, 0.05);
    }
    if (ambientGroupRef.current) {
      ambientGroupRef.current.rotation.y += delta * 0.01;
    }
  });

  return (
    <group ref={scrollGroupRef}>
      <group ref={ambientGroupRef}>
        <mesh>
          <sphereGeometry args={[500, 60, 40]} />
          <meshBasicMaterial map={texture} side={THREE.BackSide} />
        </mesh>
      </group>
    </group>
  );
}

function BackgroundMusic() {
  const audioRef = useRef(null);
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    const playAudio = () => {
      if (audioRef.current && !hasInteracted) {
        audioRef.current.play().catch(error => {
          // Menangani error jika autoplay diblokir
          console.log("Autoplay diblokir, menunggu interaksi pengguna.");
        });
        setHasInteracted(true);
        // Hapus listener setelah audio berhasil diputar
        window.removeEventListener('scroll', playAudio);
        window.removeEventListener('click', playAudio);
      }
    };

    // Tambahkan listener untuk interaksi pertama
    window.addEventListener('scroll', playAudio);
    window.addEventListener('click', playAudio);

    return () => {
      // Cleanup listener saat komponen unmount
      window.removeEventListener('scroll', playAudio);
      window.removeEventListener('click', playAudio);
    };
  }, [hasInteracted]);

  return (
    <audio ref={audioRef} src="/bgm.mp3" loop />
  );
}

// Komponen App tidak perlu diubah
function App() {
  const [step, setStep] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);

  const handleScroll = (e) => {
    if (isScrolling) return;
    setIsScrolling(true);
    const direction = e.deltaY > 0 ? 1 : -1;
    setStep((prev) => (prev + direction + 6) % 6);
    setTimeout(() => setIsScrolling(false), 800);
  };

  useEffect(() => {
    window.addEventListener('wheel', handleScroll);
    return () => window.removeEventListener('wheel', handleScroll);
  }, [isScrolling]);

  let targetRotation = { x: 0, y: 0 };
  if (step <= 3) {
    targetRotation = { x: 0, y: (step * Math.PI) / 2 };
  } else if (step === 4) {
    targetRotation = { x: -Math.PI / 2, y: 0 };
  } else if (step === 5) {
    targetRotation = { x: Math.PI / 2, y: 0 };
  }

  return (
    <div style={{ width: '100vw', height: '100vh' }}> 
      {/* 1. Render komponen kursor di sini */}
      <SplashCursor />
      <BackgroundMusic />

    <Canvas shadows={false} dpr={[1, 1.5]} camera={{ position: [0, 1, 9], fov: 45 }}>
      <ambientLight intensity={0.5} />
      <directionalLight
        castShadow
        position={[2.5, 8, 5]}
        intensity={1.5}
      />
      
      <Box targetRotation={targetRotation} />

      <mesh receiveShadow rotation-x={-Math.PI / 2} position={[0, -4, 0]}>
        <planeGeometry args={[50, 50]} />
        <shadowMaterial opacity={0.3} />
      </mesh>
      
      <Suspense fallback={<Loader />}>
        {/* 2. KIRIM 'targetRotation' KE KOMPONEN BACKGROUND */}
        <RotatingEnvironment targetRotation={targetRotation} />
      </Suspense>

      <EffectComposer>
        <Bloom luminanceThreshold={0.6} intensity={0.7} mipmapBlur />
      </EffectComposer>
    </Canvas>

    <header className="header-information">
      <div>
        Click To Play The Music
      </div>
    </header>

    <footer className="footer-credits">
      <div>
        Music by <a href="https://pixabay.com/users/tatamusic-51344851/?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=377662"> Mykola Sosin </a> from 
        <a href="https://pixabay.com//?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=377662"> Pixabay </a>
        <br/>
        Animation by <a href='https://reactbits.dev'> ReactBits</a> || Created By <a href='https://github.com/Keen-taro/Keen-taro'> Keen-Tar00 </a>
      </div>
    </footer>

    </div>
  );
}

export default App;