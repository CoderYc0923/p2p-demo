import io from "socket.io-client";

export type SocketConfig = {
  path: string;
  query: {
    username: string;
    roomId: string;
  };
};

export type HandleFunctions = {
  onOtherJoin?: Function;
  onMyJoin?: Function;
  onMyLeave?: Function;
  onOtherLeave?: Function;
  onClientsOnline?: Function;
  onPcMessage?: Function;
  onInteract?: Function;
  onAgreeInteract?: Function;
  onRefuseInteract?: Function;
  onStopInteract?: Function;
  onCloseDisconnect?: Function;
};

const defualtFunction = () => {
  console.log("未设置监听方法");
};

export class Socket {
  private url: string;
  private socketConfig: SocketConfig;
  private socket: any = null;
  private onOtherJoin: Function = defualtFunction; //其他用户join回调
  private onMyJoin: Function = defualtFunction; // 自己加入成功回调
  private onMyLeave: Function = defualtFunction; // 自己离开回调
  private onOtherLeave: Function = defualtFunction; //别人离开回调
  private onClientsOnline: Function = defualtFunction; //更新在线人数回调
  private onPcMessage: Function = defualtFunction; //客户端收到的信息
  private onInteract: Function = defualtFunction; //收到别人请求通话的回调
  private onAgreeInteract: Function = defualtFunction; //对方同意通话回调
  private onRefuseInteract: Function = defualtFunction; //对方拒绝通话回调
  private onStopInteract: Function = defualtFunction; //对方结束通话回调
  private onCloseDisconnect: Function = defualtFunction; //对方断开disconnect回调
  id: any;

  constructor(
    url: string,
    socketConfig: SocketConfig,
    handleFunctions: HandleFunctions
  ) {
    this.url = url;
    this.socketConfig = socketConfig;
    this.connect(handleFunctions);
  }

  private connect(handleFunctions: HandleFunctions) {
    this.socket = io.connect(this.url, this.socketConfig);
    this.socket.on("connect", () => {
      this.id = this.socket.id;
      this.setHandleFunctions(handleFunctions);
      this.bindHnadleFunctions();
    });
  }

  private setHandleFunctions(handleFunctions: HandleFunctions) {
    this.onOtherJoin = handleFunctions.onOtherJoin || defualtFunction;
    this.onMyJoin = handleFunctions.onMyJoin || defualtFunction;
    this.onMyLeave = handleFunctions.onMyLeave || defualtFunction;
    this.onOtherLeave = handleFunctions.onOtherLeave || defualtFunction;
    this.onClientsOnline = handleFunctions.onClientsOnline || defualtFunction;
    this.onPcMessage = handleFunctions.onPcMessage || defualtFunction;
    this.onInteract = handleFunctions.onInteract || defualtFunction;
    this.onAgreeInteract = handleFunctions.onAgreeInteract || defualtFunction;
    this.onRefuseInteract = handleFunctions.onRefuseInteract || defualtFunction;
    this.onStopInteract = handleFunctions.onStopInteract || defualtFunction;
    this.onCloseDisconnect =
      handleFunctions.onCloseDisconnect || defualtFunction;
  }

  private bindHnadleFunctions() {
    this.socket.on("join", this.onOtherJoin);
    this.socket.on("joined", this.onMyJoin);
    this.socket.on("left", this.onMyLeave);
    this.socket.on("leave", this.onOtherLeave);
    this.socket.on("clients", this.onClientsOnline);
    this.socket.on("pc_messageoin", this.onPcMessage);
    this.socket.on("interact", this.onInteract);
    this.socket.on("agree_interact", this.onAgreeInteract);
    this.socket.on("refuse_interact", this.onRefuseInteract);
    this.socket.on("stop_interact", this.onStopInteract);
    this.socket.on("close_disconnect", this.onCloseDisconnect);
  }

  emit(order: string, callback: Function) {
    this.socket.emit(order, callback);
  }

  getId() {
    return this.socket.id;
  }

  disconnect() {
    this.socket.disconnect();
  }
}
