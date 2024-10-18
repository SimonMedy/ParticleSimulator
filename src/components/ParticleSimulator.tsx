import React, { useState, useEffect, useRef, RefObject } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

interface Particle {
  x: number;
  y: number;
  radius: number;
  dx: number;
  dy: number;
  mass: number;
}

const SimulateurParticules: React.FC = () => {
  const canvasRef: RefObject<HTMLCanvasElement> = useRef(null);
  const particlesRef = useRef<Particle[]>([]);
  const [estEnCours, setEstEnCours] = useState(false);
  const [nombreParticules, setNombreParticules] = useState(50);
  const [forceGravite, setForceGravite] = useState(0.1);

  const creerParticules = (nombre: number, canvas: HTMLCanvasElement): Particle[] => {
    const nouvellesParticules: Particle[] = [];
    for (let i = 0; i < nombre; i++) {
      nouvellesParticules.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 2 + 1,
        dx: (Math.random() - 0.5) * 2,
        dy: (Math.random() - 0.5) * 2,
        mass: Math.random() * 10 + 1
      });
    }
    return nouvellesParticules;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let idAnimationFrame: number;

    const redimensionnerCanvas = () => {
      if (canvas) {
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
      }
    };

    const mettreAJourParticules = () => {
      const particules = particlesRef.current;
      particules.forEach(particule => {
        particules.forEach(autreParticule => {
          if (particule !== autreParticule) {
            const dx = autreParticule.x - particule.x;
            const dy = autreParticule.y - particule.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const force = (forceGravite * particule.mass * autreParticule.mass) / (distance * distance);
            const angle = Math.atan2(dy, dx);
            
            particule.dx += force * Math.cos(angle) / particule.mass;
            particule.dy += force * Math.sin(angle) / particule.mass;
          }
        });

        particule.x += particule.dx;
        particule.y += particule.dy;

        if (particule.x < 0 || particule.x > canvas.width) particule.dx *= -1;
        if (particule.y < 0 || particule.y > canvas.height) particule.dy *= -1;
      });
    };

    const dessinerParticules = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particlesRef.current.forEach(particule => {
        ctx.beginPath();
        ctx.arc(particule.x, particule.y, particule.radius, 0, Math.PI * 2);
        ctx.fillStyle = `hsl(${particule.mass * 36}, 100%, 50%)`;
        ctx.fill();
      });
    };

    const animer = () => {
      mettreAJourParticules();
      dessinerParticules();
      idAnimationFrame = requestAnimationFrame(animer);
    };

    redimensionnerCanvas();
    particlesRef.current = creerParticules(nombreParticules, canvas);
    window.addEventListener('resize', redimensionnerCanvas);

    if (estEnCours) {
      animer();
    } else {
      dessinerParticules();
    }

    return () => {
      window.removeEventListener('resize', redimensionnerCanvas);
      cancelAnimationFrame(idAnimationFrame);
    };
  }, [estEnCours, nombreParticules, forceGravite]);

  const basculerSimulation = () => setEstEnCours(!estEnCours);

  const reinitialiserSimulation = () => {
    setEstEnCours(false);
    const canvas = canvasRef.current;
    if (canvas) {
      particlesRef.current = creerParticules(nombreParticules, canvas);
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particlesRef.current.forEach(particule => {
          ctx.beginPath();
          ctx.arc(particule.x, particule.y, particule.radius, 0, Math.PI * 2);
          ctx.fillStyle = `hsl(${particule.mass * 36}, 100%, 50%)`;
          ctx.fill();
        });
      }
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen">
      <Card className="p-6 w-full max-w-3xl">
        <h1 className="text-2xl font-bold mb-4">Simulateur de Particules</h1>
        <div className="mb-4 space-y-4">
          <div className="flex space-x-2">
            <Button onClick={basculerSimulation}>
              {estEnCours ? 'Pause' : 'Démarrer'} la simulation
            </Button>
            <Button onClick={reinitialiserSimulation}>Réinitialiser</Button>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Nombre de particules : {nombreParticules}</label>
            <Slider
              min={10}
              max={200}
              step={1}
              value={[nombreParticules]}
              onValueChange={(value) => {
                setNombreParticules(value[0]);
                reinitialiserSimulation();
              }}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Force de gravité : {forceGravite.toFixed(2)}</label>
            <Slider
              min={0}
              max={1}
              step={0.01}
              value={[forceGravite]}
              onValueChange={(value) => setForceGravite(value[0])}
            />
          </div>
        </div>
        <canvas
          ref={canvasRef}
          className="w-full h-[400px] bg-gray-100 rounded-lg"
        />
      </Card>
    </div>
  );
};

export default SimulateurParticules;