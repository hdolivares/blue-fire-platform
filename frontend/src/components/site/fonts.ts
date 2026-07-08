// Landing fonts are declared once in the shared module (src/app/fonts.ts) to
// avoid duplicate @font-face declarations. This file is a thin re-export shim
// kept so existing landing imports (`@/components/site/fonts`) keep working.
import { archivo, instrument, mono, brandFontVars } from "@/app/fonts";

export { archivo, instrument, mono };
export const siteFontVars = brandFontVars;
