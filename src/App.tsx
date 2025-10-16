import { useState } from 'react';
import Home from './pages/Home';
import Basket from './pages/baskets';

export default function App() {
  const [tab, setTab] = useState<'home'|'basket'>('home');
  return (
    <div>
      <nav className="p-3 border-b flex gap-2">
        <button onClick={()=>setTab('home')} className={`px-3 py-1 rounded ${tab==='home'?'bg-sky-500 text-white':'bg-gray-100'}`}>Home</button>
        <button onClick={()=>setTab('basket')} className={`px-3 py-1 rounded ${tab==='basket'?'bg-sky-500 text-white':'bg-gray-100'}`}>Basket</button>
      </nav>
      {tab === 'home' ? <Home/> : <Basket/>}
    </div>
  );
}
