import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import { alias } from "./alias";
import { wrapperEnv } from "./build/utils";

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd())
  const viteEnv = wrapperEnv(env)
  const { VITE_PUBLIC_PATH } = viteEnv

  return {
    plugins: [vue()],
    base: VITE_PUBLIC_PATH || '/',
    resolve: {
      alias,
    },
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@import '@/styles/variables.scss';`
        }
      }
    }
  };
});
