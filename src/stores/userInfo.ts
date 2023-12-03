import { defineStore } from "pinia";
import { UserItem } from "@/utils/type";
import { SETTINGS_VIDEO } from "@/configs";
export const useUserInfo = defineStore("userInfo", {
  state: () => ({
    userList: [] as UserItem[],
    //设置当前视频参数
    settings: {
      video: SETTINGS_VIDEO.USER, //视频类型
      localAudio: false, //本地声音
      localVideo: true, //本地视频
      remoteAudio: false, // 对方声音
      remoteVideo: true, //对方视频
    },
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
