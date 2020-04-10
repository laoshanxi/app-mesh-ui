import { getConfig } from "@/api/config"
export default {
    created() {
        this.init()
    },
    data(){
        return {
            apiBaseUrl:""
        }
    },
    methods:{
        async init(){
            await this.getCfg()
            this.fetchData()
        },
        async getCfg(){
            const { data:cfgData } = await getConfig()
            const {
             Consul: { url }
           } = cfgData  
     
           this.apiBaseUrl = url // delete api need
           return Promise.resolve(this.apiBaseUrl)
        }
    },
    filters:{
        formatName(name){
            if(!name) return ''
            const strs =  name.split('/')
            return strs[strs.length -1]
        }
    }

}