import React from 'react';

export default function Logo({ compact = false }) {
  return <div className="brand">
    <div className="image-placeholder cat-logo" aria-label="logo PurrStudy">
      <img src="/favicon.ico" alt="logo do PurrStudy com o desenho de um gatinho" />
    </div>
    <div>
      <div className="brand-name">PurrStudy</div>
      {!compact && <div className="brand-tagline">Pequenos focos, grandes conquistas ♡</div>}
    </div>
  </div>;
}