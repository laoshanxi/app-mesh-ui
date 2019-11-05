<template>
  <div class="app-container">
    <code>
      {{resources}}
    </code>
  </div>
</template>

<script>
import {getResources} from '@/api/resources'

export default {
  data() {
    return {
      activeNames:[],
      resources:''
    }
  },
  mounted(){
    getResources().then((res)=>{
      this.resources = res.data;
    }, (res)=>{

    });
  },
  methods: {

  }
}
</script>

<style scoped>
.line{
  text-align: center;
}
</style>
