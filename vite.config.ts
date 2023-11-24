import { defineConfig, loadEnv } from "vite";
import AutoImport from "unplugin-auto-import/vite";
import vue from "@vitejs/plugin-vue";
import { alias } from "./alias";
import { wrapperEnv } from "./build/utils";

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd());
  const viteEnv = wrapperEnv(env);
  const { VITE_PUBLIC_PATH } = viteEnv;

  return {
    plugins: [
      vue(),
      AutoImport({
        include: [/\.[tj]sx?$/, /\.vue$/],
        imports: [
          // 需要自动导入的插件，自定义导入的API
          "vue",
          "vue-router",
          "pinia",
        ],
        dts: true, // 指明 .d.ts 文件的位置和文件名
      }),
    ],
    base: VITE_PUBLIC_PATH || "/",
    resolve: {
      alias,
    },
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@import '@/styles/variables.scss';`,
        },
      },
    },
  };
});
