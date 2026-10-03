import { celestialBodies } from '@/content/celestial-bodies';
import { SolarSystemSceneLoader } from '@/scene/organisms/SolarSystemSceneLoader';

export default function HomePage() {
  return (
    <main className="fixed inset-0">
      <h1 className="sr-only">Matheus</h1>
      <SolarSystemSceneLoader bodies={celestialBodies} />
    </main>
  );
}
