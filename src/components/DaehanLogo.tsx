import React from 'react';

interface DaehanLogoProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
  color?: string;
}

export const DaehanLogo: React.FC<DaehanLogoProps> = ({
  size,
  color = '#0025d6',
  className = '',
  style,
  ...props
}) => {
  const stripeXCoords = [28, 32, 36, 40, 44, 48, 52, 56, 60, 64, 68, 72];

  return (
    <svg
      viewBox="0 0 120 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{
        width: size || (style?.width ?? '100%'),
        height: size || (style?.height ?? '100%'),
        display: 'inline-block',
        verticalAlign: 'middle',
        ...style,
      }}
      {...props}
    >
      <defs>
        {/* Clip path for the upper-left Taegeuk lobe where stripes reside */}
        <clipPath id="daehan-taegeuk-lobe">
          <path d="M 60 14 A 18 18 0 0 1 60 50 A 18 18 0 0 0 60 86 A 36 36 0 0 1 60 14 Z" />
        </clipPath>
      </defs>

      {/* Vertical hatching/stripes inside upper-left lobe */}
      <g clipPath="url(#daehan-taegeuk-lobe)">
        {stripeXCoords.map((x) => (
          <line
            key={x}
            x1={x}
            y1={10}
            x2={x}
            y2={90}
            stroke={color}
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        ))}
      </g>

      {/* S-shaped Taegeuk divider curve */}
      <path
        d="M 60 14 A 18 18 0 0 1 60 50 A 18 18 0 0 0 60 86"
        fill="none"
        stroke={color}
        strokeWidth="3.6"
        strokeLinecap="round"
      />

      {/* Central Circle */}
      <circle
        cx="60"
        cy="50"
        r="36"
        fill="none"
        stroke={color}
        strokeWidth="4"
      />

      {/* Outer Orbit Ellipse */}
      <ellipse
        cx="60"
        cy="50"
        rx="54"
        ry="26"
        fill="none"
        stroke={color}
        strokeWidth="4"
      />
    </svg>
  );
};
