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
    <!-- <div class="room-right frosted-glass pd-10">
      <div class="base-info mr-5-b">
        当前在线人数:{{ onlineClients.length }}
      </div>
      <ul class="user-list">
        <li
          class="flex-row-sb mr-5-b"
          v-for="item in onlineClients"
          :key="item.userId"
        >
          <span>{{ item.username }}</span>
          <span
            class="cursor-pointer"
            style="color: #409eff"
            v-if="item.username !== username"
            @click="interact(item)"
            >互动</span
          >
        </li>
      </ul>
    </div> -->
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
import { PC_CONFIG, CALL_STATE, SOCKET_ON_RTC,CALL_TYPE } from "@/configs";
import SocketControler from "@/utils/socket";
import { useUserInfo } from "@/stores/userInfo";

const localVideoRef = ref();
const remoteVideoRef = ref();

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
  ws.rtcOffer(async res => {
    //创建answer
    const remoteDesc = res.data;
    remotePc = new RTCPeerConnection(PC_CONFIG);
    await remotePc.setRemoteDescription(remoteDesc)
    let remoteAnswer = await remotePc.createAnswer();
    await remotePc.setLocalDescription(remoteAnswer);
    ws.emit(SOCKET_ON_RTC.ANSWER, remoteAnswer, res.callType)
  })
  //answer回调
  ws.rtcAnswer(async res => {
    let remoteAnswer = res.data;
    await localPc.setRemoteDescription(remoteAnswer)
  })
  //candidate回调
  ws.rtcCandidate(async res => {
    if (!remoteVideoRef.value) return;
    userInfo.toUserInfo = res.toUserInfo;
    let video:HTMLVideoElement = remoteVideoRef.value.$el;
    remotePc.ontrack = e => {
      video.srcObject = e.streams[0];
      //如果是发起者则需要对方同意，如果是接收者则不需要
      if (res.callType === CALL_TYPE.SENDER) {

      } else {
        video.oncanplay = () => {
          video.play();
          callState.value = CALL_STATE.CONNECT;
        }
      }
    }
    //添加ice
    const candidate = res.data;
    await remotePc.addIceCandidate(candidate)
  })
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
