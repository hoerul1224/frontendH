// src/components/WorkStatusMultiSelect.jsx
// Dropdown filter yang bisa memilih lebih dari 1 kategori status pekerja sekaligus
// (mis. PWTT + PWT bersamaan), dipakai di McuHealthCharts.jsx dan
// McuCurrentStatusCharts.jsx.

import { useEffect, useRef, useState } from 'react';

export default function WorkStatusMultiSelect({
  options,
  selected,
  onChange,
  placeholder = 'Semua Status Pekerja',
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () =>
      document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleOption = (option) => {
    if (selected.includes(option)) {
      onChange(selected.filter((item) => item !== option));
    } else {
      onChange([...selected, option]);
    }
  };

  const clearAll = () => onChange([]);

  const buttonLabel =
    selected.length === 0
      ? placeholder
      : selected.length <= 2
      ? selected.join(', ')
      : `${selected.length} status dipilih`;

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        style={{
          padding: '8px 14px',
          borderRadius: 8,
          border: 'none',
          background: '#0f2d7a',
          color: '#cfe0ff',
          fontSize: 13,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          minWidth: 180,
          justifyContent: 'space-between',
        }}
      >
        <span
          style={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {buttonLabel}
        </span>
        <span style={{ fontSize: 10 }}>{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            right: 0,
            zIndex: 20,
            background: '#0f2d7a',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: 8,
            padding: 8,
            minWidth: 220,
            boxShadow: '0 8px 20px rgba(0,0,0,0.35)',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 6,
              paddingBottom: 6,
              borderBottom: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <span style={{ color: '#8ecbff', fontSize: 11 }}>
              Pilih status pekerja
            </span>
            <button
              type="button"
              onClick={clearAll}
              style={{
                background: 'none',
                border: 'none',
                color: '#f59e0b',
                fontSize: 11,
                cursor: 'pointer',
                padding: 0,
              }}
            >
              Reset
            </button>
          </div>

          {options.map((option) => (
            <label
              key={option}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '6px 4px',
                color: '#cfe0ff',
                fontSize: 13,
                cursor: 'pointer',
              }}
            >
              <input
                type="checkbox"
                checked={selected.includes(option)}
                onChange={() => toggleOption(option)}
              />
              {option}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}