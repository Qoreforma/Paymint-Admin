import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vitejs.dev/config/
export default defineConfig({
  base: "/",
  plugins: [react()],
  server: {
    // this ensures that the browser opens upon server start
    open: true,
    // this sets a default port to 3000
    port: 3000,
  },
  //   test: {
  //     globals: true,
  //     environment: "jsdom",
  //     setupFiles: "./src/setupTests.js",
  //     css: true,
  //     reporters: ["verbose"],
  //     coverage: {
  //       reporter: ["text", "json", "html"],
  //       include: ["src/**/*"],
  //       exclude: [],
  //     },
  //   },
});
