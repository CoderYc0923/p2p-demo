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
    </div>
    <div class="room-left">
      <ul class="user-list pd-10">
        <li
          class="flex-row-sb mr-5-b"
          v-for="(item, index) in infoList"
          :key="index"
        >
          <span>{{ item }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  SIGNAL_SERVER_URL,
  MEDIA_STREAM_CONSTRAINTS,
  PC_CONFIG,
  OFFER_OPTIONS,
} from "@/configs";
import { Socket, SocketConfig, HandleFunctions } from "@/utils/socket";
import { MessageBoxFn } from "freeze-virtual-ui";

const socket = ref<any>();
const localVideoRef = ref();
const remoteVideoRef = ref();
const localStream = ref();
const remoteStream = ref();

const username = computed(() => {
  return `编号${Math.floor(Math.random() * 10 + 1)}`;
});
const onlinePeersList = ref<any>([]);
const onlineClients = ref<any[]>([]);
const peerList = ref<any>({});
const infoList = ref<string[]>([]);
const pcMsgTo = ref<any>({});

const addInfo = (info: string) => {
  infoList.value.push(info);
};

const interact = (user: any) => {
  if (!!peerList[user.userId]) {
    MessageBoxFn(`${user.username}当前正忙`, "提示", (action: string) => {});
    return;
  }
  if (!localStream.value) {
    startAction(() => {
      interactHandle(user);
    });
  } else {
    interactHandle(user);
  }
};

const interactHandle = (user: any) => {
  socket.value.emit("interact", {
    from: { username: username.value, userId: socket.value.id },
    to: user,
  });
  addInfo(`${username.value}向${user.username}发起了视频通话请求`);
};

const onOtherJoin = (data: any) => {
  addInfo(`${data.username}加入了房间`);
};

const onMyJoin = () => {
  addInfo(`您加入了房间`);
};

const onMyLeave = () => {
  addInfo(`您离开了房间`);
  socket.value?.disconnect();
};

const onOtherLeave = (data: any) => {
  addInfo(`${data.username}离开了房间`);
  if (onlinePeersList[data.userId]) {
    onlinePeersList[data.userId].close();
    delete onlinePeersList[data.userId];
  }
};

const onClientsOnline = (data: any) => {
  console.log(`在线人员信息：`, data);
  onlineClients.value = data;
};

const onPcMessage = (data: any) => {
  console.log("接收到的pc信息：", data);
  signalingMessageCallback(data);
};

const onInteract = (data: any) => {
  MessageBoxFn(`${data.from.username}向你发来视频通话请求`, "收到一条消息", {
    boxType: "confirm",
    type: "info",
  })
    .then(() => {
      //接听
      socket.value.emit("agree_interact", data);
      pcMsgTo.value = data.from;
      createPeerConnection(false, data);
    })
    .catch(() => {
      //拒接
      socket.value.emit("refuse_interact", data);
    });
};

const onAgreeInteract = (data: any) => {
  console.log('11111111111', data);
  
  MessageBoxFn(`${data.to.username}接受了你的视频请求`, "收到一条消息", {
    boxType: "alert",
    type: "success",
  });
  pcMsgTo.value = data.to;
  addInfo(`${data.to.username}接受了${data.from.username}的视频请求`);
  createPeerConnection(true, data);
};

const onRefuseInteract = (data: any) => {
  MessageBoxFn(`${data.to.username}拒绝了你的视频请求`, "收到一条消息", {
    boxType: "alert",
    type: "warning",
  });
  addInfo(`${data.to.username}拒绝了${data.from.username}的视频请求`);
  closeConnection();
};

const onStopInteract = (data: any) => {};

const onCloseDisconnect = (data: any) => {
  console.log("onCloseDisconnect", data);

  addInfo(`${data[0].username}断开了连接`);
};

const clearRoom = () => {
  socket.value?.disconnect();
  onlineClients.value = [];
};

const signalingMessageCallback = (data: any) => {};

//获取本地视频流
const startAction = (callback: Function) => {
  navigator.mediaDevices
    .getUserMedia(MEDIA_STREAM_CONSTRAINTS)
    .then((stream) => {
      getLocalMediaStream(stream, callback);
      console.log("获取本地视频流");
    })
    .catch((err) => {
      console.log("获取本地视频流失败：", err);
    });
};

