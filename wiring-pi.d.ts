declare module "wiring-pi" {
    const PWM_OUTPUT : number;
    const PWM_MODE_MS : number;
    const INPUT : number;
    const OUTPUT : number;
    function wiringPiSetup() : number;
    function wiringPiSetupGpio() : number;
    function digitalWrite(pin : number, num : number);
    function pinMode(pin : number, mode : number);
    function pwmSetMode(mode : number);
    function pwmSetClock(clock : number);
    function pwmSetRange(range : number);
    function pwmWrite(pin : number, value : number);
    function delay(msec : number);
}
