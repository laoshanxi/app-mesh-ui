<template>
  <div class="app-container" style="clear:both;">
    <ul class="menu" style="height:150px;width:400px;text-overflow:ellipsis;
  white-space: nowrap;background-color: red;overflow: auto;">
             <li v-for="count in 23" style="float:left; margin-right: 10px; display:inline-block;">
               fadfasdfsdfasdfasdf
             </li>

          </ul>
  </div>
</template>

<script>
export default {
  data() {
    return {
      form: {
        name: '',
        region: '',
        date1: '',
        date2: '',
        delivery: false,
        type: [],
        resource: '',
        desc: ''
      }
    }
  },
  methods: {
    onSubmit() {
      this.$message('submit!')
    },
    onCancel() {
      this.$message({
        message: 'cancel!',
        type: 'warning'
      })
    }
  }
}
</script>

<style scoped>
.line{
  text-align: center;
}
</style>
