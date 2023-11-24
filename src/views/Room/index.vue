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
/* const router = useRouter();
const showCard = ref<boolean>(false);

watch(
  () => router.currentRoute,
  (newValue) => {
    showCard.value = true;
  },
  {
    immediate: true,
  }
); */
const localVideoRef = ref();
const remoteVideoRef = ref();

//加入房间
const joinRoom = () => {};

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
