<template>
  <div class="home flex-row auto-size">
    <input type="text" v-model="userName">
    <span class="enter-button" @click="clickHandle">ENTER</span>
  </div>
</template>

<script setup lang="ts">
const router = useRouter();

const userName = computed(() => {
  return `编号${Math.floor(Math.random() * 10 + 1)}`;
});

const clickHandle = () => {
  if (checkUserName()) {
    router.push({ name: "Room",query: {userName: userName.value} });
  } else {
    alert('用户名已存在')
  }
};

const checkUserName = () => {
  return true
}
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
