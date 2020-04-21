<template>


 <div align="left">
    <p>{{place}}   /   更新時刻:{{now}}  <input type="button" value="更新" class="btn-gradient-radius" @click="teiki_revised()">  </p>
    
  <ul>
    <li v-if="hiru_yoru==='day'"> 今日 : {{ forecast_today.tenki }}   最低気温{{ forecast_today.tempL }}℃ / 最高気温{{ forecast_today.tempH }}℃  </li>
    <li v-if="hiru_yoru==='night'"> 明日 : {{ forecast_tomorrow.tenki }}  最低気温{{ forecast_tomorrow.tempL }}℃ / 最高気温{{ forecast_tomorrow.tempH }}℃   </li>   
  </ul>
     

  <div class="clearfix box_wrap">
      <div class="box_left">
          <img v-if="hiru_yoru==='day'" v-bind:src=picture_today width="140" height="100"> 
          <img v-if="hiru_yoru==='night'" v-bind:src=picture_tomorrow width="140" height="100"> 
      </div>
      <div class="box_left">
          <div id="box2"><div class="block">{{ hiru_yoru==='day' ? forecast_today.tempL : forecast_tomorrow.tempL }}</div></div>
      </div>
      <div class="box_left">
          <div id="box2r"><div class="block">{{  hiru_yoru==='day' ? forecast_today.tempH : forecast_tomorrow.tempH }}</div></div>
      </div>
  </div>
    
     
  <div class="box27">
      <span class="box-title">{{hinichi}} の概要</span>
    <p> {{ gaiyo }} </p> 

   
</div> 

        <p><input type="button" value="戻る" class="btn-gradient-radius"　@click="returnButtonClick()"></p>
      
  </div>

                       
</template>




<script>
// eslint-disable-next-line
/* eslint-disable */ 
import Vue from 'vue'
const LOCATION='340010' //Hiroshimaを指定している。


export default {

  name: 'otenki',

  methods:{

    //文字列「stringToSplit をseparator」で分割し、配列に格納する関数
    moji_split:function(stringToSplit,separator){
      var arrayOfStrings = stringToSplit.split(separator);
      return arrayOfStrings[0]
      },

   　
    // お天気データをAPIより取得する関数
    otenkiget:function(){
         this.result= "Connecting..."
         this.$axios.get('http://192.168.3.6:4000/otenkiget',
        
           {params:
                 {
                   place:this.placenum,
                 }          
           })
           .then(function(response){

             this.result= response.data.message.mes
             this.matrix= response.data.message.otenkidat //バックエンドから返したデータを格納する。
             //console.log("this.matrix")             
             //console.log(this.matrix)
             this.place=this.matrix[0].title //地名を取得する。
             
             //本日の最高気温と最低気温のデータを取り出す。ただし、時間帯によってはNODTAEになりエラーが発生してしまうのでその時は、'NA'表示する。
             try{
             var today_tempH = this.matrix[0].forecasts[0].temperature.max.celsius
             }catch(e){
             var today_tempH = 'NA'  
             }
             try{
             var today_tempL = this.matrix[0].forecasts[0].temperature.min.celsius
             }catch(e){
             var today_tempL = 'NA'  
             }

             //本日の天気、最高気温、最低気温を配列「forecast_today」に格納する。
             this.forecast_today={"tenki":this.matrix[0].forecasts[0].telop,
                                  "tempH":today_tempH,
                                  "tempL":today_tempL,
                                  }

             //明日の天気、最高気温、最低気温を配列「forecast_today」に格納する。
             this.forecast_tomorrow={"tenki":this.matrix[0].forecasts[1].telop,
                                  "tempH":this.matrix[0].forecasts[1].temperature.max.celsius,
                                  "tempL":this.matrix[0].forecasts[1].temperature.min.celsius,
                                  }

             //本日の天気の画像を取得する。
             this.picture_today=this.matrix[0].forecasts[0].image.url

             //明日の天気の画像を取得する。            
             this.picture_tomorrow=this.matrix[0].forecasts[1].image.url

             //天気概要取得する。              
             this.gaiyo=this.matrix[0].description.text

             //天気の概要の対象日を取得する  
             this.hinichi=this.moji_split(this.matrix[0].description.publicTime,"T")

              // ##########  For debug  ##############
              //console.log("this.city")             
              //console.log(this.place)              
              //console.log("thisforecast_today")             
              //console.log(this.forecast_today) 
              //console.log("thisforecast_tomorrow")             
              //console.log(this.forecast_tomorrow) 
              //console.log("this.picture_today")             
              //console.log(this.picture_today) 
              //console.log("this.picture_tomorrow")             
              //console.log(this.picture_tomorrow) 

           }.bind(this))  //Promise処理を行う場合は.bind(this)が必要

           .catch(function(error){  //バックエンドからエラーが返却された場合に行う処理について
             console.log("ERROE")
             this.result="サーバーエラー発生"  
             }.bind(this))
           .finally(function(){
             }.bind(this))
    },


    // 現在時刻を取得する関数
    gettime:function(){
    
      this.now=this.moji_split(new Date().toLocaleTimeString()," ") //現在時刻をxx:xx:xxの形式で取得する
      var dd=new Date() //本日の日付を取得する。
      this.hour= dd.getHours()  //現在時刻 hourのみを取得している
      　　//console.log("this.hour")
      　　//console.log(this.hour)      
      this.hiru_yoru= this.hour<=this.settime ? 'day' : 'night'　//this.settimeよりも現在時刻が早ければday,そうでなければnight
      　　//console.log("this.hiru_yoru")
      　　//console.log(this.hiru_yoru)  
    },





    // Vueインスタンス作成時に実行する。
    revised:function(){
      this.gettime()
      this.otenkiget() 
    },

    //更新ボタンクリックで更新する。
    teiki_revised:function(){
       this.revised()
    },

    //ひとつ前のページに戻る
    returnButtonClick: function () {
        this.$router.go(-1) // 1つ戻る
    },


  
  },

  created:function(){
     setInterval(() => { this.revised() }, 1000*60*60) //1時間ごとに実行する
      //this.revised()
  },
 
  computed: {
        ///
  },


  data: function(){
    return { 
         placenum:LOCATION,
         picture_today:'',
         picture_tomorrow:'',
         result:'READY',
         matrix:'',
         place:'',
         forecast_today:[],
         forecast_tomorrow:[],         
         now:'',
         hour:'',
         settime:15,   //day(昼)とnight(夜)のしきい時間 hour を決めている。
         hiru_yoru:'day', //day(昼) or night(夜)を格納する変数
         url:'',
         hinichi:'',
         gaiyo:'',
    }
  },

}  




