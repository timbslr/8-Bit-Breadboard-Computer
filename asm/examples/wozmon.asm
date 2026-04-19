	#include "rules.asm"
	;
	; Translated and modified to run on my own ISA from: https://gist.github.com/beneater/8136c8b7f2fd95ccdd4562a498758217
	;
	;
	; - Until you hit enter, wozmon will put the characters that were typed into a buffer, starting at address IN (and print them to the screen)
	;   After hitting enter, the buffer is read, parsed and executed
	;
	; - MODE keeps track of the command we are dealing with:
	; 00 = XAM (examine) => type a single address to read whats in it (0200)
	; 74 = STOR (store) => give an address and a value to store there (0300: BE) (74 because its the character value for a colon shifted to the left once)
	; B8 = BLOCK XAM (examine a block of addresses) => read a block of addresses at once (0200.027F) (B8 because thats the character value for a dot shifted to the left twice)
	
	; Zero - Page Variables
	XAML = 0x8024                ; Last "opened" location Low
	XAMH = 0x8025                ; Last "opened" location High
	STL = 0x8026                 ; Store address Low
	STH = 0x8027                 ; Store address High
	L = 0x8028                   ; Hex value parsing Low
	H = 0x8029                   ; Hex value parsing High
	YSAV = 0x802A                ; Used to see if hex value is given
	MODE = 0x802B                ; $00=XAM, $74=STOR, $B8=BLOCK XAM
	
	; Special Addresses
	IN = 0x8200                  ; Input buffer
	
	KEYCODE_ESCAPE = 0x1B
	KEYCODE_BACKSPACE = 0x08
	KEYCODE_CR = 0x0D
	KEYCODE_DOT = 0x2E
	KEYCODE_COLON = 0x3A
	KEYCODE_R = 0x52
	KEYCODE_BACKSLASH = 0x5C
	KEYCODE_SPACE = 0x20
	
	MODE_XAM = 0x00
	MODE_STORE = 0x74
	MODE_BLOCK_XAM = 0xB8
	
RESET:
	li A, KEYCODE_ESCAPE         ; Load Keycode for ESCAPE to emulate the escape key being pressed after reset => escape resets wozmon
	
	; check if you hit a couple of special keys
NOTCR:
	beqi KEYCODE_BACKSPACE, BACKSPACE ; Backspace key? Yes.
	beqi KEYCODE_ESCAPE, ESCAPE  ; ESC? Yes.
	incy                         ; Increment Y: Advances text index.
	mov A, Y
	bleiu 127, NEXTCHAR          ; continue with next character if line length is inside the limit
	; Auto ESC if line longer than 127
	
	; prints the initial backspace prompt
ESCAPE:
	li A, KEYCODE_BACKSLASH      ; "\".
	call ECHO                    ; Output it.
	
GETLINE:
	li A, KEYCODE_CR             ; Send CR
	call ECHO
	
	li Y, 0x01                   ; Initialize text index. It is initialized to 1, because in the next line, Y is decremented so we end up with Y = 0 => Y is reset
	
BACKSPACE:
	decy                         ; decrement the buffer index as the last character was deleted
	mov A, Y
	blti 0, GETLINE              ; Check if we backspaced beyond the start of the line. If yes, reinitialize / drop down to a new line to start over.
	
	; read from keyboard and store character at the end of the IN buffer
NEXTCHAR:
	brxrdyc NEXTCHAR             ; wait until key ready
	
	; Key is ready - - > load it into the A - Register
	rxrd A                       ; Load character. B7 will be '0'.
	beqi KEYCODE_ESCAPE, NOTCR   ; if it is ESC, do not print it. The terminal will otherwise interpret it as the starting point of an escape sequence
	push A
	sto A, Y, IN                 ; Add to text buffer, store at IN + Y
	pop A
	call ECHO                    ; Display character on screen
	bnei KEYCODE_CR, NOTCR       ; Was the Key equal to Enter? No
	
	; enter was pressed and the command should be executed. By now, all typed characters are in the text buffer (IN)
	
	
	
	
	
	
	
	
	
	
	li Y, 0xFF                   ; Reset text index. (its incremented a few lines below, so it effectively initializes to 0)
	
	; Initialize A and X register to zero
	li A, 0x00                   ; For XAM mode.
	li X, 0x00                   ; X=0.
	
