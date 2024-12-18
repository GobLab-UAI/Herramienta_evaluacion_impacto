import React from 'react';

interface ThermometerProps {
  score: number;
  minScore: number;
  maxScore: number;
  dimensions: Record<string, number>;
}

export const Thermometer: React.FC<ThermometerProps> = ({ score, minScore, maxScore, dimensions }) => {
  const percentage = ((score - minScore) / (maxScore - minScore)) * 100;
  const level = score <= 45.54 ? 1 : score <= 72.77 ? 2 : 3;

  return (
    <div className="relative w-8 h-60 bg-gray-200 rounded-full overflow-hidden">
      <div
        className="absolute bottom-0 w-full bg-red-500 transition-all duration-500 ease-out"
        style={{ height: `${percentage}%` }}
      />
      {[1, 2, 3].map((section) => (
        <div
          key={section}
          className={`absolute w-full ${
            section === 1 ? 'h-[27.22%]' : section === 2 ? 'h-[27.23%]' : 'h-[45.55%]'
          } border-t border-gray-400 ${
            section <= level ? 'bg-yellow-200 bg-opacity-50' : ''
          }`}
          style={{ bottom: `${section === 1 ? 0 : section === 2 ? '27.22%' : '54.45%'}` }}
        />
      ))}
      {Object.entries(dimensions).map(([dimension, dimensionScore]) => {
        const dimensionPercentage = ((dimensionScore - minScore / dimensions.length) / (maxScore / dimensions.length - minScore / dimensions.length)) * 100;
        return (
          <div
            key={dimension}
            className={`absolute left-full ml-2 text-xs ${
              dimensionScore > 5.5 ? 'font-bold text-yellow-500' : ''
            }`}
            style={{ bottom: `${dimensionPercentage}%`, fontSize: '0.6rem' }}
          >
            {dimension.slice(0, 3)}: {dimensionScore.toFixed(1)}
          </div>
        );
      })}
    </div>
  );
};
