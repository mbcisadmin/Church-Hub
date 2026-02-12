export default function ChurchLogo({
  className,
  hoverGradient = false,
}: {
  className?: string;
  hoverGradient?: boolean;
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 26.3 26.3"
      className={[className, hoverGradient && 'logo-gradient-hover'].filter(Boolean).join(' ')}
      aria-hidden="true"
    >
      {hoverGradient && (
        <defs>
          <linearGradient id="logo-hover-gradient" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0%" stopColor="var(--brand-primary)" />
            <stop offset="100%" stopColor="#1272a0" />
          </linearGradient>
        </defs>
      )}
      {/* Base layer — currentColor */}
      <g className={hoverGradient ? 'logo-base' : undefined}>
        <path
          d="M82.65,270.8A13.15,13.15,0,1,0,95.8,283.95,13.151,13.151,0,0,0,82.65,270.8Zm0,24.295a11.107,11.107,0,1,1,11.107-11.107A11.114,11.114,0,0,1,82.65,295.095Z"
          transform="translate(-69.5 -270.8)"
          fill="currentColor"
        />
        <path
          d="M87.239,278.2a10.439,10.439,0,1,0,10.439,10.439A10.448,10.448,0,0,0,87.239,278.2Zm-.409,18.24c-1.746-4.458-3.046-5.684-7.5-7.43h7.541Zm-7.541-8.173c4.458-1.783,5.758-2.972,7.5-7.43v7.43Zm8.358,0v-7.43c1.746,4.458,3.046,5.684,7.5,7.43Z"
          transform="translate(-74.088 -275.451)"
          fill="currentColor"
        />
      </g>
      {/* Gradient layer — fades in on hover */}
      {hoverGradient && (
        <g className="logo-grad">
          {/* White fill behind gradient to cover center gaps between star arms */}
          <circle cx="13.15" cy="13.19" r="10" fill="white" />
          <path
            d="M82.65,270.8A13.15,13.15,0,1,0,95.8,283.95,13.151,13.151,0,0,0,82.65,270.8Zm0,24.295a11.107,11.107,0,1,1,11.107-11.107A11.114,11.114,0,0,1,82.65,295.095Z"
            transform="translate(-69.5 -270.8)"
            fill="url(#logo-hover-gradient)"
          />
          <path
            d="M87.239,278.2a10.439,10.439,0,1,0,10.439,10.439A10.448,10.448,0,0,0,87.239,278.2Zm-.409,18.24c-1.746-4.458-3.046-5.684-7.5-7.43h7.541Zm-7.541-8.173c4.458-1.783,5.758-2.972,7.5-7.43v7.43Zm8.358,0v-7.43c1.746,4.458,3.046,5.684,7.5,7.43Z"
            transform="translate(-74.088 -275.451)"
            fill="url(#logo-hover-gradient)"
          />
        </g>
      )}
    </svg>
  );
}
