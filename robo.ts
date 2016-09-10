import wpi = require('wiring-pi');

/**
 * サーボ制御クラス
 */
export class robo 
{
	//RaspberryPi(2)とモータードライバ間のピンアサイン(WiringPI版)
	//wiringPiSetup()で初期化する
	/*
	LEFT_GO_PIN		=  0;
	LEFT_DIR_PIN	=  7;
	RIGHT_GO_PIN	= 12;
	RIGHT_DIR_PIN	=  6;
	SW1_PIN			= 14;
	SW2_PIN			= 13;
	LED1_PIN		= 11;
	LED2_PIN		= 10;
	OC1_PIN			=  3;
	OC2_PIN			=  2;
	*/

	//RaspberryPi(2)とモータードライバ間のピンアサイン(Broadcom GPIO版)
	//wiringPiSetupGpio()で初期化する
	LEFT_GO_PIN		= 17;
	LEFT_DIR_PIN	=  4;
	RIGHT_GO_PIN	= 10;
	RIGHT_DIR_PIN	= 25;
	SW1_PIN			= 11;
	SW2_PIN			=  9;
	LED1_PIN		=  7;
	LED2_PIN		=  8;
	OC1_PIN			= 22;
	OC2_PIN			= 21;//(Rev1:21, Rev2:27)

	//クラス内で使用するマジックナンバーの定義(モーター回転方向の極性による)
	LEFT_FORWARD   =  1;
	LEFT_BACKWARD  =  0;
	RIGHT_FORWARD  =  0;    //(+/- reversed)
	RIGHT_BACKWARD =  1;    //(+/- reversed)
	MOTOR_WAIT_MAX = 50;

	//デバッグ用のフラグ
	DEBUG_MOTOR_OFF = 1;   //デバッグ時にモーターを動作させる(0), させない(1)

	//コンストラクタ
	constructor() {
		
		//WiringPiの初期化
		if(wpi.wiringPiSetupGpio() == -1)
		{
			console.log("[SRV] Setup error.");
		}
		else
		{
			console.log("[SRV] GPIO setup ok.");
		}

		//Set up GPIO port
		wpi.pinMode(this.LEFT_DIR_PIN , wpi.OUTPUT);
		wpi.pinMode(this.LEFT_GO_PIN  , wpi.OUTPUT);
		wpi.pinMode(this.RIGHT_DIR_PIN, wpi.OUTPUT);
		wpi.pinMode(this.RIGHT_GO_PIN , wpi.OUTPUT);
		wpi.pinMode(this.LED1_PIN,      wpi.OUTPUT);
		wpi.pinMode(this.LED2_PIN,      wpi.OUTPUT);

		//Reset morter direction
		wpi.digitalWrite(this.LEFT_DIR_PIN,  this.LEFT_FORWARD);
		wpi.digitalWrite(this.RIGHT_DIR_PIN, this.RIGHT_FORWARD);

		//Reset LED status
		wpi.digitalWrite(this.LED1_PIN, 0);
		wpi.digitalWrite(this.LED2_PIN, 0);
	}

	public debug(msg) : void
	{
		console.log(msg);
	}

	/**
	 * モーターを回転させる
	 * @param left  左車輪側のパルスの大きさ（現状1のみ）と方向（符号）によりモータを回転させる
	 * @param right 右車輪側のパルスの大きさ（現状1のみ）と方向（符号）によりモータを回転させる
	 * @param msec  モーターONする時間(msec). MOTOR_WAIT_MAXを上限とする。
	 */
	public motor_set(left, right, msec)
	{
		//cap maximun length for motor ON
		if (msec >= this.MOTOR_WAIT_MAX)
		{
			msec = this.MOTOR_WAIT_MAX;
		}

		//motor direction
		if (left >=0)
		{
			wpi.digitalWrite(this.LEFT_DIR_PIN,  this.LEFT_FORWARD);
		}
		else
		{
			wpi.digitalWrite(this.LEFT_DIR_PIN,  this.LEFT_BACKWARD);
			left = -left;//digitalWriteの引数にするため符号を正にする
		}
		if (right >= 0)
		{
			wpi.digitalWrite(this.RIGHT_DIR_PIN, this.RIGHT_FORWARD);
		}
		else
		{
			wpi.digitalWrite(this.RIGHT_DIR_PIN, this.RIGHT_BACKWARD);
			right = -right;//digitalWriteの引数にするため符号を正にする
		}

		if (this.DEBUG_MOTOR_OFF)
		{
			for (var cnt = 0; cnt < 10; cnt++)
			{
				wpi.digitalWrite(this.LEFT_GO_PIN,  left);
				wpi.digitalWrite(this.RIGHT_GO_PIN, right);	
				wpi.delay(msec);
				wpi.digitalWrite(this.LEFT_GO_PIN,  0);
				wpi.digitalWrite(this.RIGHT_GO_PIN, 0);	
				wpi.delay(this.MOTOR_WAIT_MAX - msec);
			}
		}
	}

	public motor_forward(msec/* = 50*/)
	{
		//Set both Left and Right forward.
		this.motor_set(1, 1, msec);
	}

	public motor_backward(msec/* = 18*/)
	{
		//Set both Left and Right backward.
		this.motor_set(-1, -1, msec);
	}

	public motor_rotate_right(msec/* = 18*/)
	{
		//Set Left forward, Right backward.
		this.motor_set(1, -1, msec);
	}

	public motor_rotate_left(msec/* = 18*/)
	{
		//Set Left backward, Right forward.
		this.motor_set(-1, 1, msec);
	}

	public motor_stop(msec/* = 0*/)
	{
		//motor stop.
		this.motor_set(0, 0, msec);
	}
}
