import { Button } from './components';
import { Loader2 } from 'lucide-react';

export function App() {
  return (
    <div>
      <h1 className="text-3xl font-bold underline">Bonjour le monde!!</h1>
      <Button disabled={true} variant="destructive">
        <Loader2 className="animate-spin" />
        Create
      </Button>
    </div>
  );
}

export default App;
