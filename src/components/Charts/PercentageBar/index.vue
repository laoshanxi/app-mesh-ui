<template>
  <div :id="'pb-'+id"></div>
</template>

<script>
import G2 from '@antv/g2';
import {DataSet} from '@antv/data-set';

export default {
  name:"PercentageBar",
  props:[
    "id",
    "data",// data:[{label:"",value:10}]
    "width",
    "padding"
  ],
  data(){
    return {
      chart:null
    }
  },
  mounted(){
    setTimeout(()=>{
      this.createChart();
    }, 500)
  },
  methods:{
    createChart(){
      var ds = new DataSet();
        var dv = ds.createView().source(this.data).transform({
          type: 'percent',
          field: 'value',
          dimension: 'label',
          groupBy: ['key'],
          as: 'percent'
        });
      let chart = new G2.Chart({
        container: 'pb-'+this.id,
        forceFit: true,
        height: 30,
        width:this.width,
        padding: this.padding ? this.padding : [0, 0, 0, 0]
      });
      // chart.source(this.data);
      chart.source(dv, {
          percent: {
            min: 0,
            formatter: function formatter(val) {
              return (val * 100).toFixed(2) + '%';
            }
          }
        });
      chart.legend(false);
      chart.axis(false);
      chart.coord().transpose();
      chart.tooltip(false);
      chart.intervalStack().position('key*percent').label('percent', function(value, config, index) {
        if(index>0){
          return null;
        }
        return {
          position: 'end',
          offset: 5,
          textStyle: {
            fill: '#fff',
            fontSize:16
          }
        };
      }).color("label",['#FF6A84', '#67C23A']).size(30).opacity(1);
      chart.render();
      this.chart = chart;
    }
  }
}
</script>

<style>
</style>
