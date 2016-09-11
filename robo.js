"use strict";
var wpi = require('wiring-pi');
/**
 * サーボ制御クラス
 */
var robo = (function () {
    //コンストラクタ
    function robo() {
        //RaspberryPi(2)とモータードライバ間のピンアサイン(WiringPI版)
        //wiringPiSetup()で初期化する
        /*
        private LEFT_GO_PIN		=  0;
        private LEFT_DIR_PIN	=  7;
        private RIGHT_GO_PIN	= 12;
        private RIGHT_DIR_PIN	=  6;
        private SW1_PIN			= 14;
        private SW2_PIN			= 13;
        private LED1_PIN		= 11;
        private LED2_PIN		= 10;
        private OC1_PIN			=  3;
        private OC2_PIN			=  2;
        */
        //RaspberryPi(2)とモータードライバ間のピンアサイン(Broadcom GPIO版)
        //wiringPiSetupGpio()で初期化する
        this.LEFT_GO_PIN = 17;
        this.LEFT_DIR_PIN = 4;
        this.RIGHT_GO_PIN = 10;
        this.RIGHT_DIR_PIN = 25;
        this.SW1_PIN = 11;
        this.SW2_PIN = 9;
        this.LED1_PIN = 7;
        this.LED2_PIN = 8;
        this.OC1_PIN = 22;
        this.OC2_PIN = 21; //(Rev1:21, Rev2:27)
        //クラス内で使用するマジックナンバーの定義(モーター回転方向の極性による)
        this.LEFT_FORWARD = 1;
        this.LEFT_BACKWARD = 0;
        this.RIGHT_FORWARD = 0; //(+/- reversed)
        this.RIGHT_BACKWARD = 1; //(+/- reversed)
        this.MOTOR_WAIT_MAX = 50;
        //デバッグ用のフラグ
        this.DEBUG_MOTOR_OFF = 1; //デバッグ時にモーターを動作させる(0), させない(1)
        //WiringPiの初期化
        if (wpi.wiringPiSetupGpio() == -1) {
            console.log("[SRV] Setup error.");
        }
        else {
            console.log("[SRV] GPIO setup ok.");
        }
        //Set up GPIO port
        wpi.pinMode(this.LEFT_DIR_PIN, wpi.OUTPUT);
        wpi.pinMode(this.LEFT_GO_PIN, wpi.OUTPUT);
        wpi.pinMode(this.RIGHT_DIR_PIN, wpi.OUTPUT);
        wpi.pinMode(this.RIGHT_GO_PIN, wpi.OUTPUT);
        wpi.pinMode(this.LED1_PIN, wpi.OUTPUT);
        wpi.pinMode(this.LED2_PIN, wpi.OUTPUT);
        //Reset morter direction
        wpi.digitalWrite(this.LEFT_DIR_PIN, this.LEFT_FORWARD);
        wpi.digitalWrite(this.RIGHT_DIR_PIN, this.RIGHT_FORWARD);
        //Reset LED status
        wpi.digitalWrite(this.LED1_PIN, 0);
        wpi.digitalWrite(this.LED2_PIN, 0);
    }
    robo.prototype.debug = function (msg) {
        console.log(msg);
    };
    /**
     * モーターを回転させる
     * @param left  左車輪側のパルスの大きさ（現状1のみ）と方向（符号）によりモータを回転させる
     * @param right 右車輪側のパルスの大きさ（現状1のみ）と方向（符号）によりモータを回転させる
     * @param msec  モーターONする時間(msec). MOTOR_WAIT_MAXを上限とする。
     */
    robo.prototype.motor_set = function (left, right, msec) {
        //cap maximun length for motor ON
        if (msec >= this.MOTOR_WAIT_MAX) {
            msec = this.MOTOR_WAIT_MAX;
        }
        //motor direction
        if (left >= 0) {
            wpi.digitalWrite(this.LEFT_DIR_PIN, this.LEFT_FORWARD);
        }
        else {
            wpi.digitalWrite(this.LEFT_DIR_PIN, this.LEFT_BACKWARD);
            left = -left; //digitalWriteの引数にするため符号を正にする
        }
        if (right >= 0) {
            wpi.digitalWrite(this.RIGHT_DIR_PIN, this.RIGHT_FORWARD);
        }
        else {
            wpi.digitalWrite(this.RIGHT_DIR_PIN, this.RIGHT_BACKWARD);
            right = -right; //digitalWriteの引数にするため符号を正にする
        }
        if (this.DEBUG_MOTOR_OFF) {
            for (var cnt = 0; cnt < 10; cnt++) {
                wpi.digitalWrite(this.LEFT_GO_PIN, left);
                wpi.digitalWrite(this.RIGHT_GO_PIN, right);
                wpi.delay(msec);
                wpi.digitalWrite(this.LEFT_GO_PIN, 0);
                wpi.digitalWrite(this.RIGHT_GO_PIN, 0);
                wpi.delay(this.MOTOR_WAIT_MAX - msec);
            }
        }
    };
    robo.prototype.motor_forward = function (msec) {
        //Set both Left and Right forward.
        this.motor_set(1, 1, msec);
    };
    robo.prototype.motor_backward = function (msec) {
        //Set both Left and Right backward.
        this.motor_set(-1, -1, msec);
    };
    robo.prototype.motor_rotate_right = function (msec) {
        //Set Left forward, Right backward.
        this.motor_set(1, -1, msec);
    };
    robo.prototype.motor_rotate_left = function (msec) {
        //Set Left backward, Right forward.
        this.motor_set(-1, 1, msec);
    };
    robo.prototype.motor_trun_right = function (msec) {
        //Set Left forward
        this.motor_set(1, 0, msec);
    };
    robo.prototype.motor_turn_left = function (msec) {
        //Set Right forward
        this.motor_set(0, 1, msec);
    };
    robo.prototype.motor_stop = function () {
        //motor stop.
        this.motor_set(0, 0, 0);
    };
    return robo;
}());
exports.robo = robo;
