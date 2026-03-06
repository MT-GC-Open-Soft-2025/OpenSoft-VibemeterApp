/**
 * WellBee Icon Registry
 * All SVG icons in one place. All icons accept className and style props
 * plus any SVG-compatible attribute via rest spread.
 */

const defaults = { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' };

export const IconPlus = (props) => (
  <svg {...defaults} style={{ width: 16, height: 16 }} {...props}>
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

export const IconHome = (props) => (
  <svg {...defaults} style={{ width: 16, height: 16 }} {...props}>
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

export const IconMessage = (props) => (
  <svg {...defaults} style={{ width: 16, height: 16 }} {...props}>
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

export const IconSend = (props) => (
  <svg {...defaults} style={{ width: 18, height: 18 }} {...props}>
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

export const IconStop = (props) => (
  <svg {...defaults} fill="currentColor" stroke="none" style={{ width: 14, height: 14 }} {...props}>
    <rect x="3" y="3" width="18" height="18" rx="2" />
  </svg>
);

export const IconLock = (props) => (
  <svg {...defaults} style={{ width: 12, height: 12, flexShrink: 0 }} {...props}>
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

export const IconMenu = (props) => (
  <svg {...defaults} style={{ width: 20, height: 20 }} {...props}>
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

export const IconChat = (props) => (
  <svg {...defaults} style={{ width: 22, height: 22 }} {...props}>
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

export const IconStar = ({ filled = true, ...props }) => (
  <svg {...defaults} fill={filled ? 'currentColor' : 'none'} stroke={filled ? 'none' : 'currentColor'} style={{ width: 24, height: 24 }} {...props}>
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

export const IconClipboard = (props) => (
  <svg {...defaults} style={{ width: 24, height: 24 }} {...props}>
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
    <line x1="9" y1="12" x2="15" y2="12" /><line x1="9" y1="16" x2="13" y2="16" />
  </svg>
);

export const IconAward = (props) => (
  <svg {...defaults} style={{ width: 24, height: 24 }} {...props}>
    <circle cx="12" cy="8" r="7" />
    <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
  </svg>
);

export const IconDownload = (props) => (
  <svg {...defaults} style={{ width: 15, height: 15 }} {...props}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

export const IconLogout = (props) => (
  <svg {...defaults} style={{ width: 15, height: 15 }} {...props}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

export const IconCheck = (props) => (
  <svg {...defaults} style={{ width: 16, height: 16 }} {...props}>
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export const IconX = (props) => (
  <svg {...defaults} style={{ width: 16, height: 16 }} {...props}>
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

export const IconChevronRight = (props) => (
  <svg {...defaults} style={{ width: 16, height: 16 }} {...props}>
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

export const IconAlertCircle = (props) => (
  <svg {...defaults} style={{ width: 16, height: 16 }} {...props}>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);
