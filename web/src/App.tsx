import { useState } from 'react';
import Home from './pages/Home';
import Basket from './pages/Basket';
import Deliveries from './pages/Deliveries';
import Categories from './pages/Categories';
import PostListing from './pages/PostListing';

export default function App() {
  const [tab, setTab] = useState<'home'|'categories'|'basket'|'deliveries'|'post'>('home');

  return (
    <div>
      <nav className="p-3 border-b flex gap-2">
        <button onClick={()=>setTab('home')} className={`px-3 py-1 rounded ${tab==='home'?'bg-sky-500 text-white':'bg-gray-100'}`}>Home</button>
        <button onClick={()=>setTab('categories')} className={`px-3 py-1 rounded ${tab==='categories'?'bg-sky-500 text-white':'bg-gray-100'}`}>Categories</button>
        <button onClick={()=>setTab('basket')} className={`px-3 py-1 rounded ${tab==='basket'?'bg-sky-500 text-white':'bg-gray-100'}`}>Basket</button>
        <button onClick={()=>setTab('deliveries')} className={`px-3 py-1 rounded ${tab==='deliveries'?'bg-sky-500 text-white':'bg-gray-100'}`}>Deliveries</button>
        <button onClick={()=>setTab('post')} className={`px-3 py-1 rounded ${tab==='post'?'bg-sky-500 text-white':'bg-gray-100'}`}>Post</button>
      </nav>

      {tab==='post' ? <PostListing/> :
       tab==='home' ? <Home/> :
       tab==='categories' ? <Categories/> :
       tab==='basket' ? <Basket/> :
       <Deliveries/>}
    </div>
  );
}
