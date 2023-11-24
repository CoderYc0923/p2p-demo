import { defineStore } from "pinia";

export const baseStore = defineStore("base", {
  state: () => ({
    author: 'yc'
  }),
  actions: {
  },
  persist: {//持久化
    storage: sessionStorage,
    key: 'pinia-base'
  },
});
