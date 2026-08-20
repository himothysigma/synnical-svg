/**
 * Avatar Decorations & Profile Effects
 * 
 * #31 - Avatar decorations implementation
 * - Discord-like decorations (not just plain circle)
 * - Price: 1000 credits each
 * - Staff have access to all decorations
 * - Preview in Shop
 * - Preview before equipping on profile
 */

'use client';

import { useState } from 'react';
import { Check, Star, Lock, Sparkles, Crown, Flame, Heart, Zap, Snowflake, Rainbow, Gem } from 'lucide-react';

export interface AvatarDecoration {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  price: number; // In credits
  category: 'frame' | 'effect' | 'badge' | 'special';
  rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'staff_only';
  animated?: boolean;
  cssClass?: string; // CSS class to apply when equipped
  previewStyle?: React.CSSProperties; // For inline preview
}

// Available decorations catalog
export const DECORATIONS_CATALOG: AvatarDecoration[] = [
  // Frames (border effects)
  {
    id: 'frame-rainbow',
    name: 'Rainbow Frame',
    description: 'A shimmering rainbow border around your avatar',
    icon: <Rainbow className="w-6 h-6" />,
    price: 1000,
    category: 'frame',
    rarity: 'rare',
    animated: true,
    previewStyle: {
      boxShadow: '0 0 15px linear-gradient(90deg, red, orange, yellow, green, blue, purple)',
      borderRadius: '50%',
      padding: '3px',
      background: 'linear-gradient(45deg, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #8b00ff)',
    },
  },
  {
    id: 'frame-gold',
    name: 'Golden Frame',
    description: 'Elegant gold border for distinguished users',
    icon: <Crown className="w-6 h-6" />,
    price: 1500,
    category: 'frame',
    rarity: 'epic',
    previewStyle: {
      boxShadow: '0 0 20px rgba(255, 215, 0, 0.6), inset 0 0 10px rgba(255, 215, 0, 0.2)',
      borderRadius: '50%',
      border: '3px solid gold',
    },
  },
  {
    id: 'frame-ice',
    name: 'Frost Frame',
    description: 'Cool icy border with subtle glow',
    icon: <Snowflake className="w-6 h-6" />,
    price: 800,
    category: 'frame',
    rarity: 'rare',
    previewStyle: {
      boxShadow: '0 0 15px rgba(135, 206, 250, 0.5), inset 0 0 10px rgba(135, 206, 250, 0.1)',
      borderRadius: '50%',
      border: '2px solid #87CEEB',
    },
  },

  // Effects (animated overlays)
  {
    id: 'effect-sparkle',
    name: 'Sparkles',
    description: 'Twinkling sparkles around your avatar',
    icon: <Sparkles className="w-6 h-6" />,
    price: 500,
    category: 'effect',
    rarity: 'common',
    animated: true,
  },
  {
    id: 'effect-flame',
    name: 'Flame Aura',
    description: 'Burning flames surrounding your avatar',
    icon: <Flame className="w-6 h-6" />,
    price: 1200,
    category: 'effect',
    rarity: 'epic',
    animated: true,
  },
  {
    id: 'effect-zap',
    name: 'Electric Pulse',
    description: 'Crackling electricity effect',
    icon: <Zap className="w-6 h-6" />,
    price: 1000,
    category: 'effect',
    rarity: 'rare',
    active: true,
  },
  {
    id: 'effect-hearts',
    name: 'Heart Aura',
    description: 'Floating hearts around your avatar',
    icon: <Heart className="w-6 h-6" />,
    price: 750,
    category: 'effect',
    rarity: 'rare',
    animated: true,
  },

  // Badges (corner indicators)
  {
    id: 'badge-verified',
    name: 'Verified Badge',
    description: 'Blue checkmark verification badge',
    icon: <Check className="w-6 h-6" />,
    price: 2000,
    category: 'badge',
    rarity: 'legendary',
  },
  {
    id: 'badge-gem',
    name: 'Gem Badge',
    description: 'Shining gem indicator',
    icon: <Gem className="w-6 h-6" />,
    price: 2500,
    category: 'badge',
    rarity: 'legendary',
    animated: true,
  },

  // Staff-only (free for staff)
  {
    id: 'staff-crown',
    name: "Staff Crown",
    description: 'Exclusive crown for staff members',
    icon: <Star className="w-6 h-6" />,
    price: 0,
    category: 'special',
    rarity: 'staff_only',
  },
];

// Rarity colors and styling
export const RARITY_STYLES = {
  common: {
    color: '#9CA3AF', // gray-400
    bg: 'bg-gray-500/10',
    border: 'border-gray-500/30',
    label: 'Common',
  },
  rare: {
    color: '#3B82F6', // blue-500
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    label: 'Rare',
  },
  epic: {
    color: '#A855F7', // purple-500
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/30',
    label: 'Epic',
  },
  legendary: {
    color: '#F59E0B', // amber-500
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    label: 'Legendary',
  },
  staff_only: {
    color: '#EF4444', // red-500
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
    label: 'Staff',
  },
};

interface DecorationShopProps {
  userCredits: number;
  isStaff?: boolean;
  ownedDecorations: string[];
  equippedDecoration?: string;
  onPurchase: (decorationId: string, price: number) => Promise<boolean>;
  onEquip: (decorationId: string) => void;
}

/**
 * Decoration Shop Component
 * Browse, preview, purchase, and equip decorations
 */
