export const SIGNAL_SERVER_URL = "http://localhost:3007/";
export const MEDIA_STREAM_CONSTRAINTS = {
  video: true,
  audio: {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
  },
};
export const PC_CONFIG = {
  iceServers: [
    {
      urls: "stun:stun.l.google.com:19302",
    },
    {
      urls: "turn:120.77.253.101:3478",
      username: "inter_user",
      credential: "power_turn",
    },
  ],
};
export const OFFER_OPTIONS = {
  offerToReceiveVideo: 1,
  offerToReceiveAudio: 1,
};
export enum SOCKET_ON_SYS {
  //连接成功
  CONNECTION = "connect",
  //连接失败
  CONNECTION_ERROR = "connect_error",
  //断开
  DISCONNECT = "disconnect",
  //用户列表
  USER_LIST = "user_list",
}
export enum SOCKET_ON_RTC {
  //建立连接
  CANDIDATE = "candidate",
  // 发起者发送offer
  OFFER = "offer",
  // 接收者发送answer
  ANSWER = "answer",
  // 挂断通话
  USER_OFF = "user_off",
  // 拒绝通话
  USER_REFUSE = "user_refuse",
}
export enum CALL_TYPE {
  SENDER = "sender",
  RECIVER = "reciver",
}
export enum DATA_CODE {
  OK = 200,
  ERROR = 500,
}
export enum CALL_STATE {
  // 等待
  WAIT = 0,
  // 发起通话中
  SEND = 1,
  // 连接成功
  CONNECT = 2,
  // 拒绝通话
  REFUSE = -1,
  // 挂断
  OFF = -2,
}
export enum SETTINGS_VIDEO {
  //共享屏幕
  DISPLAY = "display",
  //视频通话
  USER = "user",
}
