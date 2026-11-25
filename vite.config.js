import { defineConfig } from "vite";
import { levelEditorPlugin } from "./level-editor-plugin.js";

export default defineConfig({
    base: "/lost-days-of-spring/",
    plugins: [levelEditorPlugin()],
});
