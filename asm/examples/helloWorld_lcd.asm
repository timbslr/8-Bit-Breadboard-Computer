; See example: "anyString_lcd.asm" for a cleaner way to print strings

#include "rules.asm"

call lcd_init

li B, "H"
call print_char
li B, "e"
call print_char
li B, "l"
call print_char
li B, "l"
call print_char
li B, "o"
call print_char
li B, ","
call print_char
li B, " "
call print_char
li B, "W"
call print_char
li B, "o"
call print_char
li B, "r"
call print_char
li B, "l"
call print_char
li B, "d"
call print_char
li B, "!"
call print_char

hlt

#include "common.asm"