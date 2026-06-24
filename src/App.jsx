import { useState } from 'react';
import Intro from './components/Intro';
import Quiz from './components/Quiz';
import Results from './components/Results';
import LifestyleGuide from './components/LifestyleGuide/LifestyleGuide';
import Coach from './components/Coach';

export default function App() {
  const [page, setPage] = useState('intro');
  const [prevPage, setPrevPage] = useState('intro');
  const [scores, setScores] = useState({ vata: 0, pitta: 0, kapha: 0 });

  const goTo = (next) => {
    setPrevPage(page);
    setPage(next);
  };

  const handleQuizComplete = (finalScores) => {
    setScores(finalScores);
    goTo('results');
  };

  const handleRetake = () => {
    setScores({ vata: 0, pitta: 0, kapha: 0 });
    goTo('quiz');
  };

  return (
    <div key={page} className="min-h-screen bg-[#faf7f2] page-enter">
      {page === 'intro' && (
        <Intro onStart={() => goTo('quiz')} onCoach={() => goTo('coach')} />
      )}
      {page === 'quiz' && <Quiz onComplete={handleQuizComplete} onBack={() => setPage('intro')} />}
      {page === 'results' && (
        <Results
          scores={scores}
          onViewGuide={() => goTo('guide')}
          onRetake={handleRetake}
          onCoach={() => goTo('coach')}
        />
      )}
      {page === 'guide' && (
        <LifestyleGuide
          scores={scores}
          onBack={() => setPage('results')}
          onCoach={() => goTo('coach')}
        />
      )}
      {page === 'coach' && (
        <Coach scores={scores} onBack={() => setPage(prevPage)} />
      )}
    </div>
  );
}
