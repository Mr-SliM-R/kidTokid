import { useState } from 'react';
import Home from './pages/Home';
import Basket from './pages/Basket';
import './App.css';


export default function App() {
  const [tab, setTab] = useState<'home' | 'basket'>('home');

  return (
    <div>
      <nav className="p-3 border-b flex gap-2 bg-gray-100">
        <button
          onClick={() => setTab('home')}
          className={`px-3 py-1 rounded ${tab === 'home' ? 'bg-sky-500 text-white' : 'bg-white'}`}
        >
          Home
        </button>
        <button
          onClick={() => setTab('basket')}
          className={`px-3 py-1 rounded ${tab === 'basket' ? 'bg-sky-500 text-white' : 'bg-white'}`}
        >
          Basket
        </button>
      </nav>

      <main className="p-4">
        {tab === 'home' ? <Home /> : <Basket />}
      </main>
    </div>
  );
}
