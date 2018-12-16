const express = require('express');
const formidable = require('formidable');
const crypto = require('crypto');
const querystring = require('querystring');
const path = require('path');
const fs = require('fs');
const app = express();
const port = 3300;
const http = require('http').Server(app);
const io = require('socket.io')(http);
//allow custom header and CORS
app.all('*',function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild');
    res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');

    if (req.method == 'OPTIONS') {
        res.send(200); /让options请求快速返回/
    }
    else {
        next();
    }
});
app.use("/download",express.static('./uploadfile'));
app.get('/',(req,res)=>{
    res.sendFile(__dirname + '/index.html');
});
app.post('/',(req,res)=>{
    res.send('Got a POST request');
    let form = new formidable.IncomingForm();
    form.uploadDir = "tmpDir";
    form.keepExtensions = true;
    form.encoding = 'utf-8';
    form.parse(req,function (err, fields, files) {
        let oldpath,newpath;
        try {
	    console.log("temppath: " + files.filepond.path);
	    console.log("name: " + files.filepond.name);
            oldpath = files.filepond.path;
	    let myDate = new Date();
	    let content = files.filepond.name;
	    let extname = path.extname(content);
	    let md5 = crypto.createHash('md5');
	    md5.update(content+myDate.getTime());
	    let d = md5.digest('hex') + extname;
            newpath = 'uploadfile/'+d;
            fs.rename(oldpath, newpath,function(err){
	    	if(err){console.log(err);}
		else{fs.unlink(oldpath,function(){});
			let downloadpath = 'http://149.28.202.19:3300/download/' + d;
			io.emit('GetCurrentPath',{"id":randomWord(true,3,32)});
			io.on('GetCurrentPathBack',(path)=>{
                io.emit('Download',{"id":randomWord(true,3,32),"from":downloadpath,"to":path.path});
            })
		}
	    });
	    
        }catch (e) {
            console.log(e);
        }

    });
    console.log(res);
});
app.post('/phone',(req,res)=>{
    res.send('Got a POST request');
    let form = new formidable.IncomingForm();
    form.uploadDir = "tmpDir";
    form.keepExtensions = true;
    form.encoding = 'utf-8';
    form.parse(req,function (err, fields, files) {
        let oldpath,newpath;
        try {
            console.log("temppath: " + files.filepond.path);
            console.log("name: " + files.filepond.name);
            oldpath = files.filepond.path;
            let myDate = new Date();
            let content = files.filepond.name;
            let extname = path.extname(content);
            let md5 = crypto.createHash('md5');
            md5.update(content+myDate.getTime());
            let d = md5.digest('hex') + extname;
            newpath = 'uploadfile/'+d;
            fs.rename(oldpath, newpath,function(err){
                if(err){console.log(err);}
                else{fs.unlink(oldpath,function(){});
                    let downloadpath = 'http://149.28.202.19:3300/download/' + d;
                    //io.emit('Download',{"id":randomWord(true,3,32),"from":downloadpath,"to":"whatever you want!"});
                }
            });

        }catch (e) {
            console.log(e);
        }

    });
    console.log(res);
});

io.on('connection',(socket)=>{
   
	let fake = "android";
	
        if(fake==='pc'){
            console.log('Identity: '+id);
            io.emit('Pc','Hi PC!');
        }else if(fake==="android"){
            console.log('a Android Device is connected!');
            io.emit('Channel',{"id":randomWord(true,3,32),"response":"your device is connected!please send me your device info!"});
            socket.on('Channel',(info)=>{
                //let deviceInfo = querystring.parse(info);
                //console.log(deviceInfo);
                io.emit('ChannelBack',"Successfully connected!");
                io.emit('BrowserBack',{"connected":true});
            });
	    
	    socket.on('Browser',(info)=>{
		if(info){
	            io.emit('BrowserBack',{"connected":false});
		}	
	    })
	    socket.on('BrowseruploadList',(mission)=>{
		if(mission&&mission.mission==='uploadList'){
		    io.emit('uploadList',{"id":randomWord(true,3,32),"path":mission.path});
		}
	    })
        socket.on('BrowserObtain',(info)=>{
            io.emit('Obtain',{"id":randomWord(true,3,32),"path":info.path});
        })
	    
	    
            io.emit('DebugTool','来自[DebugTool]事件：' +
                '\n' +
                '1.给[Identity]发送uploadList字段' +
                '\n' +
                '2.给[Identity]发送Obtain字段' +
                '\n' +
                '3.给[Identity]发送Download字段');
            socket.on('Identity',(data)=>{
                if(data==='uploadList'){
                    io.emit('DebugTool',{"id":randomWord(true,3,32),"path":"/"});
                }
                if(data==='Obtain'){
                    io.emit('DebugTool',"服务器会给你发送如下Json格式，请直接POST'/'上传文件");
                    io.emit('DebugTool',{"id":randomWord(true,3,32),"path":"../../../test4.mp4"});
                }
                if(data==='Download'){
                    io.emit('DebugTool',"服务器会给你发送如下Json格式，请直接GET'...'上传文件");
                    io.emit('DebugTool',{"id":randomWord(true,3,32)
                        ,"from":"../../../test4.mp4"
                        ,"to":"../../../../test4.mp4"});
                }
            });
            socket.on('uploadList',(list)=>{
                console.log(list);
	        io.emit('BrowserGetList',list);
            });
            socket.on('Obtain',(file)=>{
               
            });
            socket.on('Download',(file)=>{
                
            });
       }
    
});
app.listen(port,()=>{
    console.log(`Example app listening on port ${port}!`)
});
http.listen(3030, function(){
    console.log('listening on *:3030');
});
randomWord=(randomFlag,min,max)=>{
    let str = "",
        range = min,
        arr = ['0','1','2','3','4','5','6','7','8','9'
            ,'a','b','c','d','e','f','g','h','i','j','k','l','m'
            ,'n','o','p','q','r','s','t','u','v','w','x','y','z'];
    if(randomFlag){
        range = Math.round(Math.random()*(max-min))+min;
    }
    for(let i=0;i<range;i++){
        pos = Math.round(Math.random()*(arr.length-1));
        str += arr[pos];
    }
    return str;
};
