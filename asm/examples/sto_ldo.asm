	#include "rules.asm"
	
	STRING_ADDR = 0x9000
	
	call lcd_init
	
	li B, "C"
	sto B, X, STRING_ADDR        ; Attention: Don't use the A - or TMP - Register here, as they are clobbered registers. They will be overwritten during execution of sto
	incx
	li B, "l"
	sto B, X, STRING_ADDR
	incx
	li B, "o"
	sto B, X, STRING_ADDR
	incx
	li B, "b"
	sto B, X, STRING_ADDR
	incx
	li B, "b"
	sto B, X, STRING_ADDR
	incx
	li B, "e"
	sto B, X, STRING_ADDR
	incx
	li B, "r"
	sto B, X, STRING_ADDR
	incx
	li B, "e"
	sto B, X, STRING_ADDR
	incx
	li B, "d"
	sto B, X, STRING_ADDR
	incx
	li B, " "
	sto B, X, STRING_ADDR
	incx
	li B, "R"
	sto B, X, STRING_ADDR
	incx
	li B, "e"
	sto B, X, STRING_ADDR
	incx
	li B, "g"
	sto B, X, STRING_ADDR
	incx
	li B, "."
	sto B, X, STRING_ADDR
	
	clr X
	
loop:
	mov A, X
	bgei 14, end
	ldo B, X, STRING_ADDR
	call lcd_print_char
	incx
	jmp loop
	
end:
	hlt
	
	#include ".\\lib\\lcd.asm"
