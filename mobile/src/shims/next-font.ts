// Stand-in for next/font/google. The app bundles its fonts with @fontsource (see src/styles.css), so a font here is just a CSS-variable class.
type Font = { variable: string; className: string; style: { fontFamily: string } };
const make = (family: string, variable: string): Font => ({ variable, className: "", style: { fontFamily: family } });

export const Caveat = (_options?: unknown): Font => make("Caveat", "font-caveat-var");
export const Inter = (_options?: unknown): Font => make("Inter", "font-inter-var");
export const DM_Serif_Display = (_options?: unknown): Font => make("DM Serif Display", "font-dm-var");
