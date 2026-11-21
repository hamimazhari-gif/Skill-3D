import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

// Fonts are bundled locally in public/fonts (Inter, SIL Open Font License),
// so rendering works offline. Remotion waits for them before rendering a frame.
export const fontFamily = "Inter";

loadFont({ family: fontFamily, url: staticFile("fonts/inter-latin-400-normal.woff2"), weight: "400" });
loadFont({ family: fontFamily, url: staticFile("fonts/inter-latin-800-normal.woff2"), weight: "800" });
