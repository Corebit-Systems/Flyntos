import './globals.css';
import './header-overrides.css';
import './locale-switcher-overrides.css';
import type { ReactNode } from 'react';
export default function RootLayout({ children }: { children: ReactNode }) { return <html lang='en'><body>{children}</body></html>; }