</script>




<style>
 .large{
    font-size: 36px;
  }

  .text-danger{
    color:red;
  }


  .box10 {
    padding: 0.5em 1em;
    margin: 2em 0;
    color: #00BCD4;
    background: #e4fcff;/*背景色*/
    border-top: solid 6px #1dc1d6;
    box-shadow: 0 3px 4px rgba(0, 0, 0, 0.32);/*影*/
  }

  .box10 p {
    margin: 0; 
    padding: 0;
  }

  .box27 {
    position: relative;
    margin: 3em 0;
    padding: 0.5em 1em;
    border: solid 3px #62c1ce;
  }

  .box27 .box-title {
    position: absolute;
    display: inline-block;
    top: -27px;
    left: -3px;
    padding: 0 9px;
    height: 25px;
    line-height: 25px;
    font-size: 17px;
    background: #62c1ce;
    color: #ffffff;
    font-weight: bold;
    border-radius: 5px 5px 0 0;
  }

  .box27 p {
    margin: 0; 
    padding: 0;
  }


  #box2 {
    padding: 0.5em 0em;
    margin: 0em 0em;
    font-weight: bold;
    color: #6091d3;/*文字色*/
    background: #FFF;
    border: solid 3px #6091d3;/*線*/
    border-radius: 10px;/*角の丸み*/
    width : 140px ;
    height : 100px ;
    position: relative;
  }


  #box2r {
    padding: 0.5em 0em;
    margin: 0em 0em;
    font-weight: bold;
    color: red;/*文字色*/
    background: #FFF;
    border: solid 3px red;/*線*/
    border-radius: 10px;/*角の丸み*/
    width : 140px ;
    height : 100px ;
    position: relative;
    
  }

  .block {
    position: absolute;
    top:  0em; /* #contents内の上から何pxか0.1 */
    left: 0.07em; /* #contents内の左から何pxか 0.13*/
    font-size :70pt; /* 枠内の文字の大きさを設定している */
  }

  .box_left {
    color: #FFF;
    width:140px;
    height:100px;
    margin-left:10px;
    float:left;
    background-color:white;
  }

  .box_wrap {
    width:640px;
    height:auto;
    border:1px solid white;
  }

  .clearfix:after {
    display: block;
    clear: both;
    content: "";
  }

 /*　ボタン　*/
  .btn-gradient-radius {
   display: inline-block;
   padding: 7px 20px;
   border-radius: 25px;
   text-decoration: none;
   color: #FFF;
   background-image: linear-gradient(45deg, #FFC107 0%, #ff8b5f 100%);
   transition: .4s;
  }

  .btn-gradient-radius:hover {
   background-image: linear-gradient(45deg, #FFC107 0%, #f76a35 100%);
  }


</style>
