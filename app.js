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

//TODO
var env_token = '';
var corp_id = 'dinga6294718083c0cdb35c2f4657eb6378f';


//封装使用AES加密的方法
// function aesEncrept(data, key, iv){
// 　　//实例化一个cipher加密对象，使用aes192进行加密，key作为密钥
// 　　const cipher = crypto.createCipher("aes192",key);
// 　　//使用cipher对data进行加密，源数据类型为utf-8，输出数据类型为hex
// 　　let crypted = cipher.update(data, "utf-8", "hex");
// 　　crypted += cipher.final("hex");
// 　　return crypted;
// }

//获取token
function getToken(func){
    HttpUtils.get("/gettoken", {
        "appkey": config.appkey,
        "appsecret": config.appsecret,
    }, function(err, body) {
        if (!err) {
            var accessToken = body.access_token;
			env_token = accessToken;
            func(accessToken);
        } else{
            console.error('获取access_token失败');
        }
    })
}

//解码
function dddecode(dataStr, encodingKey){
    encodingKey += '=';
	var raw_key = crypto.enc.Base64.parse(encodingKey);
    var key = crypto.enc.Latin1.stringify(raw_key);
	console.log('length:' + key.length);
	//var key = raw_key.toString(crypto.enc.Utf8);
    console.log('key:' + key);
    var iv = key.slice(0, 16);
    const decipher = crypto.AES.decrypt(dataStr, raw_key, {
        mode: crypto.mode.CBC,
        padding: crypto.pad.Pkcs7,
        iv: crypto.enc.Latin1.parse(iv),
    });

    var res = crypto.enc.Utf8.stringify(decipher).toString();
    return res;
}

function numberTo32Buf(number){
//	var arr = new Int32Array(number);
//	return arr.toString();
	var buf = Buffer.alloc(32);
	buf.writeInt32BE(64);
	return buf;
}

//编码
function ddencode(msg, corpid){
	var randomChar = '1234567887654321';
	var buf1 = Buffer.from(randomChar, 'latin1');
	var buf2 = Buffer.alloc(32);
	buf2.writeInt32BE(msg.length);
	var buf3 = Buffer.from(msg, 'utf8');
	var buf4 = Buffer.from(corpid, 'latin1');
	var buf = Buffer.concat([buf1, buf2, buf3, buf4]);
	return buf.toString();
}

//签名
function signature(token, timestamp, nonce, encrypt){
	var arr = [token, timestamp, nonce, encrypt];
	arr.sort();
	var str = arr[0] + arr[1] + arr[2] + arr[3];
	return str;
}

console.log('test:' + ddencode('success', '1dsfsdfsdf'));

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
	var encrypt = ddencode('success', corp_id);
	var date = new Date();
	var timestamp = Date.parse() / 1000 + '';
	var nonce = '123421';
	var sig = signature(env_token, timestamp, nonce, encrypt);
	res.send({
		msg_signature: sig,
		timeStamp: timestamp,
		nonce: nonce,
		encrypt: encrypt
	});
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
