'use client'

import React, { useEffect, useRef } from 'react';

interface DoodleArrowProps {
  className?: string;
}

const DoodleArrow: React.FC<DoodleArrowProps> = ({ className }) => {
  const pathRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    if (pathRef.current) {
      const length = pathRef.current.getTotalLength();
      pathRef.current.style.strokeDasharray = `${length}`;
      pathRef.current.style.strokeDashoffset = `${length}`;
      pathRef.current.style.animation = 'drawArrow 5s ease-in-out infinite';
    }
  }, []);

  return (
    <svg
      className={`${className} text-green-500 opacity-70 -z-10`}
      width="256"
      height="256"
      viewBox="0 0 90 90"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        ref={pathRef}
        d="M16.667 0.011c0.037 0.004 0.072 0.014 0.108 0.022C17.247 0.113 17.612 0.505 17.612 1v9.931c0 0.553-0.447 1-1 1s-1-0.447-1-1V3.076C10.111 7.853 6.563 14.378 5.566 21.663c-1.09 7.952 0.986 15.859 5.841 22.254c4.154 5.473 9.92 9.281 16.481 10.948c0.041-0.421 0.091-0.843 0.148-1.264c1.161-8.485 5.558-16.009 12.38-21.188c9.987-7.582 17.714-6.48 21.295-3.233c3.588 3.254 3.748 8.866 0.406 14.297c-1.684 2.737-4.168 5.361-7.381 7.8c-6.821 5.179-15.25 7.39-23.735 6.229c-0.422-0.058-0.841-0.124-1.258-0.197c-0.179 6.757 1.96 13.345 6.115 18.818c10.023 13.203 28.918 15.79 42.121 5.768c3.016-2.289 5.332-4.731 6.886-7.256c0.289-0.471 0.905-0.617 1.376-0.328c0.471 0.29 0.618 0.907 0.328 1.376c-1.684 2.737-4.167 5.362-7.381 7.801c-14.081 10.69-34.233 7.93-44.924-6.151c-4.508-5.937-6.763-13.087-6.511-20.443c-7.149-1.729-13.433-5.829-17.94-11.766c-4.277-5.634-6.53-12.366-6.53-19.32c0-1.464 0.1-2.94 0.302-4.416C4.619 13.84 8.22 7.054 13.807 2H6.681c-0.553 0-1-0.447-1-1s0.447-1 1-1h9.931C16.631 0 16.647 0.01 16.667 0.011zM31.272 55.524c7.955 1.09 15.859-0.985 22.254-5.84c3.016-2.289 5.332-4.73 6.887-7.256c1.421-2.308 2.13-4.583 2.13-6.608c0-2.048-0.726-3.842-2.177-5.157c-3.251-2.95-10.308-3.059-18.742 3.344c-6.396 4.855-10.518 11.91-11.607 19.865c-0.065 0.475-0.119 0.949-0.161 1.424C30.325 55.383 30.797 55.459 31.272 55.524z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default DoodleArrow;