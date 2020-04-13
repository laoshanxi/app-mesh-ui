import { getConfig } from "@/api/config"
export default {
    created() {
        this.fetchData()
    },
    filters:{
        formatName(name){
            if(!name) return ''
            const strs =  name.split('/')
            return strs[strs.length -1]
        }
    }

}