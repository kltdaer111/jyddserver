var httpReq = require('./libs/http');
var express = require('express');
var path = require('path');
var fs = require('fs');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var app = express();
var config = require('./config.default.js');
const Http = require('./libs/http');
var ddcb = require('./func/common/callback_common');
var DDGetToken = require('./func/token/gettoken');
var DDCallback = require('./func/callback/callback')

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(cookieParser());

HttpUtils = new httpReq(config.oapiHost);
JYGetToken = new DDGetToken(HttpUtils, config.appkey, config.appsecret);
JYCallback = new DDCallback('abcdef', config.aes_key, config.corp_url + config.url_call_back);

var env = {};

JYCallback.addTag('attendance_check_record');
JYGetToken.exec(JYCallback.getRegFunc());



// function getWorkerCheck(accessToken){
//     HttpUtils.post("/attendance/list", {
//         'access_token' : accessToken
//     }, {
//         "workDateFrom": "2020-MM-dd HH:mm:ss",
//         "workDateTo": "yyyy-MM-dd HH:mm:ss",
//         "userIdList":["员工UserId列表"],    // 必填，与offset和limit配合使用
//         "offset":0,    // 必填，第一次传0，如果还有多余数据，下次传之前的offset加上limit的值
//         "limit":1,     // 必填，表示数据条数，最大不能超过50条
//     }, function(err, body){
//         if(err){
//             console.error('getWorkerCheck失败');
//         }else{
//             console.log('getWorkerCheck成功:' + body);
//         }
//     });
// });
// }
//获取部门列表
// function getDepList(accessToken){
//     HttpUtils.get("/department/list", {
//         'access_token' : accessToken,
//         'lang': 'zh_CN',
//         'fetch_child': true,
//     }, function(err, body){
//         if(err){
//             console.error('getDepList失败');
//         }else{
//             console.log('getDepList:' + JSON.stringify(body));
//         }
//     });
// };

// function getCallback(accessToken){
//     HttpUtils.get("/call_back/get_call_back", {
//         'access_token' : accessToken,
//     }, function(err, body){
//         if(err){
//             console.error('getCallback失败');
//         }else{
//             console.log('getCallback:' + JSON.stringify(body));
//         }
//     });
// }

//JYGetToken.exec(getDepList);

app.use(config.url_call_back, function(req, res){
    console.log(req.body);
    var data = JSON.parse(ddcb.dddecode(req.body.encrypt, config.appkey));
    console.log('answer:' + JSON.stringify(data));
    switch(data.EventType){
        case undefined:
            console.log('callback parse error');
            console.log(data.EventType);
            return;
        case 'check_url':
            var encrypt = ddcb.ddencode('success', config.corp_id, config.appkey);
            console.log('encrypt:' + encrypt);
            console.log('encrypt length:' + encrypt.length);
            console.log('d-encrypt:'+ ddcb.dddecode(encrypt, config.appkey));
            var timestamp = parseInt(new Date().getTime() / 1000) + '';
            console.log('timestamp:' + timestamp);
            var nonce = '123456';
            var sig = ddcb.signature('abcdef', timestamp, nonce, encrypt);
            var send = {
                msg_signature: sig,
                timeStamp: timestamp,
                nonce: nonce,
                encrypt: encrypt
            };
            console.log('send:' + JSON.stringify(send));
            res.send(JSON.stringify(send));
            JYGetToken.exec(JYCallback.getListFunc());
            break;
        case 'attendance_check_record':
            console.log('回调成功！！！！！！！！！！！！！！！！！！！');
            break;
        default:
            console.log(data.EventType);
    }
});

// regCallback();

// 获取用户信息
// app.use('/login', function(req, res) {
//     // 获取access_token
//     HttpUtils.get("/gettoken", {
//         "appkey": config.appkey,
//         "appsecret": config.appsecret,
//     }, function(err, body) {
//         if (!err) {
//             var code = req.body.authCode;
//             var accessToken = body.access_token;
//             //获取用户id 
//             HttpUtils.get("/user/getuserinfo", {
//                 "access_token": accessToken,
//                 "code": code,
//             }, function(err2, body2) {
//                 if (!err2) {
//                     //获取用户详细信息
//                     HttpUtils.get("/user/get", {
//                         "access_token": accessToken,
//                         "userid": body2.userid,
//                     }, function(err3, body3) {
//                         if (!err3) {
//                             res.send({
//                                 result: {
//                                     userId: body2.userid,
//                                     userName: body3.name
//                                 }
//                             });
//                         } else {
//                             console.error('获取用户信息失败');
//                         }
                        
//                     });
//                 } else {
//                     console.error('获取用户id失败');
//                 }
               
//             });
//         } else {
//             console.error('获取access_token失败');
//         }
//     });

// });

// app.use(function(req, res, next) {
//   res.send('welcome')
// });

module.exports = app;