SETBLOCK:
	shl
	
SETSTOR:
	shl                          ; Leaves $74 if setting STOR mode. (turns 3A (the character value of a colon) into 74))
	st A, MODE                   ; $00 = XAM, $74 = STOR, $B8 = BLOK XAM.
	
BLANK_SKIP:
	incy                         ; Advance text index.
	
NEXTITEM:
	ldo A, Y, IN                 ; Get character.
	beqi KEYCODE_CR, GETLINE     ; CR? Yes, done this line. If we get a CR, the parsing of that line is complete => get the next command
	bltiu KEYCODE_DOT, BLANK_SKIP ; smaller than "."? Yes, skip delimiter. Will get taken for any character value that is less than "." => not numbers and letter, blank skip this character (=> parser skips over commas, spaces etc. while just looking for the next command)
	beqi KEYCODE_DOT, SETBLOCK   ; If its equal to the dot, set BLOCK XAM mode.
	beqi KEYCODE_COLON, SETSTOR  ; If its equal to the colon, set STOR mode.
	beqi KEYCODE_R, RUN          ; "R"? Yes, run user program.
	
	; X is zero here, so init L and H variables to 0:
	st X, L                      ; $00 - > L.
	st X, H                      ; and H.
	st Y, YSAV                   ; Save Y for comparison
	
NEXTHEX:
	ldo A, Y, IN                 ; Get character for hex test.
	xori 0x30                    ; Map digits to $0 - 9.
	bltiu 0x0A, HEXSHIFT         ; branch if it is a digit
	addi 0x89                    ; Map letter "A" - "F" to $FA - FF.
	bltiu 0xFA, NOTHEX           ; Hex letter? No => non - hex character, character is not 0 - 9 and not A - F
	
	; shift all 4 bits (= the currently parsed hex digit which is stored in the lower nibble of the A - Register) into the L variable and shift the overflowing bits from L into the H variable
	; example1 : H = 00000000, L = 00000000, A = 00001111 => H = 00000000, L = 00001111
	; example2 : H = 00000000, L = 10100000, A = 00001011 => H = 00001010, L = 00001011
HEXSHIFT:
	
	push A                       ; save A for later
	ld A, H
	shl
	shl                          ; A = H << 4
	shl
	shl
	st A, H                      ; store H << 4 temporarily back
	ld A, L
	slr
	slr                          ; A = L >> 4
	slr
	slr
	ld TMP, H
	or                           ; A = H << 4 | L >> 4
	st A, H                      ; H is now set correctly
	ld A, L
	shl
	shl                          ; A = L << 4
	shl
	shl
	pop TMP
	or                           ; A = L << 4 | hex_digit
	st A, L                      ; L is now set correctly
	; the shifting also allows to enter less than 4 digits and the rest of the upper nibbles will be filled with zeros (also allows for more than 4 characters, the front ones will be shifted out)
	incy                         ; Advance text index.
	jmp NEXTHEX                  ; Check next character for hex.
	; now, the upper two typed hex digits are in H and the lower two ones in L
	
