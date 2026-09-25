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
  build: {
    chunkSizeWarningLimit: 2500,
    rollupOptions: {
      output: {
        manualChunks(id) {
          const normalizedId = id.replace(/\\/g, "/");
          if (normalizedId.includes("node_modules")) {
            if (
              normalizedId.includes("jspdf") ||
              normalizedId.includes("html2canvas") ||
              normalizedId.includes("xlsx") ||
              normalizedId.includes("export-from-json")
            ) {
              return "export-tools";
            }
            if (
              normalizedId.includes("chart.js") ||
              normalizedId.includes("react-chartjs-2")
            ) {
              return "chartjs";
            }
            if (
              normalizedId.includes("tinymce") ||
              normalizedId.includes("quill")
            ) {
              return "editor-vendors";
            }
            if (
              normalizedId.includes("react-syntax-highlighter") ||
              normalizedId.includes("refractor") ||
              normalizedId.includes("prismjs")
            ) {
              return "syntax-highlighter";
            }
            if (
              normalizedId.includes("antd") ||
              normalizedId.includes("@ant-design") ||
              normalizedId.includes("rc-")
            ) {
              return "antd";
            }
            if (
              normalizedId.includes("react-data-table-component") ||
              normalizedId.includes("styled-components")
            ) {
              return "datatable-vendors";
            }
          }
        },
      },
    },
  },
});
