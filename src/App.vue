<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
import request from '@/utils/request'

export default {
  name: 'App',

  mounted(){
    request({
      url: '',
      method: 'GET'
    }).then((res)=>{
      console.info("Certified");
    }, (res)=>{
      window.open(this.$store.getters.baseUrl);
    });
  }
}
</script>
