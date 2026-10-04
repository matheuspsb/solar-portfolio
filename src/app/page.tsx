import { celestialBodies } from '@/content/celestial-bodies';
import { credits } from '@/content/credits';
import { sceneDescription } from '@/content/scene';
import { PortfolioExperience } from '@/features/portfolio';

export default function HomePage() {
  return (
    <main className="fixed inset-0">
      <h1 className="sr-only">Matheus</h1>
      <PortfolioExperience
        bodies={celestialBodies}
        credits={credits}
        sceneDescription={sceneDescription}
      />
    </main>
  );
}