//将本地视频流存入video标签播放
const getLocalMediaStream = (stream: any, callback: Function) => {
  localVideoRef.value.srcObject = stream;
  localStream.value = stream;
  callback();
  console.log("本地视频流存入video");
};

//创建对等连接
const createPeerConnection = (isCreateOffer: boolean, data: any) => {
  let otherUser = isCreateOffer ? data.to : data.from;
  if (!peerList[otherUser.userId]) {
    let pc = new RTCPeerConnection(PC_CONFIG);
    pc.from = data.from;
    pc.to = data.to;
    pc.isSelf = isCreateOffer; //发起者是否是自己
    pc.other = otherUser;
    peerList[otherUser.userId] = pc;
    onlinePeersList.value.push(pc);
    createConnection(isCreateOffer, pc);
  }
};

//webRTC默认开启trickle-ice,每次探测到一个icedidate都会icecandidate触发事件，直到返回null
const createConnection = (isCreateOffer: boolean, pc: any) => {
  pc.addEventListener("icecandidate", (event: any) => {
    console.log("icecandidate event:", event);
    if (event.candidate) {
      let messageParams = {
        type: "candidate",
        label: event.candidate.sdpMLineIndex,
        id: event.candidate.sdpMid,
        candidate: event.candidate.candidate,
      };
      sendPcMessage(messageParams);
    } else {
      console.log("icecandidate探测结束");
    }
  });
  if (localStream.value) {
    pc.addStream(localStream.value);
  } else {
    startAction(addStreamToLocalPc(pc));
  }
  pc.addEventListener("addstream", (event: any) => {
    console.log("触发addstream");
    handleRemoteMediaStreamAdded(pc, event);
  });
  if (isCreateOffer) {
    pc.createOffer(OFFER_OPTIONS)
      .then((description: any) => createOfferSuccess(pc, description))
      .catch((err: any) => console.log("创建offer失败", err));
  }
};

const addStreamToLocalPc = (pc: any) => {
  return () => {
    pc.addStream(localStream.value);
  };
};

const createOfferSuccess = (pc: any, description: any) => {
  //用sdp生成localPc的本地描述,remotePc的远程描述
  pc.setLocalDescription(description)
    .then(() => {
      sendPcMessage(pc.localDescription);
      console.log("成功创建offer，生成本地会话描述");
    })
    .catch((err: any) => {
      console.log("生成本地会话描述失败:", err);
    });
};

//获取远程视频流并播放
const handleRemoteMediaStreamAdded = (pc: any, event: any) => {
  pc.remoteStream = event.stream;
  remoteVideoRef.value.srcObject = event.stream;
  remoteVideoRef.value.addEventListener("loaloadedmetadatad", () => {
    remoteVideoRef.value.play();
  });
  remoteStream.value = event.stream;
  console.log(`从${pc.other.username}获取到远程视频`);
};

//发送消息
const sendPcMessage = (params: any) => {
  let from = {
    userId: socket.value.id,
    username: username.value,
  };
  let to = pcMsgTo.value;
  socket.value.emit("pc_message", { from, to, pcMsg: params });
};

//关闭连接
const closeConnection = async () => {
  socket.value.disconnect();
  onlineClients.value = [];
  await closeLocalMedia();
  localStream.value = null;
  remoteStream.value = null
}

const closeLocalMedia = () => {
  if (localStream.value && localStream.value.getTracks()) {
    localStream.value.getTracks().forEach((track:any) => {
      track.stop();
    })
  }
  if (remoteStream.value && remoteStream.value.getTracks()) {
    remoteStream.value.getTracks().forEach((track:any) => {
      track.stop();
    })
  }
  if (localVideoRef.value.srcObject && localVideoRef.value.srcObject.getTracks()) {
    localVideoRef.value.srcObject.getTracks().forEach((track:any) => {
      track.stop();
    })
  }
  if (remoteVideoRef.value.srcObject && remoteVideoRef.value.srcObject.getTracks()) {
    remoteVideoRef.value.srcObject.getTracks().forEach((track:any) => {
      track.stop();
    })
  }
  if (onlinePeersList.value.other) {
    remoteVideoRef.value.srcObject = null
  }
  localVideoRef.value.srcObject = null;
}

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
onUnmounted(clearRoom);
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
