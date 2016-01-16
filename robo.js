/////////////////////////////////////////////////////////////////////
//モジュール名前空間の定義
var robo = require('wiring-pi')

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

/////////////////////////////////////////////////////////////////////
//クラス宣言
/*
#define LEFT_GO_PIN		17
#define LEFT_DIR_PIN	 4
#define RIGHT_GO_PIN	10
#define RIGHT_DIR_PIN	25
#define SW1_PIN			11
#define SW2_PIN			 9
#define LED1_PIN		 7
#define LED2_PIN		 8
#define OC1_PIN			22
#define OC2_PIN			21

#define LEFT_FORWARD   1
#define LEFT_BACKWARD  0
#define RIGHT_FORWARD  0 //(+/- reversed)
#define RIGHT_BACKWARD 1 //(+/- reversed)
#define MOTOR_WAIT_MAX 50

#define DEBUG_MOTOR_OFF	0  //! motor off when ture.
*/
robo.DEBUG_MOTOR_OFF = 1;	//デバッグ時にモーターを動作させる(0), させない(1)


robo.Tank = function()
{
	this.x = 0;
	this.y = 0;
	this.w = 0;
	this.h = 0;
	this.children = new Array();
}

robo.Tank.prototype.addChild = function(o)
{
	this.children.push(o);
};

robo.Tank.prototype.debug = function(msg)
{
	console.log(msg);
}

robo.Tank.prototype.init = function()
{
	timeout(50);

	if(wiringPiSetupGpio() == -1)
	{
		debug("error.");
		return 1;
	}
	else
	{
		debug("GPIO setup ok.");
	}

	//Set up GPIO port
	pinMode (LEFT_DIR_PIN , OUTPUT);
	pinMode (LEFT_GO_PIN  , OUTPUT);
	pinMode (RIGHT_DIR_PIN, OUTPUT);
	pinMode (RIGHT_GO_PIN , OUTPUT);
	pinMode (LED1_PIN, OUTPUT);
	pinMode (LED2_PIN, OUTPUT);

	//Reset morter direction
	digitalWrite(LEFT_DIR_PIN,  LEFT_FORWARD);
	digitalWrite(RIGHT_DIR_PIN, RIGHT_FORWARD);

	//Reset LED status
	digitalWrite(LED1_PIN, 0);
	digitalWrite(LED2_PIN, 0);

	return 0;
}

/**
 * finalize
 */
robo.Tank.prototype.delete = function()
{
}

robo.Tank.prototype.motor_set = function(left, right, msec)
{
	//cap maximun length for motor ON
	if (msec >= MOTOR_WAIT_MAX)
	{
		msec = MOTOR_WAIT_MAX;
	}

	//motor direction
	if (left >=0)
	{
		digitalWrite(LEFT_DIR_PIN,  LEFT_FORWARD);
	}
	else
	{
		digitalWrite(LEFT_DIR_PIN,  LEFT_BACKWARD);
		left = -left;
	}
	if (right >= 0)
	{
		digitalWrite(RIGHT_DIR_PIN, RIGHT_FORWARD);
	}
	else
	{
		digitalWrite(RIGHT_DIR_PIN, RIGHT_BACKWARD);
		right = -right;
	}
/*
#if !DEBUG_MOTOR_OFF
	for (int cnt = 0; cnt < 10; cnt++)
	{
		digitalWrite(LEFT_GO_PIN,  left);
		digitalWrite(RIGHT_GO_PIN, right);	
		delay(msec);
		digitalWrite(LEFT_GO_PIN,  0);
		digitalWrite(RIGHT_GO_PIN, 0);	
		delay(MOTOR_WAIT_MAX - msec);
	}
#endif
*/
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
