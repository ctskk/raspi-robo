/////////////////////////////////////////////////////////////////////
//モジュール名前空間の定義
var wpi = require('wiring-pi')

var robo;
if (!robo)
{
	robo = {};
}
else
{
	if (typeof robo != "object")
	{
		throw new Error("robo already exists.");
	}
}

/////////////////////////////////////////////////////////////////////
//モジュールプロパティ

robo.NAME    = "ROBO";
robo.VERSION = "0.1";

//RaspberryPi(2)とモータードライバ間のピンアサイン(WiringPI版)
//wiringPiSetup()で初期化する
/*
robo.LEFT_GO_PIN	=  0;
robo.LEFT_DIR_PIN	=  7;
robo.RIGHT_GO_PIN	= 12;
robo.RIGHT_DIR_PIN	=  6;
robo.SW1_PIN		= 14;
robo.SW2_PIN		= 13;
robo.LED1_PIN		= 11;
robo.LED2_PIN		= 10;
robo.OC1_PIN		=  3;
robo.OC2_PIN		=  2;
*/

//RaspberryPi(2)とモータードライバ間のピンアサイン(Broadcom GPIO版)
//wiringPiSetupGpio()で初期化する
robo.LEFT_GO_PIN	= 17;
robo.LEFT_DIR_PIN	=  4;
robo.RIGHT_GO_PIN	= 10;
robo.RIGHT_DIR_PIN	= 25;
robo.SW1_PIN		= 11;
robo.SW2_PIN		=  9;
robo.LED1_PIN		=  7;
robo.LED2_PIN		=  8;
robo.OC1_PIN		= 22;
robo.OC2_PIN		= 21;//(Rev1:21, Rev2:27)

//クラス内で使用するマジックナンバーの定義(モーター回転方向の極性による)
robo.LEFT_FORWARD   =  1;
robo.LEFT_BACKWARD  =  0;
robo.RIGHT_FORWARD  =  0;    //(+/- reversed)
robo.RIGHT_BACKWARD =  1;    //(+/- reversed)
robo.MOTOR_WAIT_MAX = 50;

//デバッグ用のフラグ
robo.DEBUG_MOTOR_OFF = 1;   //デバッグ時にモーターを動作させる(0), させない(1)


/////////////////////////////////////////////////////////////////////
//クラス宣言

robo.Tank = function()
{
}

robo.Tank.prototype.debug = function(msg)
{
	console.log(msg);
}

/**
 * Initialize
 */
robo.Tank.prototype.init = function()
{
	//wpi.timeout(50);

	if(wpi.wiringPiSetupGpio() == -1)
	{
		this.debug("Setup error.");
		return 1;
	}
	else
	{
		this.debug("GPIO setup ok.");
	}

	//Set up GPIO port
	wpi.pinMode(robo.LEFT_DIR_PIN , wpi.OUTPUT);
	wpi.pinMode(robo.LEFT_GO_PIN  , wpi.OUTPUT);
	wpi.pinMode(robo.RIGHT_DIR_PIN, wpi.OUTPUT);
	wpi.pinMode(robo.RIGHT_GO_PIN , wpi.OUTPUT);
	wpi.pinMode(robo.LED1_PIN,      wpi.OUTPUT);
	wpi.pinMode(robo.LED2_PIN,      wpi.OUTPUT);

	//Reset morter direction
	wpi.digitalWrite(robo.LEFT_DIR_PIN,  robo.LEFT_FORWARD);
	wpi.digitalWrite(robo.RIGHT_DIR_PIN, robo.RIGHT_FORWARD);

	//Reset LED status
	wpi.digitalWrite(robo.LED1_PIN, 0);
	wpi.digitalWrite(robo.LED2_PIN, 0);

	return 0;
}

/**
 * finalize
 */
robo.Tank.prototype.delete = function()
{
}

/**
 * モーターを回転させる
 * @param left  左車輪側のパルスの大きさ（現状1のみ）と方向（符号）によりモータを回転させる
 * @param right 右車輪側のパルスの大きさ（現状1のみ）と方向（符号）によりモータを回転させる
 * @param msec  モーターONする時間(msec). MOTOR_WAIT_MAXを上限とする。
 */
robo.Tank.prototype.motor_set = function(left, right, msec)
{
	//cap maximun length for motor ON
	if (msec >= robo.MOTOR_WAIT_MAX)
	{
		msec = robo.MOTOR_WAIT_MAX;
	}

	//motor direction
	if (left >=0)
	{
		wpi.digitalWrite(robo.LEFT_DIR_PIN,  robo.LEFT_FORWARD);
	}
	else
	{
		wpi.digitalWrite(robo.LEFT_DIR_PIN,  robo.LEFT_BACKWARD);
		left = -left;//digitalWriteの引数にするため符号を正にする
	}
	if (right >= 0)
	{
		wpi.digitalWrite(robo.RIGHT_DIR_PIN, robo.RIGHT_FORWARD);
	}
	else
	{
		wpi.digitalWrite(robo.RIGHT_DIR_PIN, robo.RIGHT_BACKWARD);
		right = -right;//digitalWriteの引数にするため符号を正にする
	}

    if (robo.DEBUG_MOTOR_OFF)
    {
        for (var cnt = 0; cnt < 10; cnt++)
        {
            wpi.digitalWrite(robo.LEFT_GO_PIN,  left);
            wpi.digitalWrite(robo.RIGHT_GO_PIN, right);	
            wpi.delay(msec);
            wpi.digitalWrite(robo.LEFT_GO_PIN,  0);
            wpi.digitalWrite(robo.RIGHT_GO_PIN, 0);	
            wpi.delay(robo.MOTOR_WAIT_MAX - msec);
        }
    }
}

robo.Tank.prototype.motor_forward = function(msec/* = 50*/)
{
	//Set both Left and Right forward.
	this.motor_set(1, 1, msec);
}

robo.Tank.prototype.motor_backward = function(msec/* = 18*/)
{
	//Set both Left and Right backward.
	this.motor_set(-1, -1, msec);
}

robo.Tank.prototype.motor_rotate_right = function(msec/* = 18*/)
{
	//Set Left forward, Right backward.
	this.motor_set(1, -1, msec);
}

robo.Tank.prototype.motor_rotate_left = function(msec/* = 18*/)
{
	//Set Left backward, Right forward.
	this.motor_set(-1, 1, msec);
}

robo.Tank.prototype.motor_stop = function(msec/* = 0*/)
{
	//motor stop.
	this.motor_set(0, 0, msec);
}

robo.Tank.prototype.keyHandle = function()
{
	
}

/**
 * モジュール初期化コード
 */
(function()
{
})//();