NOTHEX:
	mov A, Y
	ld TMP, YSAV                 ; Check if L, H empty (no hex digits)
	beq ESCAPE                   ; Yes, generate ESC sequence. (we didn't read any hex digits at all => not a valid entry, reset wozmon by emulating Escape)
	
	; if we are here, we successfully parsed a valid entry. The next step is to check the current MODE and execute it
	ld A, MODE
	beqi MODE_XAM, NOTSTOR       ; => branch if MODE is not STORE
	beqi MODE_BLOCK_XAM, NOTSTOR ; => branch if MODE is not STORE
	
	ld B, L                      ; LSD's of hex data.
	ld A, STH
	ld TMP, STL
	stindr B                     ; Store current 'store index'.
	incm STL                     ; Increment store index. Keeps incremented STL in A - Register
	bnei 0, NEXTITEM             ; Get next item (no carry).
	incm STH                     ; If STL increment wrapped to zero, add carry to 'store index' high order
	
TONEXTITEM:
	jmp NEXTITEM                 ; Get next command item.
	
RUN:
	jmpind XAML                  ; Run at current XAM index.
	
NOTSTOR:
	ld A, MODE
	beqi MODE_BLOCK_XAM, XAMNEXT
	
	; if we are here, MODE is XAM, so we examine a single byte
	; only does two loops => Copies what is inside L and H into STL, XAML and STH, XAMH
	li X, 0x02                   ; Byte count.
SETADR:
	ldo A, X, L - 1              ; Copy hex data to A register (load L - 1 + X into A)(the first time into this loop, this will load H into A, the second time it will be L)
	push A
	sto A, X, STL - 1            ; 'store index'.(store A register to STL - 1 + X) (the first time into this loop, its going to store it into STH)
	pop A
	sto A, X, XAML - 1           ; And to 'XAM index'. (the first time into this loop, its going to store it into XAMH)
	decx                         ; Next of 2 bytes.
	mov A, X
	bnei 0, SETADR               ; Loop unless X = 0. (branch not equal to zero)
	
	; prints the address
NEXT_PRINT:
	bnei 0, PRINT_DATA           ; NE means no address to print. (branch not equal to zero, will be skipped if coming from SETADR) (jumps if the address is not a multiple of 8, c.f. MOD8CHK => skip printing the address in Block XAM Mode again and just print a space)
	li A, KEYCODE_CR             ; CR.
	call ECHO                    ; Output it.
	ld A, XAMH                   ; 'Examine index' high - order byte.
	call PRINT_BYTE              ; Output it in hex format.
	ld A, XAML                   ; Low - order 'examine index' byte.
	call PRINT_BYTE              ; Output it in hex format.
	li A, KEYCODE_COLON          ; ":".
	call ECHO                    ; Output it.
	
	; prints the data that was read
PRINT_DATA:
	li A, KEYCODE_SPACE          ; Blank.
	call ECHO                    ; Output it.
	ld A, XAMH
	ld TMP, XAML
	ldindr A                     ; Get data byte at 'examine index'. (load the actual data that was read from the address)
	call PRINT_BYTE              ; And output it in hex format.
	
	; relevant for BLOCK XAM
XAMNEXT:
	st X, MODE                   ; 0 - > MODE (XAM mode). (X is always zero here) (=> reset MODE to normal XAM to allow for multiply inputs at once)
	ld A, XAML
	ld TMP, L
	sub                          ; Compare 'examine index' to hex data.
	ld A, XAMH
	ld TMP, H
	subc
	bcs TONEXTITEM               ; Keeps incrementing while (XAMH:XAML) < (H:L)
	
	; increment XAM
	incm XAML                    ; keeps incremented XAML in A - Register
	bnei 0, MOD8CHK
	incm XAMH
	
	; checks if XAML is a multiple of 8 (every 8 data points we print in Block XAM Mode, we want to print a CR and the current address again to get the nice formatting inside the terminal)
MOD8CHK:
	ld A, XAML                   ; Check low - order 'examine index' byte
	andi 0x07                    ; For MOD 8 = 0
	jmp NEXT_PRINT
	
	; prints a byte
PRINT_BYTE:
	push A                       ; Save A for LSD.
	slr
	slr
	slr                          ; MSD to LSD position.
	slr
	call PRINT_HEX               ; Outputs the first hex digit.
	pop A                        ; Restore A.
	; after print_byte finished, the first character of the was printed to the screen. Due to fallthrough to PRINT_HEX, the second character is now also printed
	
	; print hex character stored in the low nibble of the A - Register
PRINT_HEX:
	andi 0x0F                    ; Mask LSD for hex print.
	ori 0x30                     ; Add "0" => Maps to digits 0 - 9.
	bltiu 0x3A, ECHO             ; Less than 3A? / Digit? => Yes, output it.
	addi 0x07                    ; Add offset for letter.
	
	; prints whatever byte is in the A - Register
ECHO:
	btxrdyc ECHO                 ; wait until TX is ready
	txsend A                     ; Output character.
	ret                          ; Return.
