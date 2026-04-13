import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    preview: {
      host: true,
      allowedHosts: ["10.100.20.3", "10.104.0.2"],
    },
    server: {
      proxy: {
        "/api": {
          target: env.VITE_API_URL,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ""),
          configure: (proxy) => {
            proxy.on("proxyReq", (proxyReq, req) => {
              const forwardedFor =
                req.headers["x-forwarded-for"] ||
                req.socket.remoteAddress ||
                "";

              proxyReq.setHeader("X-Forwarded-For", forwardedFor);
              proxyReq.setHeader("X-Real-IP", req.socket.remoteAddress || "");
            });
          },
        },
      },
    },
  };
});
