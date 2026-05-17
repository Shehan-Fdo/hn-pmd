import React, { useState } from 'react';
import { Plus, Trash2, Sliders } from 'lucide-react';
import type { WCAttribute } from '../lib/api';

interface AttributeManagerProps {
  attributes: WCAttribute[];
  onChange: (attributes: WCAttribute[]) => void;
}

export const AttributeManager: React.FC<AttributeManagerProps> = ({ attributes, onChange }) => {
  const [attrName, setAttrName] = useState('');
  const [attrOptions, setAttrOptions] = useState('');

  const addAttribute = () => {
    if (!attrName.trim() || !attrOptions.trim()) return;
    
    const optionsArray = attrOptions
      .split(',')
      .map((opt) => opt.trim())
      .filter((opt) => opt.length > 0);

    const newAttribute: WCAttribute = {
      name: attrName.trim(),
      options: optionsArray,
      visible: true,
      variation: false,
    };

    onChange([...attributes, newAttribute]);
    setAttrName('');
    setAttrOptions('');
  };

  const removeAttribute = (index: number) => {
    const nextAttributes = [...attributes];
    nextAttributes.splice(index, 1);
    onChange(nextAttributes);
  };

  const toggleBoolean = (index: number, key: 'visible' | 'variation') => {
    const nextAttributes = [...attributes];
    nextAttributes[index] = {
      ...nextAttributes[index],
      [key]: !nextAttributes[index][key],
    };
    onChange(nextAttributes);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={attrName}
          onChange={(e) => setAttrName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addAttribute();
            }
          }}
          placeholder="Attribute Name (e.g. Size, Color)"
          className="flex-1 glass-input text-sm"
        />
        <input
          type="text"
          value={attrOptions}
          onChange={(e) => setAttrOptions(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addAttribute();
            }
          }}
          placeholder="Options (separated by commas, e.g. S, M, L)"
          className="flex-1 glass-input text-sm"
        />
        <button
          type="button"
          onClick={addAttribute}
          className="btn-primary py-2 px-4 text-sm flex items-center justify-center gap-1.5 shrink-0"
        >
          <Plus size={16} />
          <span>Add</span>
        </button>
      </div>

      {attributes.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-slate-700 tracking-wider uppercase mb-3 flex items-center gap-1.5">
            <Sliders size={12} className="text-slate-800" />
            Configured Attributes
          </h4>

          <div className="space-y-2.5">
            {attributes.map((attr, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all duration-300 shadow-2xs"
              >
                <div>
                  <h5 className="text-sm font-bold text-slate-800">{attr.name}</h5>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {attr.options.map((opt, oIdx) => (
                      <span
                        key={oIdx}
                        className="text-[10px] bg-white text-slate-650 border border-slate-200 px-2 py-0.5 rounded-md font-medium shadow-2xs"
                      >
                        {opt}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 pt-3 md:pt-0 border-slate-200">
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={attr.visible}
                        onChange={() => toggleBoolean(idx, 'visible')}
                        className="w-4 h-4 rounded text-slate-900 focus:ring-0 focus:ring-offset-0 bg-white border-slate-350 cursor-pointer"
                      />
                      <span className="text-xs text-slate-500 font-medium">Visible</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={attr.variation}
                        onChange={() => toggleBoolean(idx, 'variation')}
                        className="w-4 h-4 rounded text-slate-900 focus:ring-0 focus:ring-offset-0 bg-white border-slate-350 cursor-pointer"
                      />
                      <span className="text-xs text-slate-500 font-medium">Use for variations</span>
                    </label>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeAttribute(idx)}
                    className="p-2 rounded-lg text-rose-600 hover:text-rose-750 hover:bg-rose-50 transition-all duration-200 shadow-2xs bg-white border border-slate-200 cursor-pointer"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
