
export default {
    created() {
        this.fetchData()
    },
    methods:{
        formatName(name){
            if(!name) return ''
            const strs =  name.split('/')
            return strs[strs.length -1]
        }
    }

}