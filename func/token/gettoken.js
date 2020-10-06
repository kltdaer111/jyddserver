

function DDGetToken(HttpUtils, appkey, appsecret) {
    this.HttpUtils = HttpUtils;
    this.appkey = appkey;
    this.appsecret = appsecret;
    this.token = undefined;
}

//获取token后执行func
DDGetToken.prototype.exec = function(func){
    var self = this;
    self.HttpUtils.get("/gettoken", {
        "appkey": self.appkey,
        "appsecret": self.appsecret,
    }, function(err, body) {
        if (!err) {
            self.token = body.access_token;
            if(func != undefined){
                func(self.token);
            }
        } else{
            console.error('获取access_token失败');
        }
    });
}

DDGetToken.prototype.getToken = function(){
    if(this.token == undefined){
        this.exec();
    }
    else{
        return this.token;
    }
}

module.exports = DDGetToken;