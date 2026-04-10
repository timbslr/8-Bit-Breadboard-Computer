	#include "rules.asm"
	
	YSAV = 0x802A                ; Saved Y (not strictly needed here)
	IN = 0x8200                  ; Input buffer
	
	KEYCODE_BACKSPACE = 0x08
	KEYCODE_CR = 0x0D
	KEYCODE_BACKSLASH = 0x5C
	
START:
	li A, KEYCODE_BACKSLASH      ; Optional: show initial prompt
	call ECHO
	
MAIN_LOOP:
	li Y, 0x01                   ; Start text index at 1
READ_CHAR:
	brxrdyc READ_CHAR            ; Wait until key ready
	rxrd A                       ; Read character into A
	
	bnei KEYCODE_CR, HANDLE_CHAR ; If not Enter, process
	; Enter pressed: reset line and loop
	li Y, 0xFF
	jmp MAIN_LOOP
HANDLE_CHAR:
	beqi KEYCODE_BACKSPACE, BACKSPACE_HANDLER
	push A
	sto A, Y, IN                 ; Store typed char
	pop A
	call ECHO                    ; Echo typed char
	incy                         ; Advance buffer index
	jmp READ_CHAR
	
BACKSPACE_HANDLER:
	decy                         ; Move index back
	blti 0, MAIN_LOOP            ; If below 0, start new line
	jmp READ_CHAR
	
ECHO:
	btxrdyc ECHO                 ; Wait for TX ready
	txsend A                     ; Send character
	ret
