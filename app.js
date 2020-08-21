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

function regCallback(){
    getToken(function(accessToken){
        HttpUtils.post("/call_back/register_call_back?access_token=" + accessToken, {
            'call_back_tag': ['attendance_check_record'],
            'token': 'abcdef',
            'aes_key': 'abcdefghijklmnopqrstuvwxyz12345678912345678',
            'url': 'http://218.90.4.230:3000/callback',
        }, function(err, body){
            if(err){
                console.error('注册回调失败');
            }else{
				console.log('注册回调成功');
			}
        });
    });
}

app.use('/callback', function(err, body){
    if (!err) {
        console.log('get cb res success:');
    }else{
        console.error('cb err');
    }
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
