import React from 'react';
import { Shield, Feather, Sparkles, MapPin } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-rage-950 text-white py-16 sm:py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Title */}
        <div className="text-center space-y-3">
          <span className="text-xs font-bold uppercase tracking-[0.4em] text-rage-400">
            Brand Manifesto
          </span>
          <h1 className="font-['Cinzel'] text-4xl sm:text-5xl font-black uppercase tracking-widest text-white">
            GENRAGE
          </h1>
          <p className="text-xs uppercase tracking-[0.3em] text-gray-400 font-semibold">
            Avant-Garde Gothic Streetwear // Born from Dissent
          </p>
        </div>

        {/* Hero Visual */}
        <div className="relative aspect-[16/9] overflow-hidden border border-rage-800">
          <img
            src="https://images.unsplash.com/photo-1548883354-7622d03aca27?w=1600"
            alt="GENRAGE Studio"
            className="w-full h-full object-cover filter grayscale contrast-150"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40" />
        </div>

        {/* Narrative */}
        <div className="space-y-6 text-sm text-gray-300 leading-relaxed">
          <p className="first-letter:font-['Cinzel'] first-letter:text-5xl first-letter:font-black first-letter:float-left first-letter:mr-3 first-letter:text-white">
            GENRAGE was established with a singular obsession: to disrupt the flood of repetitive, lightweight fast-fashion by building heavy, architectural streetwear engineered to outlast trends.
          </p>
          <p>
            Rooted in cyber-sigilism, gothic architecture, and raw industrial aesthetics, every single garment is treated as a wearable art piece. From our custom oversized block patterns to 420 GSM dense French Terry knits, we construct clothing that feels like modern armor.
          </p>
        </div>

        {/* Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6">
          <div className="bg-rage-900 border border-rage-800 p-6 space-y-3">
            <Feather className="w-6 h-6 text-white" />
            <h3 className="text-xs font-black uppercase tracking-widest text-white">420 GSM Terry</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Unrivaled structural drape and longevity. Our fabrics are custom knit in Tirupur from 100% combed long-staple Indian cotton.
            </p>
          </div>

          <div className="bg-rage-900 border border-rage-800 p-6 space-y-3">
            <Sparkles className="w-6 h-6 text-white" />
            <h3 className="text-xs font-black uppercase tracking-widest text-white">Zero Compromise</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Custom heavy gunmetal zippers, reinforced double-needle seams, and screenprints that never peel or crack over time.
            </p>
          </div>

          <div className="bg-rage-900 border border-rage-800 p-6 space-y-3">
            <Shield className="w-6 h-6 text-white" />
            <h3 className="text-xs font-black uppercase tracking-widest text-white">Homegrown Pride</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Every garment honors India's deep textile legacy. Ethical labor, living wages, and meticulous craft from sketch to finish.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
