const crypto = require("crypto-js");


//解码
var dddecode = function (dataStr, encodingKey){
    encodingKey += '=';
    var key = crypto.enc.Base64.parse(encodingKey);
    var key_str = crypto.enc.Latin1.stringify(key);
    var iv = key_str.slice(0, 16);
    var decipher = crypto.AES.decrypt(dataStr, key, {
        mode: crypto.mode.CBC,
        padding: crypto.pad.Pkcs7,
        iv: crypto.enc.Latin1.parse(iv),
    });
    var res = crypto.enc.Latin1.stringify(decipher);
    console.log('ressize:' + res.length);
    var msg_length_str = res.slice(16,20);
    var buf = Buffer.from(msg_length_str, 'Latin1');
    var msg_length = buf.readIntBE(0, 4);
    var msg = res.slice(20, 20 + msg_length);
    var msg_latin1 = crypto.enc.Latin1.parse(msg);
    var msg_utf8 = crypto.enc.Utf8.stringify(msg_latin1);
    //console.log('msg:' + msg_utf8);
    // var json = JSON.parse(msg);
    return msg_utf8;
}

//编码
var ddencode = function (msg, corpid, encodingKey){
	var randomChar = '1234567887654321';
	var buf1 = Buffer.from(randomChar, 'utf8');
	var buf2 = Buffer.alloc(4);
	buf2.writeInt32BE(msg.length);
	var buf3 = Buffer.from(msg, 'utf8');
	var buf4 = Buffer.from(corpid, 'utf8');
    var buf = Buffer.concat([buf1, buf2, buf3, buf4]);
    var dataStr = buf.toString('latin1');
    console.log('dataStr:' + dataStr);
    encodingKey += '=';
    var raw_key = crypto.enc.Base64.parse(encodingKey);
    var key = crypto.enc.Latin1.stringify(raw_key);
    var iv = key.slice(0, 16);
    var encrypted = crypto.AES.encrypt(dataStr, raw_key, {
        mode: crypto.mode.CBC,
        padding: crypto.pad.Pkcs7,
        iv: crypto.enc.Latin1.parse(iv),
    });
    return encrypted.toString();
}

//签名
var signature = function (token, timestamp, nonce, encrypt){
    var arr = [token, timestamp, nonce, encrypt];
    console.log(arr);
    arr.sort();
    console.log(arr);
    var str = arr[0] + arr[1] + arr[2] + arr[3];
    console.log('token:' + token);
    console.log('shastr:' + str);
    var hash = crypto.SHA1(str).toString();
    console.log('shahash:' + hash);
	return hash;
}

exports.dddecode = dddecode;
exports.ddencode = ddencode;
exports.signature = signature;