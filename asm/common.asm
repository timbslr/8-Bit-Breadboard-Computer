; This file contains common methods that can be reused anywhere
; Pay attention to include this file AT THE END of a src-file as the PC always starts at position 0

; initializes the lcd
lcd_init:
  call lcd_wait ; four calls are ok for efficiency as init is only called once 
  outlcdi CTRL, %00000001 ; Clear display
  call lcd_wait
  outlcdi CTRL, %00111000 ; Function set:             8-bit display interface, 2-line display, 5x8 dots
  call lcd_wait
  outlcdi CTRL, %00001100 ; Display on/off control:   display on, cursor off, cursor blinking off
  call lcd_wait
  outlcdi CTRL, %00000110 ; Entry mode set:           move cursor from left to right, no display shift

; waits until the busy flag is 0
lcd_wait: 
  lcdrd CTRL, A
  andi A, %10000000
  beqi %10000000, lcd_wait
  ret

; outputs a character stored in the B-Register to the lcd 
print_char:
  lcdrd CTRL, A
  andi A, %10000000
  beqi %10000000, print_char ; waits until the busy flag is zero (inlined lcd_wait for more efficiency)
  outlcd DATA, B ; then output the character to the lcd
  ret