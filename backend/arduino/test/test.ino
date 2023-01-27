#include <LiquidCrystal.h>
LiquidCrystal lcd(12, 11, 5, 4, 3, 2);

String str = "";
String msg = "";
String name = "";

int index = 0;
int length_of_msg = 0;

const int ledRed = 10;
const int ledBlue = 9;
const int ledGreen = 6;

int redValue = 0;
int greenValue = 0;
int blueValue = 0;

void setup() {
  Serial.begin(9600);
  lcd.begin(16, 2); 

  pinMode(ledRed, OUTPUT);
  pinMode(ledGreen, OUTPUT);
  pinMode(ledBlue, OUTPUT);
}

void loop() {
  lcd.setCursor(0, 0);
  str = Serial.readString();
  if (str != "")
  {
    length_of_msg = str.length();
    index = str.indexOf('\n');
    msg = str.substring(0,index);
    name = str.substring(index+1,length_of_msg);
    lcd.clear();
    lcd.setCursor(0,0);
    lcd.print(msg);
    lcd.setCursor(0, 1);
    lcd.print(name);
    analogWrite(ledRed, 255); 
  }
  Serial.write(Serial.available());
  analogWrite(ledGreen, 255);
  delay(1000);
  analogWrite(ledRed, 0);
  analogWrite(ledGreen, 0);
  analogWrite(ledBlue, 0);
  }