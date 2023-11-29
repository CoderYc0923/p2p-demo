import { io } from "socket.io-client";
import { useUserInfo } from "@/stores/userInfo";
import {
  SIGNAL_SERVER_URL,
  SOCKET_ON_SYS,
  CALL_TYPE,
  SOCKET_ON_RTC,
} from "@/configs/index";
import {
  SocketConfig,
  UserItem,
  RtcEmitParams,
  RtcFn,
  ResRtcType,
} from "@/utils/type";

export default class SocketControler {
  socket: any;
  userName: string;
  userInfo;
  constructor(userName: string) {
    this.userName = userName;
    this.userInfo = useUserInfo();
    this.connect();
  }
  connect() {
    return new Promise((resolve) => {
      if (this.userInfo.userList.find((u) => u.userName === this.userName)) {
        alert("当前用户名已存在");
        return;
      }
      let socketConfig: SocketConfig = {
        path: "/rtcket",
        query: {
          userName: this.userName,
          roomId: "001",
        },
      };
      this.socket = io.connect(SIGNAL_SERVER_URL, socketConfig);
      resolve("fulfilled");
      if (!this.socket) {
        alert("当前socket为null，请先连接");
      } else {
        this.sysListen(this.socket);
      }
    });
  }
  //系统消息监听
  sysListen(socket: any) {
    socket.on(SOCKET_ON_SYS.USER_LIST, (data: UserItem[]) => {
      this.userInfo.userList = data;
    });
    socket.on(SOCKET_ON_SYS.CONNECTION, () => {
      alert("连接成功");
      //记录当前用户
      this.userInfo.userInfo.userName = this.userName;
    });
    this.socket.on(SOCKET_ON_SYS.CONNECTION_ERROR, () => {
      alert("连接失败");
    });
  }
  getSocket() {
    return this.socket;
  }
  //向signal server发送消息
  emit<T>(key: SOCKET_ON_RTC, data: T, callType?: CALL_TYPE) {
    let params: RtcEmitParams<T> = {
      toUserInfo: this.userInfo.toUserInfo,
      fromUserInfo: this.userInfo.userInfo,
      data,
      callType,
    };
    this.socket.emit(key, params);
  }
  //监听用户拒绝
  userRefuse(fn: RtcFn) {
    this.socket.on(
      SOCKET_ON_RTC.USER_REFUSE,
      async (res: Required<ResRtcType>) => {
        console.log(`${res.toUserInfo.userName} 拒绝电话`);
        fn({ ...res });
      }
    );
  }
  //监听用户挂断
  userOff(fn: RtcFn) {
    this.socket.on(
      SOCKET_ON_RTC.USER_OFF,
      async (res: Required<ResRtcType>) => {
        console.log(`${res.toUserInfo.userName} 挂断电话`);
        fn({ ...res });
      }
    );
  }
  //监听创建Offer
  rtcOffer(fn: RtcFn<RTCSessionDescription>) {
    this.socket.on(SOCKET_ON_RTC.OFFER, async (res: Required<ResRtcType>) => {
      console.log(`接收到${res.toUserInfo.userName}的offer`);
      fn({ ...res });
    })
  }
  //监听创建answer
  rtcAnswer(fn: RtcFn<RTCSessionDescriptionInit>) {
    this.socket.on(SOCKET_ON_RTC.ANSWER, async (res: Required<ResRtcType>) => {
      console.log(`接收到${res.toUserInfo.userName}的answer`);
      fn({ ...res });
    })
  }
  //监听candidate回调
  rtcCandidate(fn: RtcFn<RTCIceCandidateInit>) {
    this.socket.on(SOCKET_ON_RTC.CANDIDATE, async (res: Required<ResRtcType>) => {
      console.log(`建立连接 触发${res.toUserInfo.userName}candidate回调`);
      fn({ ...res });
    })
  }
}
