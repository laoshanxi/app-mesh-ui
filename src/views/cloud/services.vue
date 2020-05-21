<template>
  <div class="services">
    <iframe src="/ui/dc1/services" frameborder="0" scrolling="auto"></iframe>
  </div>
</template>
<script>

export default {
    name:"Services",

    data(){
        return {
            url:""
        }
    },
    methods:{

    }
}
</script>
<style lang="scss" scoped>
.services {
  height: calc(100vh - 50px) !important;
  width: 100%;
}
iframe{
  top:-48px;
  position: absolute;
  height: calc(100vh) !important;
  width: 100%;
}
</style>
