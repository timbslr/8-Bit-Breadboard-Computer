;* 
 This is a simple text-editor program for the lcd that uses the serial interface receiver for text input
 Besides the standard ASCII-characters, the following special keys have been implemented:
 - Backspace: Deletes the last character
 - Enter: toggles between the two rows
 - Tab: prints two spaces
 - Escape: clears the screen
*;

#include "rules.asm"

KEYCODE_BACKSPACE = 0x7F
KEYCODE_ENTER = 0x0D
KEYCODE_TAB = 0x09
KEYCODE_ESCAPE = 0x1B

call lcd_init
; outlcdi DATA, ">"

loop:
  brxrdyc loop
  rxrd A ; value needs to be in the A-Register for comparisons

  bnei KEYCODE_BACKSPACE, not_bs
  call lcd_wait 
  outlcdi CTRL, %00010000 ; shift cursor to the left
  call lcd_wait 
  outlcdi DATA, 0x20 ; overwrite character with space
  call lcd_wait 
  outlcdi CTRL, %00010000 ; shift cursor to the left
  jmp loop

not_bs:
  bnei KEYCODE_ENTER, not_enter
  mov A, X
  bnei 0, else
  li X, 1
  call lcd_wait 
  outlcdi CTRL, %11000000 ; move cursor to second row
  jmp loop
else:
  li X, 0
  call lcd_wait 
  outlcdi CTRL, %10000000 ; move cursor to first row
  jmp loop

not_enter:
  bnei KEYCODE_TAB, not_tab
  li B, 0x20 ; space
  call print_char ; tab = 2 spaces
  call print_char
  jmp loop

not_tab:
  bnei KEYCODE_ESCAPE, not_esc
  call lcd_wait 
  outlcdi CTRL, %00000001 ; clear lcd
  jmp loop

not_esc:
  mov B, A ; print_char needs the value to be in the B-Register
  call print_char
  jmp loop

hlt

#include "common.asm"