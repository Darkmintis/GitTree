import React from 'react';

type IconProps = { size?: number; className?: string; color?: string };

function Icon(props: IconProps, children: React.ReactNode, viewBox = '0 0 24 24') {
  return (
    <svg width={props.size || 16} height={props.size || 16} viewBox={viewBox} fill="none" stroke={props.color || 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={props.className}>
      {children}
    </svg>
  );
}

const p = (d: string, extra?: Record<string, string>) => <path key={d} d={d} {...(extra || {})} />;

export const TreeIcon = (props: IconProps) => Icon(props, <>
  {p('M12 3v18')}
  {p('M8 9c-2 0-4 2-4 4s2 4 4 4')}
  {p('M16 9c2 0 4 2 4 4s-2 4-4 4')}
  {p('M12 11c-1.5 0-3 1.5-3 3s1.5 3 3 3 3-1.5 3-3-1.5-3-3-3z')}
  {p('M10 16l-3 3')}
  {p('M14 16l3 3')}
</>);

export const CommitIcon = (props: IconProps) => Icon(props, <>
  {p('M4 19.5A2.5 2.5 0 0 1 6.5 17H20')}
  {p('M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z')}
  {p('M8 7h8')}
  {p('M8 11h6')}
</>);

export const BranchIcon = (props: IconProps) => Icon(props, <>
  {p('M6 3v12')}
  {p('M6 15a3 3 0 1 0 0 6 3 3 0 0 0 0-6z')}
  {p('M18 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6z')}
  {p('M6 3a3 3 0 0 1 3 3v6a3 3 0 0 0 3 3h6')}
</>);

export const PeopleIcon = (props: IconProps) => Icon(props, <>
  {p('M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2')}
  {p('M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8z')}
  {p('M23 21v-2a4 4 0 0 0-3-3.87')}
  {p('M16 3.13a4 4 0 0 1 0 7.75')}
</>);

export const ChartIcon = (props: IconProps) => Icon(props, <>
  {p('M18 20V10')}
  {p('M12 20V4')}
  {p('M6 20v-6')}
  {p('M2 20h20')}
</>);

export const LeafIcon = (props: IconProps) => Icon(props, <>
  {p('M11 20A7 7 0 0 1 9.8 6.9C15.5 4.9 17 3.5 19 2c1 2 2 4.5 2 8 0 5.5-4.78 10-10 10z')}
  {p('M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12')}
</>);

export const ForkIcon = (props: IconProps) => Icon(props, <>
  {p('M8 3a3 3 0 1 0 0 6 3 3 0 0 0 0-6z')}
  {p('M16 3a3 3 0 1 0 0 6 3 3 0 0 0 0-6z')}
  {p('M8 9v1a3 3 0 0 0 3 3h2a3 3 0 0 0 3-3V9')}
  {p('M11 21v-8')}
</>);

export const PlayIcon = (props: IconProps) => Icon(props, <>{p('M5 3l14 9-14 9V3z')}</>);
export const PauseIcon = (props: IconProps) => Icon(props, <>{p('M6 4h4v16H6z')}{p('M14 4h4v16h-4z')}</>);
export const SkipBackIcon = (props: IconProps) => Icon(props, <>{p('M19 20L9 12l10-8v16z')}{p('M5 19V5')}</>);
export const SkipForwardIcon = (props: IconProps) => Icon(props, <>{p('M5 4l10 8-10 8V4z')}{p('M19 5v14')}</>);

export const SearchIcon = (props: IconProps) => Icon(props, <>
  {p('M10 3a7 7 0 1 0 0 14 7 7 0 0 0 0-14z')}
  {p('M21 21l-6-6')}
</>);

export const SunIcon = (props: IconProps) => Icon(props, <>
  {p('M12 1v2')}{p('M12 21v2')}
  {p('M4.22 4.22l1.42 1.42')}{p('M18.36 18.36l1.42 1.42')}
  {p('M1 12h2')}{p('M21 12h2')}
  {p('M4.22 19.78l1.42-1.42')}{p('M18.36 5.64l1.42-1.42')}
  {p('M12 6a6 6 0 1 0 0 12 6 6 0 0 0 0-12z')}
</>);

export const MoonIcon = (props: IconProps) => Icon(props, <>{p('M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z')}</>);

export const MergeIcon = (props: IconProps) => Icon(props, <>
  {p('M8 3a3 3 0 1 0 0 6 3 3 0 0 0 0-6z')}
  {p('M16 15a3 3 0 1 0 0 6 3 3 0 0 0 0-6z')}
  {p('M8 9v6')}
  {p('M8 11c0-2 2-4 5-4h3')}
  {p('M16 11l-2-2 2-2')}
</>);

export const CopyIcon = (props: IconProps) => Icon(props, <>
  {p('M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2')}
  {p('M15 2H9a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1z')}
</>);

export const ExternalLinkIcon = (props: IconProps) => Icon(props, <>
  {p('M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6')}
  {p('M15 3h6v6')}
  {p('M10 14L21 3')}
</>);

export const CloseIcon = (props: IconProps) => Icon(props, <>
  {p('M18 6L6 18')}
  {p('M6 6l12 12')}
</>);

export const MinusIcon = (props: IconProps) => Icon(props, <>{p('M5 12h14')}</>);
export const PlusIcon = (props: IconProps) => Icon(props, <>{p('M12 5v14')}{p('M5 12h14')}</>);

export const ResetIcon = (props: IconProps) => Icon(props, <>
  {p('M1 4v6h6')}
  {p('M3.51 15a9 9 0 1 0 2.13-9.36L1 10')}
</>);

export const CameraIcon = (props: IconProps) => Icon(props, <>
  {p('M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z')}
  {p('M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8z')}
</>);

export const ClockIcon = (props: IconProps) => Icon(props, <>
  {p('M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z')}
  {p('M12 6v6l4 2')}
</>);

export const TagIcon = (props: IconProps) => Icon(props, <>
  {p('M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z')}
  {p('M7 7h.01')}
</>);

export const HeartIcon = (props: IconProps) => Icon(props, <>
  {p('M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z')}
</>);

export const ActivityIcon = (props: IconProps) => Icon(props, <>
  {p('M22 12h-4l-3 9L9 3l-3 9H2')}
</>);
