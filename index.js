var express = require('express');
var app  = express();
var http = require('http').Server(app);
var io   = require('socket.io')(http);
var fs   = require('fs');
var path = require('path');
var robo = require('./robo.js')

//子プロセス生成、raspistillプロセス保持用
var spawn = require('child_process').spawn;
var proc;

//Node.jsの起動Pathをルートフォルダとして設定する。
app.use('/', express.static(path.join(__dirname, 'stream')));
//ルートディレクトリへのHTTPリクエストがきたら、index.htmlへのPathを返す。
app.get('/', function(req, res) { res.sendFile(__dirname + '/index.html'); });

var sockets = {};
var dir = "";

//クライアントからSocket接続があった場合の処理
io.on('connection', function(socket) {
 
  //連想配列にオブジェクトを記録しつつLog出力する。
  sockets[socket.id] = socket;
  console.log("Total clients connected : ", Object.keys(sockets).length);
 
  //Socket切断時の処理
  socket.on('disconnect', function() {

    //オブジェクトを削除する。
    delete sockets[socket.id];
    //誰からもStream監視されていないならカメラプロセスを終了し、ファイル監視もやめる。
    if (Object.keys(sockets).length == 0) {
      app.set('watchingFile', false);
      if (proc) proc.kill();
      fs.unwatchFile('./stream/image_stream.jpg');
    }
  });
 
  //クライアントからのStream開始要求ならストリーム配信を開始する。
  socket.on('start-stream', function() {
    startStreaming(io);
  });

  //クライアントからのmove-XXX要求ならRoboを動作させる。
  socket.on('move-FW', function() {
    dir = "move-FW";
    console.log('move FW.');
  });
  socket.on('move-FL', function() {
    dir = "move-FW";
    console.log('move FL.');
  });
  socket.on('move-TL', function() {
    dir = "move-TL";
    console.log('move TL.');
  });
  socket.on('move-TR', function() {
    dir = "move-TR";
    console.log('move TR.');
  });
  socket.on('move-FR', function() {
    dir = "move-FR";
    console.log('move FR.');
  });
  socket.on('move-BK', function() {
    dir = "move-BK";
    console.log('move BK.');
  });

  //クライアントからのStop要求ならRoboの動作を全停止する。
  socket.on('stop-All', function() {
    console.log('stop-All');
  });
});

//HTTPサーバーとして動作開始する。
http.listen(3000, function() {
  console.log('listening on *:3000');
});

//ストリーム停止処理（未使用）
function stopStreaming() {
  //誰からもStream監視されていないならカメラプロセスを終了し、ファイル監視もやめる。
  if (Object.keys(sockets).length == 0) {
    app.set('watchingFile', false);
    if (proc) proc.kill();
    fs.unwatchFile('./stream/image_stream.jpg');
  }
}

//ストリーム開始処理
function startStreaming(io) {
  
  //ファイル監視状態の場合
  if (app.get('watchingFile')) {
    io.sockets.emit('liveStream', 'image_stream.jpg?_t=' + (Math.random() * 100000));
    console.log('File stream start.');
    return;//ここでreturnして以降の処理をしない。
  }

/*
  //raspistillプロセスを起動する
  var args = [
  	"-w", "320",                         //幅
  	"-h", "240",                         //高
  	"-o", "./stream/image_stream.jpg",   //ファイルパスとファイル名
  	"-t", "999999999",                   //撮影回数（＝無限）
  	"-tl", "100",                        //撮影間隔(msec)
  	"-rot", "270",                       //回転角（カメラ取り付けに合わせる）
  ];
  proc = spawn('raspistill', args);
*/
  //fswebcamプロセスを起動する
  var args = [
  	"-l", "-1",                             //繰り返し撮影（1sec毎）
  	"-r", "640x480",                       //入力サイズ
  	"--scale", "800x600",                  //出力サイズ
  	"--set", "brightness=75%",             //輝度補正（%)
  	"--font", "courier:20",                //フォント指定
  	"--title", "TEST",                     //下部バナーの文字列
  	"--save", "./stream/image_stream.jpg", //ファイルパスとファイル名
  ];
  proc = spawn('fswebcam', args);

  console.log('Watching for changes...');
 
  //ファイル監視状態フラグを立てる
  app.set('watchingFile', true);
 
  //raspistillプロセスが画像キャプチャし、ファイルが更新された場合には接続している
  //ソケット群に対して'liveStream'通知をURL形式と乱数をGETに混ぜて送信する。
  fs.watchFile('./stream/image_stream.jpg', function(current, previous) {
    io.sockets.emit('liveStream', 'image_stream.jpg?_t=' + (Math.random() * 100000));
    console.log('File changed.');
  })
 
}
