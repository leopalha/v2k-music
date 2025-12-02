import { cn } from "@/lib/utils/cn";

interface LogoProps {
  className?: string;
  width?: number;
  height?: number;
}

export function Logo({
  className,
  width = 120,
  height = 40,
}: LogoProps) {
  return (
    <svg
      viewBox="0 0 200 80"
      className={cn("object-contain", className)}
      width={width}
      height={height}
    >
      <g transform="translate(7, 5) scale(1.5)">
        {/* Network connections */}
        <line x1="15" y1="12" x2="25" y2="22" stroke="#1A89FF" strokeWidth="1.2" opacity="0.5"/>
        <line x1="35" y1="12" x2="25" y2="22" stroke="#1A89FF" strokeWidth="1.2" opacity="0.5"/>
        <line x1="15" y1="32" x2="25" y2="22" stroke="#FF1AA3" strokeWidth="1.2" opacity="0.5"/>
        <line x1="35" y1="32" x2="25" y2="22" stroke="#FF1AA3" strokeWidth="1.2" opacity="0.5"/>
        <line x1="15" y1="12" x2="15" y2="32" stroke="#8C1AFF" strokeWidth="1.2" opacity="0.4"/>
        <line x1="35" y1="12" x2="35" y2="32" stroke="#8C1AFF" strokeWidth="1.2" opacity="0.4"/>
        {/* Nodes */}
        <circle cx="15" cy="12" r="3.5" fill="#1A89FF"/>
        <circle cx="35" cy="12" r="3.5" fill="#1A89FF"/>
        <circle cx="15" cy="32" r="3.5" fill="#FF1AA3"/>
        <circle cx="35" cy="32" r="3.5" fill="#FF1AA3"/>
        <circle cx="25" cy="22" r="4.5" fill="#8C1AFF"/>
      </g>
      <text x="115" y="42" textAnchor="middle" fontFamily="Plus Jakarta Sans, sans-serif" fontSize="32" fontWeight="800" fill="#E5E5E5">V2K</text>
      <text x="79" y="57" textAnchor="start" fontFamily="Inter, sans-serif" fontSize="9" fontWeight="400" fill="#737373" letterSpacing="10.5">MUSIC</text>
    </svg>
  );
}
