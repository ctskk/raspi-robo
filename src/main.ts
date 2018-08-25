import * as fs from 'fs';
import * as path from 'path';
import * as http from 'http';
import * as socketIo from 'socket.io';
import * as express from 'express';
import {spawn} from 'child_process';

import {robo} from './robo';

// class RoboServer

const app = express();
const io = socketIo();

//Node.jsの起動PathをHTTPのルートフォルダとして設定する。
app.use('/', express.static(path.join(__dirname, 'stream')));
console.log(__dirname);
//ルートディレクトリへのHTTPリクエストがきたら、index.htmlへのPathを返す。
app.get('/', (req, res) => { res.sendFile(__dirname + '/index.html'); });
//使用するポート番号の設定
app.set('port', process.env.PORT || 3000);

//HTTPサーバーとして動作開始する。
const server = http.createServer(app).listen(app.get('port'), () =>
{
	console.log('listening on *:' + app.get('port'));
});

//WebSocketの生成;
const websocket = io.listen(server);
//接続ソケット管理用配列
const sockets = {};
//子プロセス生成、raspistillプロセス保持用
let proc;

//roboインスタンス生成
// const tank = new robo();

//クライアントからSocket接続があった場合の処理
websocket.on('connection', socket => 
{
	//連想配列にオブジェクトを記録しつつLog出力する。
	sockets[socket.id] = socket;
	console.log("Total clients connected : ", Object.keys(sockets).length);

	//Socket切断時の処理
	socket.on('disconnect', () =>
	{
		//オブジェクトを削除する。
		delete sockets[socket.id];

		//誰からもStream監視されていないならカメラプロセスを終了し、ファイル監視もやめる。
		if (Object.keys(sockets).length == 0) {
			app.set('watchingFile', false);
			if (proc) { proc.kill(); }
			fs.unwatchFile('./stream/image_stream.jpg');
		}
	});

	//クライアントからのStream開始要求ならストリーム配信を開始する。
	socket.on('start-stream', () =>
	{
		startStreaming(io);
	});

	//クライアントからのmove-XXX要求ならRoboを動作させる。
	socket.on('move-FW', () =>
	{
		// tank.motor_forward(50);
		console.log('move FW.');
	});
	socket.on('move-FL', () =>
	{
		// tank.motor_turn_left(50);
		console.log('move FL.');
	});
	socket.on('move-TL', () =>
	{
		// tank.motor_rotate_left(50);
		console.log('move TL.');
	});
	socket.on('move-TR', () =>
	{
		// tank.motor_rotate_right(50);
		console.log('move TR.');
	});
	socket.on('move-FR', () =>
	{
		// tank.motor_trun_right(50);
		console.log('move FR.');
	});
	socket.on('move-BK', () =>
	{
		// tank.motor_backward(50);
		console.log('move BK.');
	});

	//クライアントからのStop要求ならRoboの動作を全停止する。
	socket.on('stop-All', () =>
	{
		// tank.motor_stop();
		console.log('stop-All');
	});
});

//ストリーム停止処理（未使用）
function stopStreaming(): void
{
	//誰からもStream監視されていないならカメラプロセスを終了し、ファイル監視もやめる。
	if (Object.keys(sockets).length == 0)
	{
		app.set('watchingFile', false);
		if (proc) proc.kill();
		fs.unwatchFile('./stream/image_stream.jpg');
	}
}

//ストリーム開始処理
function startStreaming(io: socketIo.Server): void
{
	//ファイル監視状態の場合
	if (app.get('watchingFile'))
	{
		io.sockets.emit('liveStream', 'image_stream.jpg?_t=' + (Math.random() * 100000));
		console.log('File stream start.');
		return;//ここでreturnして以降の処理をしない。
	}

	//raspistillプロセスを起動する
	var args = [
		"-w", "320",                         //幅
		"-h", "240",                         //高
		"-o", "./stream/image_stream.jpg",   //ファイルパスとファイル名
		"-t", "999999999",                   //撮影回数（＝無限）
		"-tl", "1000",                        //撮影間隔(msec)
		"-rot", "270",                       //回転角（カメラ取り付けに合わせる）
	];
	proc = spawn('raspistill', args);

	// fswebcamプロセスを起動する
	// var args = [
	// 	"-l", "-1",                             //繰り返し撮影（1sec毎）
	// 	"-r", "640x480",                       //入力サイズ
	// 	"--scale", "800x600",                  //出力サイズ
	// 	"--set", "brightness=75%",             //輝度補正（%)
	// 	"--font", "courier:20",                //フォント指定
	// 	"--title", "TEST",                     //下部バナーの文字列
	// 	"--save", "./stream/image_stream.jpg", //ファイルパスとファイル名
	// ];
	// proc = child.spawn('fswebcam', args);

	console.log('Watching for changes...');

	//ファイル監視状態フラグを立てる
	app.set('watchingFile', true);

	//raspistillプロセスが画像キャプチャし、ファイルが更新された場合には接続している
	//ソケット群に対して'liveStream'通知をURL形式と乱数をGETに混ぜて送信する。
	fs.watchFile('./stream/image_stream.jpg', function(current, previous)
	{
		io.sockets.emit('liveStream', 'image_stream.jpg?_t=' + (Math.random() * 100000));
		console.log('File changed.');
	})
}
