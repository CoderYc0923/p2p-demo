import { defineStore } from "pinia";
import { UserItem } from '@/utils/type';

export const useUserInfo = defineStore("userInfo", {
  state: () => ({
    userList: [] as UserItem[],
    //当前用户信息
    userInfo: {
      userName: "",
      userId: "",
    },
    //对方用户信息
    toUserInfo: {
      userName: "",
      userId: "",
    },
  }),
  actions: {},
  // persist: {//持久化
  //   storage: sessionStorage,
  //   key: 'pinia-base'
  // },
});
