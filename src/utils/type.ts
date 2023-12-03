import { CALL_TYPE, DATA_CODE } from "@/configs/index";

export interface UserItem {
  userName: string;
  userId: string;
}

export interface SocketConfig {
  path: string;
  query: {
    userName: string;
    room: string;
  };
}

export interface RtcEmitParams<T> {
  toUserInfo: UserItem;
  fromUserInfo: UserItem;
  data: T;
  callType?: CALL_TYPE;
}

// 返回数据类型
export interface ResType {
  code: DATA_CODE;
  msg?: string;
  data?: any;
}

//rtc返回数据格式
export interface ResRtcType extends ResType {
  toUserInfo: UserItem;
  fromUserInfo: UserItem;
  callType?: CALL_TYPE;
}

//rtc回调传参
export interface RtcFnParams<T> extends ResRtcType {
  data: T;
}

export type RtcFn<T = undefined> = (params: RtcFnParams<T>) => void;
