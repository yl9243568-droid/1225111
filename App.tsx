import React, { useState } from 'react';
import { SceneContainer } from './components/SceneContainer';
import { TreeState } from './types';
import { Sparkles, Gift, Share2, Music } from 'lucide-react';

const App: React.FC = () => {
  const [treeState, setTreeState] = useState<TreeState>(TreeState.SCATTERED);
  const [audioEnabled, setAudioEnabled] = useState(false);

  const toggleState = () => {
    setTreeState(prev => 
      prev === TreeState.SCATTERED ? TreeState.TREE_SHAPE : TreeState.SCATTERED
    );
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gradient-to-b from-gray-900 to-black text-white">
      {/* 3D Scene Background */}
      <SceneContainer treeState={treeState} />

      {/* UI Overlay */}
      <div className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-between p-8 md:p-12">
        
        {/* Header */}
        <header className="flex justify-between items-start pointer-events-auto">
          <div>
            <h2 className="text-xs md:text-sm tracking-[0.3em] text-emerald-400 uppercase font-bold mb-2">
              ONLY FOR YOU
            </h2>
            <h1 className="text-4xl md:text-6xl serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#FFD700] via-[#FDB931] to-[#FFD700] drop-shadow-lg leading-tight">
              Merry Christmas
            </h1>
          </div>
          <button 
            onClick={() => setAudioEnabled(!audioEnabled)}
            className="p-3 rounded-full border border-white/10 bg-black/20 backdrop-blur-md hover:bg-white/10 transition-colors"
          >
            <Music size={20} className={audioEnabled ? "text-[#FFD700]" : "text-white/50"} />
          </button>
        </header>

        {/* Main Interaction Area (Center-Bottom) */}
        <main className="flex flex-col items-center pointer-events-auto pb-12">
           <div className="mb-8 text-center max-w-md">
             <p className="text-lg md:text-xl font-light text-gray-200 opacity-80 serif italic">
               "{treeState === TreeState.SCATTERED 
                  ? 'Chaos precedes the miracle...' 
                  : '...where elegance takes form.'}"
             </p>
           </div>

           <button
             onClick={toggleState}
             className="group relative px-12 py-4 bg-transparent overflow-hidden rounded-full transition-all duration-500"
           >
             {/* Button Background Gradient & Glow */}
             <div className="absolute inset-0 bg-gradient-to-r from-[#004d25] to-[#002813] opacity-80 group-hover:opacity-100 transition-opacity duration-500 border border-[#FFD700]/30" />
             <div className="absolute inset-0 bg-[#FFD700] opacity-0 group-hover:opacity-10 blur-xl transition-all duration-500" />
             
             {/* Button Content */}
             <div className="relative flex items-center gap-4 text-[#FFD700] tracking-widest uppercase text-sm font-bold">
               {treeState === TreeState.SCATTERED ? (
                 <>
                   <Gift size={18} className="group-hover:scale-110 transition-transform duration-300" />
                   <span>Assemble The Tree</span>
                 </>
               ) : (
                 <>
                   <Sparkles size={18} className="group-hover:rotate-90 transition-transform duration-500" />
                   <span>Release Magic</span>
                 </>
               )}
             </div>
           </button>
        </main>

        {/* Footer */}
        <footer className="flex justify-between items-end pointer-events-auto text-xs text-white/40 tracking-widest">
          <div>
            <p>© 2025 Merry Christmas.</p>
            <p>Interactive 3D Experience.</p>
          </div>
          <div className="flex gap-4">
             <button className="hover:text-[#FFD700] transition-colors uppercase">Details</button>
             <button className="hover:text-[#FFD700] transition-colors flex items-center gap-2">
               Share <Share2 size={12} />
             </button>
          </div>
        </footer>
      </div>
      
      {/* Decorative Border Overlay */}
      <div className="absolute inset-0 pointer-events-none border-[1px] border-white/5 m-4 md:m-8 rounded-lg" />
    </div>
  );
};

export default App;