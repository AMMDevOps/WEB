#include <LiquidCrystal.h>
LiquidCrystal lcd(12, 11, 5, 4, 3, 2);

String str = "";

void setup() {
  Serial.begin(9600);
  lcd.begin(16, 2); 
}

void loop() {
  lcd.setCursor(0, 0);
  str = Serial.readString();
  lcd.clear();
  lcd.print(str);
  Serial.write(Serial.available());
  delay(1000);
  }