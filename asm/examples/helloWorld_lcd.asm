	; See example: "anyString_lcd.asm" for a cleaner way to print strings
	
	#include "rules.asm"
	
	call lcd_init
	
	li B, "H"
	call lcd_print_char
	li B, "e"
	call lcd_print_char
	li B, "l"
	call lcd_print_char
	li B, "l"
	call lcd_print_char
	li B, "o"
	call lcd_print_char
	li B, ","
	call lcd_print_char
	li B, " "
	call lcd_print_char
	li B, "W"
	call lcd_print_char
	li B, "o"
	call lcd_print_char
	li B, "r"
	call lcd_print_char
	li B, "l"
	call lcd_print_char
	li B, "d"
	call lcd_print_char
	li B, "!"
	call lcd_print_char
	
	hlt
	
	#include ".\\lib\\lcd.asm"
