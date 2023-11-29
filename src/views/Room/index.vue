<template>
  <div class="room flex-row auto-size">
    <!-- <div class="info-card" v-if="showCard"></div> -->
    <div class="room-center">
      <div class="local-video">
        <h4>本地视频</h4>
        <video
          autoplay
          playsinline
          ref="localVideoRef"
          controls
          id="local-video"
        ></video>
      </div>
      <div class="remote-video">
        <h4>对方视频</h4>
        <video
          autoplay
          playsinline
          ref="remoteVideoRef"
          controls
          id="remote-video"
        ></video>
      </div>
    </div>
    <div class="room-right frosted-glass pd-10">
      <div class="base-info mr-5-b">
        当前在线人数:{{ userInfo.userList.length }}
      </div>
      <ul class="user-list">
        <li
          class="flex-row-sb mr-5-b"
          v-for="(item, index) in userInfo.userList"
          :key="index"
        >
          <span>{{ item.userName }}</span>
          <span
            class="cursor-pointer"
            style="color: #409eff"
            v-if="item.userName !== userInfo.userInfo.userName"
            @click="onCall(item)"
            >视频通话</span
          >
        </li>
      </ul>
    </div>
    <!-- <div class="room-left">
      <ul class="user-list pd-10">
        <li
          class="flex-row-sb mr-5-b"
          v-for="(item, index) in infoList"
          :key="index"
        >
          <span>{{ item }}</span>
        </li>
      </ul>
    </div> -->
  </div>
</template>

<script setup lang="ts">
import { MessageBoxFn } from "freeze-virtual-ui";

import { PC_CONFIG, CALL_STATE, SOCKET_ON_RTC, CALL_TYPE } from "@/configs";
import SocketControler from "@/utils/socket";
import { useUserInfo } from "@/stores/userInfo";
import { UserItem } from "@/utils/type";

const localVideoRef = ref();
const remoteVideoRef = ref();

let localStream: MediaStream; //本地stream
let localPc: RTCPeerConnection; //对方pc连接
let remotePc: RTCPeerConnection; //对方pc连接
let ws: SocketControler; // socket控制器
let callState = ref<CALL_STATE>(CALL_STATE.WAIT); // 通话状态
const userInfo = useUserInfo();
const router = useRouter();

watch(
  () => router.currentRoute.value,
  (router: any) => {
    const userName = router.query.userName;
    init(userName);
  },
  {
    immediate: true,
  }
);

const init = (userName: string) => {
  remotePc = new RTCPeerConnection(PC_CONFIG);
  createRTC(userName);
};

//创建rtc协议连接
const createRTC = (userName: string) => {
  ws = new SocketControler(userName);
  //挂断回调
  ws.userOff(() => {
    resetState(CALL_STATE.OFF);
  });
  //拒绝回调
  ws.userRefuse(() => {
    resetState(CALL_STATE.REFUSE);
  });
  //offer回调
  ws.rtcOffer(async (res) => {
    //创建answer
    const remoteDesc = res.data;
    remotePc = new RTCPeerConnection(PC_CONFIG);
    await remotePc.setRemoteDescription(remoteDesc);
    let remoteAnswer = await remotePc.createAnswer();
    await remotePc.setLocalDescription(remoteAnswer);
    ws.emit(SOCKET_ON_RTC.ANSWER, remoteAnswer, res.callType);
  });
  //answer回调
  ws.rtcAnswer(async (res) => {
    let remoteAnswer = res.data;
    await localPc.setRemoteDescription(remoteAnswer);
  });
  //candidate回调
  ws.rtcCandidate(async (res) => {
    if (!remoteVideoRef.value) return;
    userInfo.toUserInfo = res.toUserInfo;
    let video: HTMLVideoElement = remoteVideoRef.value.$el;
    remotePc.ontrack = (e) => {
      video.srcObject = e.streams[0];
      //如果当前是接收者则触发弹窗
      if (res.callType === CALL_TYPE.SENDER) {
        MessageBoxFn(
          `${res.toUserInfo.userName}向你发来视频通话请求`,
          "收到一条消息",
          {
            boxType: "confirm",
            type: "info",
          }
        )
          .then(() => {
            //接听
            onAgree();
          })
          .catch(() => {
            //拒接
            onRefuse();
          });
      } else {
        video.oncanplay = () => {
          video.play();
          callState.value = CALL_STATE.CONNECT;
        };
      }
    };
    //添加ice
    const candidate = res.data;
    await remotePc.addIceCandidate(candidate);
  });
};

