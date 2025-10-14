'use client';

import React from 'react';

interface MnemonicDisplayProps {
  mnemonicString: string; // space-separated 24 words
}

const MnemonicDisplay: React.FC<MnemonicDisplayProps> = ({ mnemonicString }) => {
  const mnemonic = mnemonicString.split(" ").map(word => word.trim());

  if (mnemonic.length !== 24) {
    throw new Error("Mnemonic must have 24 words");
  }

  const firstColumn = mnemonic.slice(0, 12);
  const secondColumn = mnemonic.slice(12, 24);

  return (
    <div style={{ display: 'flex', gap: 16, marginTop: 20, flexWrap: 'wrap', justifyContent: 'center' }}>
      {[firstColumn, secondColumn].map((column, colIndex) => (
        <div key={colIndex} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {column.map((word, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                alignItems: 'center',
                border: '2px solid #121212',
                borderRadius: 12,
                padding: '8px 12px',
                minWidth: 100,
                textAlign: 'left',
                fontWeight: 500,
                color: '#FFF',
                backgroundColor: '#1A1A1A',
              }}
            >
            {/* Serial number - non-selectable */}
            <span
              style={{
                fontWeight: 'bold',
                marginRight: 8,
                color: '#a1a1a1',
                userSelect: 'none', // prevents copying
                flexShrink: 0,      // always stays left
              }}
            >
            {colIndex * 12 + index + 1}.
            </span>

            {/* Word - selectable */}
            <span style={{ userSelect: 'text' }}>{word}</span>
          </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default MnemonicDisplay;
