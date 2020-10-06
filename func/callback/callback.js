
function DDCallback(token, aes_key, url){
    this.token = token;
    this.aes_key = aes_key;
    this.url = url;
    this.call_back_tag = [];
    // this.para = {
    //     token : token,
    //     aes_key : aes_key,
    //     url : url,
    //     call_back_tag : [],
    // }
}

DDCallback.prototype.addTag = function(tag){
    this.call_back_tag.push(tag);
    // this.para.call_back_tag.push(tag);
}

DDCallback.prototype.getRegFunc = function(){
    var self = this;
    return function(accessToken){
        HttpUtils.post("/call_back/register_call_back", {
            'access_token' : accessToken
        }, {
            'call_back_tag': self.call_back_tag,
            'token': self.token,
            'aes_key': self.aes_key,
            'url': self.url,
        }, function(err, body){
            if(err){
                console.error('regCallback失败');
            }else{
                console.log('regCallback:' + JSON.stringify(body));
            }
        });
    }
}

DDCallback.prototype.getListFunc = function(){
    return function(accessToken){
        HttpUtils.get("/call_back/get_call_back", {
            'access_token' : accessToken,
        }, function(err, body){
            if(err){
                console.error('getCallback失败');
            }else{
                console.log('getCallback:' + JSON.stringify(body));
            }
        });
    }
}

// function regCallback(accessToken){
//     HttpUtils.post("/call_back/register_call_back", {
//         'access_token' : accessToken
//     }, {
//         'call_back_tag': ['attendance_check_record'],
//         'token': 'abcdef',
//         'aes_key': 'xxxxxxxxlvdhntotr3x9qhlbytb18zyz5zxxxxxxxxx',
//         'url': 'http://139.196.211.108:3000/callback',
//     }, function(err, body){
//         if(err){
//             console.error('regCallback失败');
//         }else{
//             console.log('regCallback:' + body);
//         }
//     });
// }

module.exports = DDCallback;