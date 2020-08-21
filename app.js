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

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(cookieParser());

HttpUtils = new httpReq(config.oapiHost);

//"use strict";
const crypto = require("crypto-js");

//封装使用AES加密的方法
// function aesEncrept(data, key, iv){
// 　　//实例化一个cipher加密对象，使用aes192进行加密，key作为密钥
// 　　const cipher = crypto.createCipher("aes192",key);
// 　　//使用cipher对data进行加密，源数据类型为utf-8，输出数据类型为hex
// 　　let crypted = cipher.update(data, "utf-8", "hex");
// 　　crypted += cipher.final("hex");
// 　　return crypted;
// }

//封装对应的AES解密方法
function aesDecrept(dataStr, encodingKey) {
    console.log('length：' + encodingKey.length);
    var raw_key = crypto.enc.Base64.parse(encodingKey);
    var key = raw_key.toString(crypto.enc.Utf8);
    console.log('key:' + key);
    var iv = key.slice(0, 16);
    const decipher = crypto.AES.decrypt(dataStr, key,{
        mode: crypto.mode.CBC,
        padding: crypto.pad.Pkcs7,
        iv: crypto.enc.Utf8.parse(iv),
    });

    const res = crypto.enc.Utf8.stringify(decipher).toString();
    return res;

    // var decipher = crypto.createDecipher("aes-128-cbc", key, iv);
    // var cipherChunks = [];

    // decipher.setAutoPadding(true);
    // cipherChunks.push(decipher.update(dataStr, 'base64', 'utf8'));
    // cipherChunks.push(decipher.final('utf8'));
    // return cipherChunks.join('');
}


//获取token
function getToken(func){
    HttpUtils.get("/gettoken", {
        "appkey": config.appkey,
        "appsecret": config.appsecret,
    }, function(err, body) {
        if (!err) {
            var accessToken = body.access_token;
            func(accessToken);
        } else{
            console.error('获取access_token失败');
        }
    })
}

//解码
function dddecode(str, encoding_aeskey){
    encoding_aeskey += '=';
    // console.log('encoding length:' + encoding_aeskey.length);
    // var aes_key = new Buffer(encoding_aeskey, 'base64').toString();
    // console.log('aes_key:' + aes_key + ' ' + aes_key.length)
    // iv = aes_key.slice(0, 16);
    // console.log('str:' + str);
    return aesDecrept(str, encoding_aeskey);
}

function regCallback(){
    getToken(function(accessToken){
        HttpUtils.post("/call_back/register_call_back", {
            'access_token' : accessToken
        }, {
            'call_back_tag': ['attendance_check_record'],
            'token': 'abcdef',
            'aes_key': 'xxxxxxxxlvdhntotr3x9qhlbytb18zyz5zxxxxxxxxx',
            'url': 'http://218.90.4.230:3000/callback',
        }, function(err, body){
            if(err){
                console.error('注册回调失败');
            }else{
				console.log('注册回调成功:' + body);
			}
        });
    });
}

app.use('/callback', function(req, res){
    console.log(req.body);
    var data = dddecode(req.body.encrypt, 'xxxxxxxxlvdhntotr3x9qhlbytb18zyz5zxxxxxxxxx');
    console.log('answer:' + data.length + ' ' + data);
    // if (!err) {
    //     console.log('get cb res success:');
    // }else{
    //     console.error('cb err');
    // }
});

regCallback();

// 获取用户信息
app.use('/login', function(req, res) {
    // 获取access_token
    HttpUtils.get("/gettoken", {
        "appkey": config.appkey,
        "appsecret": config.appsecret,
    }, function(err, body) {
        if (!err) {
            var code = req.body.authCode;
            var accessToken = body.access_token;
            //获取用户id 
            HttpUtils.get("/user/getuserinfo", {
                "access_token": accessToken,
                "code": code,
            }, function(err2, body2) {
                if (!err2) {
                    //获取用户详细信息
                    HttpUtils.get("/user/get", {
                        "access_token": accessToken,
                        "userid": body2.userid,
                    }, function(err3, body3) {
                        if (!err3) {
                            res.send({
                                result: {
                                    userId: body2.userid,
                                    userName: body3.name
                                }
                            });
                        } else {
                            console.error('获取用户信息失败');
                        }
                        
                    });
                } else {
                    console.error('获取用户id失败');
                }
               
            });
        } else {
            console.error('获取access_token失败');
        }
    });

});

app.use(function(req, res, next) {
  res.send('welcome')
});

module.exports = app;