//发起offer协议
const sendOffer = async (toUser: UserItem, callType: CALL_TYPE) => {
  if (!ws.socket) {
    alert("请先连接");
    return;
  }
  //初始化当前视频
  localPc = new RTCPeerConnection(PC_CONFIG);
  //添加RTC流
  localStream.getTracks().forEach((track) => {
    localPc.addTrack(track, localStream);
  });
  //给RTC流设置icecandidate监听事件
  localPc.onicecandidate = function (event) {
    console.log("localPc:", event.candidate, event);
    //回调时，将自身的candidate发给对方，对方可以直接调用 addIceCandidate(candidate) 从而可以获取流
    if (event.candidate)
      ws.emit(SOCKET_ON_RTC.CANDIDATE, event.candidate, callType);
  };
  //记录被发起者
  userInfo.toUserInfo = toUser;
  //发起方创建offer
  let offer = await localPc.createOffer();
  // 建立连接, 此时会触发onicecandidate，并注册ontrack
  await localPc.setLocalDescription(offer);
  ws.emit(SOCKET_ON_RTC.OFFER, offer, callType);
};

//重置状态
const resetState = (state: CALL_STATE) => {
  callState.value = state;
  //关闭远程PC通道
  remotePc.close();
  //清除事件
  if (remoteVideoRef.value) remoteVideoRef.value.$el.oncanplay = null;
  setTimeout(() => {
    userInfo.toUserInfo = {
      userName: "",
      userId: "",
    };
    callState.value = CALL_STATE.WAIT;
  }, 1000);
};

//发起通话
const onCall = (toUser: UserItem) => {
  callState.value = CALL_STATE.SEND;
  sendOffer(toUser, CALL_TYPE.SENDER);
};

//同意接听
const onAgree = () => {
  //如果当前正在通话
  if (callState.value === CALL_STATE.CONNECT) {
    alert("当前正在通话，请先挂断通话");
    onRefuse();
    return;
  }
  //接收对方的offer并同意通话
  if (remoteVideoRef.value) {
    let video = remoteVideoRef.value.$el;
    video.play();
    //同意通话，并设置自己为通话中
    if (userInfo.toUserInfo.userName && callState.value !== CALL_STATE.SEND) {
      callState.value = CALL_STATE.CONNECT;
      sendOffer(userInfo.toUserInfo, CALL_TYPE.RECIVER);
    } else alert("当前处于拨打中");
  }
};

//拒绝接听
const onRefuse = () => {
  ws.emit(SOCKET_ON_RTC.USER_REFUSE, {});
};

//结束通话
const onOver = () => {
  resetState(CALL_STATE.OFF);
  ws.emit(SOCKET_ON_RTC.USER_OFF, {});
};
</script>

<style lang="scss" scoped>
.room {
  position: relative;
  background: url("assets/sky.jpg");
  .info-card {
    width: 400px;
    height: 300px;
    background: #ffffff;
    border-radius: 10px;
  }
  .room-center {
    video {
      width: 400px;
    }
  }
  .room-right {
    position: absolute;
    right: 15px;
    top: 15px;
    width: 300px;
    height: 300px;
    overflow-y: auto;
    .base-info::before {
      content: "";
      display: inline-block;
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background-color: green;
    }
  }

  .room-left {
    position: absolute;
    left: 15px;
    top: 15px;
    width: 300px;
    height: 300px;
    overflow-y: auto;
    font-size: 12px;
  }
}
</style>
