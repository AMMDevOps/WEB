#include <LiquidCrystal.h>
LiquidCrystal lcd(12, 11, 5, 4, 3, 2);

String stra;

void setup() {
  Serial.begin(9600);
  lcd.begin(16, 2); 
}

void loop() {
  lcd.clear();
  lcd.setCursor(0, 0);
  stra = "";
  stra = Serial.readString();
  lcd.print(stra);
  Serial.println(stra);
}