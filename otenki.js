const rp = require('request-promise')
const JSONFILEPATH="./otenki.json"
const fs = require('fs')
const express = require('express')
const bodyParser = require('body-parser')
const app = express()
app.use(bodyParser.json())

app.listen(4000, function () {console.log("port 4000 listen")} );


LOCATION='340010'


//CORSポリシーを無効にしている。
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });


//sendRequestは、外部APIよりデータを取得する非同期関数。Promiseを返す。
const sendRequest = (method, uri, body) => {
    const options = { method, uri, body, json: true }
     return rp(options)
       .then(  body => {
            console.log(body) //APIから返却された値を表示する。
            var jsondat = JSON.stringify( body ); //辞書型形式データをJSON形式データに変換する。
        if (fs.existsSync(JSONFILEPATH)) fs.unlinkSync(JSONFILEPATH)   //すでに同一ファイルが存在するときは一旦削除する。
        //テキストファイルに書き出しを行う。関数sendRequest内で取得したデータは変数のままでは関数外に持ち出せないので一旦テキストファイルに書き出しをする。
        fs.writeFileSync(JSONFILEPATH,jsondat)
    } )
       .catch( err => {
        switch(err.statusCode){
            case 404:
                // NOT FOUND Process
                break;
            default:
                // Other Error Process
                break;
            }
        })
}
    
 
//外部APIよりお天気データを取得する。
const getotenki = async (location) => {
    var info_otenki = await sendRequest('GET', 'http://weather.livedoor.com/forecast/webservice/json/v1?city=' + location)
  }


//フロントエンドからgetアクセスがあった場合、関数getotenkiを実行することでAPIよりデータを取得。取得したデータをフロントエンドに返す。
app.get('/otenkiget', function(req, res) {

    getotenki(LOCATION)  //APIからお天気データを取得する。PROMISEを返す。
    let jsondat=fs.readFileSync(JSONFILEPATH,'utf-8')  //テキストファイルからJSONデータを読みだす。
    let retjson=JSON.parse( jsondat ); //JSONデータ -> 辞書型形式データに変換する。

    res.send({
        message:          
        {
         "mes":"success",
         "otenkidat":[
            retjson,
                  ]
        }          
       
  })
  console.log("FINISHED")
})