export function DecorationShop({
  userCredits,
  isStaff = false,
  ownedDecorations = [],
  equippedDecoration,
  onPurchase,
  onEquip,
}: DecorationShopProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [purchasingId, setPurchasingId] = useState<string | null>(null);

  const categories = ['all', 'frame', 'effect', 'badge', 'special'];

  const filteredDecorations = DECORATIONS_CATALOG.filter(d => {
    // Filter by category
    if (selectedCategory !== 'all' && d.category !== selectedCategory) return false;
    
    // Staff-only items only visible to staff (or show locked?)
    if (d.rarity === 'staff_only' && !isStaff) return false; // Hide from non-staff
    
    return true;
  });

  const handlePurchase = async (decoration: AvatarDecoration) => {
    if (purchasingId) return;
    
    setPurchasingId(decoration.id);
    
    // Staff get free decorations
    if (isStaff && decoration.rarity === 'staff_only') {
      onEquip(decoration.id);
      setPurchasingId(null);
      return;
    }

    const success = await onPurchase(decoration.id, decoration.price);
    
    if (success) {
      console.log(`[Shop] Purchased ${decoration.name}`);
    }
    
    setPurchasingId(null);
  };

  const isOwned = (id: string) => ownedDecorations.includes(id);
  const isEquipped = (id: string) => equippedDecoration === id;

  return (
    <div className="space-y-4">
      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
              selectedCategory === cat
                ? 'bg-pink-500/20 text-pink-400'
                : 'bg-white/5 text-white/60 hover:bg-white/10'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Credits Display */}
      <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
        <span className="text-sm text-white/60">Your Credits</span>
        <span className="text-lg font-bold text-yellow-400">{userCredits.toLocaleString()}</span>
      </div>

      {/* Decorations Grid */}
      <div className="grid grid-cols-2 gap-3 max-h-[50vh] overflow-y-auto pr-1">
        {filteredDecorations.map(decoration => {
          const rarity = RARITY_STYLES[decoration.rarity];
          const owned = isOwned(decoration.id);
          const equipped = isEquipped(decoration.id);
          const canAfford = userCredits >= decoration.price || isStaff;

          return (
            <div
              key={decoration.id}
              className={`relative p-4 rounded-xl border transition-all cursor-pointer group ${
                equipped
                  ? 'border-pink-500 bg-pink-500/10'
                  : `border-white/10 hover:border-white/20 ${rarity.bg}`
              }`}
              onMouseEnter={() => setPreviewId(decoration.id)}
              onMouseLeave={() => setPreviewId(null)}
            >
              {/* Equipped badge */}
              {equipped && (
                <div className="absolute top-2 right-2 px-2 py-0.5 bg-pink-500 text-white text-[10px] font-medium rounded-full flex items-center gap-1">
                  <Check className="w-3 h-3" /> Equipped
                </div>
              )}

              {/* Rarity label */}
              <span 
                className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                style={{ color: rarity.color }}
              >
                {rarity.label}
              </span>

              {/* Icon Preview */}
              <div 
                className="w-16 h-16 mx-auto my-3 rounded-full flex items-center justify-center relative"
                style={{
                  ...decoration.previewStyle,
                  background: decoration.previewStyle?.background || 'rgba(255,255,255,0.05)',
                }}
              >
                <div 
                  className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl"
                >
                  U
                </div>
                {decoration.animated && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center">
                    <Sparkles className="w-2.5 h-2.5 text-black" />
                  </span>
                )}
              </div>

              {/* Info */}
              <h4 className="text-sm font-medium text-white text-center">{decoration.name}</h4>
              <p className="text-[10px] text-white/40 text-center line-clamp-2 mt-1">{decoration.description}</p>

              {/* Action Button */}
              {equipped ? (
                <button
                  onClick={() => onEquip('')} // Unequip
                  className="mt-3 w-full py-2 bg-white/5 text-white/40 text-xs rounded-lg hover:bg-white/10 transition-colors"
                >
                  Unequip
                </button>
              ) : owned ? (
                <button
                  onClick={() => onEquip(decoration.id)}
                  className="mt-3 w-full py-2 bg-pink-500/20 text-pink-400 text-xs rounded-lg hover:bg-pink-500/30 transition-colors"
                >
                  Equip
                </button>
              ) : (
                <button
                  onClick={() => handlePurchase(decoration)}
                  disabled={!canAfford || purchasingId === decoration.id}
                  className={`mt-3 w-full py-2 text-xs rounded-lg transition-colors flex items-center justify-center gap-1 ${
                    canAfford
                      ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30'
                      : 'bg-white/5 text-white/20 cursor-not-allowed'
                  }`}
                >
                  {purchasingId === decoration.id ? (
                    <span>...</span>
                  ) : (
                    <>
                      <Gem className="w-3 h-3" />
                      {isStaff && decoration.price === 0 ? 'Free' : `${decoration.price}`}
                    </>
                  )}
                </button>
              )}

              {/* Locked indicator */}
              {!canAfford && !owned && !isStaff && (
                <div className="absolute inset-0 bg-black/40 rounded-xl flex items-center justify-center">
                  <Lock className="w-6 h-6 text-white/40" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Large Preview */}
      {previewId && (
        <div className="fixed bottom-4 right-4 p-4 bg-black/80 backdrop-blur-xl rounded-2xl border border-white/10 z-50">
          <p className="text-xs text-white/40 mb-2">Preview</p>
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold relative">
            U
            {DECORATIONS_CATALOG.find(d => d.id === previewId)?.previewStyle && (
              <div 
                className="absolute inset-0 rounded-full"
                style={DECORATIONS_CATALOG.find(d => d.id === previewId)?.previewStyle}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
