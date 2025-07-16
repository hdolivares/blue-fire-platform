'use client';

import { useState } from 'react';
import { updateGradientColors, getCurrentGradientColors, gradientPresets, forceGradientReinitialize } from '@/lib/gradient-utils';

export const GradientColorPicker = () => {
  const [colors, setColors] = useState(getCurrentGradientColors());

  const handleColorChange = (colorKey: keyof typeof colors, value: string) => {
    const newColors = { ...colors, [colorKey]: value };
    setColors(newColors);
    updateGradientColors({ [colorKey]: value });
  };

  const applyPreset = (presetName: string) => {
    const preset = gradientPresets[presetName as keyof typeof gradientPresets];
    if (preset) {
      setColors(preset);
      updateGradientColors(preset);
    }
  };

  const handleForceReinitialize = () => {
    forceGradientReinitialize();
  };

  return (
    <div className="fixed top-4 right-4 bg-black/80 backdrop-blur-sm border border-white/20 rounded-lg p-4 text-white z-50 max-w-sm">
      <h3 className="text-lg font-bold mb-4">Gradient Color Picker</h3>
      
      <div className="space-y-3 mb-4">
        <div>
          <label className="block text-sm font-medium mb-1">Color 1</label>
          <div className="flex gap-2">
            <input
              type="color"
              value={colors.color1}
              onChange={(e) => handleColorChange('color1', e.target.value)}
              className="w-12 h-8 rounded border border-white/20"
            />
            <input
              type="text"
              value={colors.color1}
              onChange={(e) => handleColorChange('color1', e.target.value)}
              className="flex-1 bg-black/50 border border-white/20 rounded px-2 py-1 text-sm"
              placeholder="#667eea"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Color 2</label>
          <div className="flex gap-2">
            <input
              type="color"
              value={colors.color2}
              onChange={(e) => handleColorChange('color2', e.target.value)}
              className="w-12 h-8 rounded border border-white/20"
            />
            <input
              type="text"
              value={colors.color2}
              onChange={(e) => handleColorChange('color2', e.target.value)}
              className="flex-1 bg-black/50 border border-white/20 rounded px-2 py-1 text-sm"
              placeholder="#2487d8"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Color 3</label>
          <div className="flex gap-2">
            <input
              type="color"
              value={colors.color3}
              onChange={(e) => handleColorChange('color3', e.target.value)}
              className="w-12 h-8 rounded border border-white/20"
            />
            <input
              type="text"
              value={colors.color3}
              onChange={(e) => handleColorChange('color3', e.target.value)}
              className="flex-1 bg-black/50 border border-white/20 rounded px-2 py-1 text-sm"
              placeholder="#6659f8"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Color 4</label>
          <div className="flex gap-2">
            <input
              type="color"
              value={colors.color4}
              onChange={(e) => handleColorChange('color4', e.target.value)}
              className="w-12 h-8 rounded border border-white/20"
            />
            <input
              type="text"
              value={colors.color4}
              onChange={(e) => handleColorChange('color4', e.target.value)}
              className="flex-1 bg-black/50 border border-white/20 rounded px-2 py-1 text-sm"
              placeholder="#512494"
            />
          </div>
        </div>
      </div>
      
      <div className="space-y-2 mb-4">
        <h4 className="text-sm font-medium">Presets</h4>
        <div className="grid grid-cols-2 gap-2">
          {Object.keys(gradientPresets).map((presetName) => (
            <button
              key={presetName}
              onClick={() => applyPreset(presetName)}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs font-medium transition-colors"
            >
              {presetName.charAt(0).toUpperCase() + presetName.slice(1)}
            </button>
          ))}
        </div>
      </div>
      
      <div className="space-y-2">
        <button
          onClick={handleForceReinitialize}
          className="w-full px-3 py-2 bg-orange-600 hover:bg-orange-700 rounded text-sm font-medium transition-colors"
        >
          Force Reinitialize
        </button>
      </div>
    </div>
  );
}; 