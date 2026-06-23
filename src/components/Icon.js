// src/components/Icon.js
import React from 'react';
import Svg, { Path, Circle, Line, Polyline, Rect } from 'react-native-svg';

export default function Icon({ name, size = 22, color = '#334155', strokeWidth = 2 }) {
  const p = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: color, strokeWidth, strokeLinecap: 'round', strokeLinejoin: 'round' };

  if (name === 'home') return <Svg {...p}><Path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/><Path d="M9 21V12h6v9"/></Svg>;
  if (name === 'deposit') return <Svg {...p}><Path d="M12 3v14m0 0l-4-4m4 4l4-4"/><Path d="M3 19h18"/></Svg>;
  if (name === 'withdraw') return <Svg {...p}><Path d="M12 21V7m0 0l-4 4m4-4l4 4"/><Path d="M3 5h18"/></Svg>;
  if (name === 'bell') return <Svg {...p}><Path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><Path d="M13.73 21a2 2 0 01-3.46 0"/></Svg>;
  if (name === 'chat') return <Svg {...p}><Path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></Svg>;
  if (name === 'chart') return <Svg {...p}><Path d="M18 20V10"/><Path d="M12 20V4"/><Path d="M6 20v-6"/></Svg>;
  if (name === 'users') return <Svg {...p}><Path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><Circle cx="9" cy="7" r="4"/><Path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></Svg>;
  if (name === 'list') return <Svg {...p}><Line x1="8" y1="6" x2="21" y2="6"/><Line x1="8" y1="12" x2="21" y2="12"/><Line x1="8" y1="18" x2="21" y2="18"/><Circle cx="3.5" cy="6" r="0.8" fill={color}/><Circle cx="3.5" cy="12" r="0.8" fill={color}/><Circle cx="3.5" cy="18" r="0.8" fill={color}/></Svg>;
  if (name === 'settings') return <Svg {...p}><Circle cx="12" cy="12" r="3"/><Path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/></Svg>;
  if (name === 'phone') return <Svg {...p}><Path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.63A2 2 0 012 .92h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></Svg>;
  if (name === 'lock') return <Svg {...p}><Rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><Path d="M7 11V7a5 5 0 0110 0v4"/></Svg>;
  if (name === 'eye') return <Svg {...p}><Path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><Circle cx="12" cy="12" r="3"/></Svg>;
  if (name === 'eyeOff') return <Svg {...p}><Path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><Line x1="1" y1="1" x2="23" y2="23"/></Svg>;
  if (name === 'user') return <Svg {...p}><Path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><Circle cx="12" cy="7" r="4"/></Svg>;
  if (name === 'mail') return <Svg {...p}><Rect x="2" y="4" width="20" height="16" rx="2"/><Polyline points="22,6 12,13 2,6"/></Svg>;
  if (name === 'check') return <Svg {...p} strokeWidth={2.6}><Polyline points="20 6 9 17 4 12"/></Svg>;
  if (name === 'checkCircle') return <Svg {...p}><Path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><Polyline points="22 4 12 14.01 9 11.01"/></Svg>;
  if (name === 'x') return <Svg {...p} strokeWidth={2.6}><Line x1="18" y1="6" x2="6" y2="18"/><Line x1="6" y1="6" x2="18" y2="18"/></Svg>;
  if (name === 'xCircle') return <Svg {...p}><Circle cx="12" cy="12" r="10"/><Line x1="15" y1="9" x2="9" y2="15"/><Line x1="9" y1="9" x2="15" y2="15"/></Svg>;
  if (name === 'chevronRight') return <Svg {...p}><Polyline points="9 18 15 12 9 6"/></Svg>;
  if (name === 'chevronLeft') return <Svg {...p}><Polyline points="15 18 9 12 15 6"/></Svg>;
  if (name === 'send') return <Svg {...p}><Line x1="22" y1="2" x2="11" y2="13"/><Path d="M22 2L15 22L11 13L2 9Z"/></Svg>;
  if (name === 'upload') return <Svg {...p}><Polyline points="16 16 12 12 8 16"/><Line x1="12" y1="12" x2="12" y2="21"/><Path d="M20.39 18.39A5 5 0 0018 9h-1.26A8 8 0 103 16.3"/></Svg>;
  if (name === 'search') return <Svg {...p}><Circle cx="11" cy="11" r="8"/><Line x1="21" y1="21" x2="16.65" y2="16.65"/></Svg>;
  if (name === 'logout') return <Svg {...p}><Path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><Polyline points="16 17 21 12 16 7"/><Line x1="21" y1="12" x2="9" y2="12"/></Svg>;
  if (name === 'shield') return <Svg {...p}><Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></Svg>;
  if (name === 'wallet') return <Svg {...p}><Rect x="2" y="7" width="20" height="14" rx="2"/><Path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/><Circle cx="16" cy="14" r="1" fill={color}/></Svg>;
  if (name === 'whatsapp') return <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}><Path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.16-.17.2-.35.22-.64.08-.3-.15-1.26-.46-2.39-1.48-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.61-.92-2.21-.24-.58-.49-.5-.67-.51-.17-.01-.37-.01-.57-.01-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.07c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.62.71.23 1.36.2 1.87.12.57-.08 1.76-.72 2.01-1.41.25-.69.25-1.29.17-1.41-.07-.12-.27-.2-.57-.35M12.05 21.79a9.87 9.87 0 01-5.04-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.86 9.86 0 01-1.51-5.26c0-5.45 4.44-9.88 9.89-9.88 2.64 0 5.12 1.03 6.99 2.9a9.83 9.83 0 012.89 6.99c0 5.45-4.44 9.88-9.88 9.88M19.05 4.91A11.81 11.81 0 0012.05 1.5C5.5 1.5.16 6.84.16 13.39c0 2.1.54 4.14 1.59 5.94L0 25.5l6.3-1.65a11.88 11.88 0 005.68 1.45c6.55 0 11.89-5.34 11.89-11.89a11.82 11.82 0 00-3.48-8.41"/></Svg>;
  if (name === 'info') return <Svg {...p}><Circle cx="12" cy="12" r="10"/><Line x1="12" y1="8" x2="12" y2="12"/><Circle cx="12" cy="16" r="0.6" fill={color}/></Svg>;
  if (name === 'alert') return <Svg {...p}><Path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><Line x1="12" y1="9" x2="12" y2="13"/><Circle cx="12" cy="17" r="0.6" fill={color}/></Svg>;
  if (name === 'download') return <Svg {...p}><Path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><Polyline points="7 10 12 15 17 10"/><Line x1="12" y1="15" x2="12" y2="3"/></Svg>;
  if (name === 'key') return <Svg {...p}><Circle cx="7.5" cy="15.5" r="5.5"/><Path d="M21 2l-9.6 9.6"/><Path d="M15.5 7.5L18 5l2 2-2.5 2.5"/></Svg>;
  if (name === 'clock') return <Svg {...p}><Circle cx="12" cy="12" r="10"/><Polyline points="12 6 12 12 16 14"/></Svg>;
  if (name === 'gift') return <Svg {...p}><Polyline points="20 12 20 22 4 22 4 12"/><Rect x="2" y="7" width="20" height="5"/><Line x1="12" y1="22" x2="12" y2="7"/><Path d="M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z"/><Path d="M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z"/></Svg>;
  if (name === 'trendUp') return <Svg {...p}><Polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><Polyline points="17 6 23 6 23 12"/></Svg>;
  if (name === 'trendDown') return <Svg {...p}><Polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><Polyline points="17 18 23 18 23 12"/></Svg>;
  if (name === 'ban') return <Svg {...p}><Circle cx="12" cy="12" r="10"/><Line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></Svg>;
  if (name === 'unlock') return <Svg {...p}><Rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><Path d="M7 11V7a5 5 0 019.9-1"/></Svg>;
  if (name === 'image') return <Svg {...p}><Rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><Circle cx="8.5" cy="8.5" r="1.5"/><Polyline points="21 15 16 10 5 21"/></Svg>;
  if (name === 'arrowRight') return <Svg {...p}><Line x1="5" y1="12" x2="19" y2="12"/><Polyline points="12 5 19 12 12 19"/></Svg>;
  if (name === 'zap') return <Svg {...p}><Polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></Svg>;
  return <Svg {...p}><Circle cx="12" cy="12" r="10"/></Svg>;
}
