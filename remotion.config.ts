import { Config } from "@remotion/cli/config";

Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
// WebGL (Three.js) needs a GL backend in headless Chrome.
// "angle" works on most machines; use "swangle" on servers without a GPU.
Config.setChromiumOpenGlRenderer("angle");
Config.setConcurrency(1); // Three.js scenes are GPU-heavy; raise if your machine can handle it
