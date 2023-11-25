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
  </div>
</template>

<script setup lang="ts">
import { SIGNAL_SERVER_URL } from "@/configs";
import { Socket, SocketConfig, HandleFunctions } from "@/utils/socket";

const socket = ref<any>();
const localVideoRef = ref();
const remoteVideoRef = ref();

const username = ref<string>("");
const onlinePeersList = ref<any[]>([]);
const onlineClients = ref<any[]>([]);

const onOtherJoin = (data: any) => {
  console.log(`${data.username}加入了房间`);
};

const onMyJoin = () => {
  console.log("您加入了房间");
};

const onMyLeave = () => {
  console.log("您离开了房间");
  socket.value?.disconnect();
};

const onOtherLeave = (data: any) => {
  console.log(`${data.username}离开了房间`);
  if (onlinePeersList[data.userId]) {
    onlinePeersList[data.userId].close();
    delete onlinePeersList[data.userId];
  }
};

const onClientsOnline = (data: any) => {
  console.log(`在线人员信息：${data}`);
  onlineClients.value = data;
};

const onPcMessage = (data: any) => {
  console.log("接收到的pc信息：", data);
  signalingMessageCallback(data);
};

const onInteract = (data: any) => {};

const onAgreeInteract = (data: any) => {};

const onRefuseInteract = (data: any) => {};

const onStopInteract = (data: any) => {};

const onCloseDisconnect = (data: any) => {};

const signalingMessageCallback = (data: any) => {};

//加入房间
const joinRoom = () => {
  const config: SocketConfig = {
    path: "/rtcket",
    query: {
      username: username.value,
      roomId: "hello",
    },
  };
  const handleFunctions: HandleFunctions = {
    onOtherJoin,
    onMyJoin,
    onMyLeave,
    onOtherLeave,
    onClientsOnline,
    onPcMessage,
    onInteract,
    onAgreeInteract,
    onRefuseInteract,
    onStopInteract,
    onCloseDisconnect,
  };
  socket.value = new Socket(SIGNAL_SERVER_URL, config, handleFunctions);
};

onMounted(joinRoom);
</script>

<style lang="scss" scoped>
.room {
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
}
</style>
