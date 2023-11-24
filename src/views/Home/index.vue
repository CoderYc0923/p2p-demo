<template>
  <div class="home flex-row auto-size">
    <span class="enter-button" @click="clickHandle">ENTER</span>
  </div>
</template>

<script setup lang="ts">
const router = useRouter();

const clickHandle = () => {
  router.push({ name: "Room" });
};
</script>

<style lang="scss" scoped>
.home {
  .enter-button {
    width: 200px;
    height: 50px;
    background: black;
    border-radius: 50px;
    color: rgb(226, 223, 223);
    font-size: $largeFontSize;
    text-align: center;
    line-height: 50px;
    cursor: pointer;
  }
}
</style>
