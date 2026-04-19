	; waits until the serial interface is ready to send the next byte
	; Clobbered Registers: None
serial_tx_wait:
	btxrdyc serial_tx_wait
	ret
	
	; outputs a character stored in the B - Register to the serial terminal
	; Clobbered Registers: None
serial_print_char:
	btxrdyc serial_print_char
	txsend B
	ret
	
	; sends "ESC[H" to set the cursor to position (0, 0)
	; Clobbered Registers: TMP
serial_cursor_home:
	call serial_tx_wait
	txsendi 0x1B
	call serial_tx_wait
	txsendi "["
	call serial_tx_wait
	txsendi "H"
	ret
	
	; sends "ESC[2J" to clear the terminal and resets the cursor to the home position
	; Clobbered Registers: TMP
serial_clear:
	call serial_tx_wait
	txsendi 0x1B
	call serial_tx_wait
	txsendi "["
	call serial_tx_wait
	txsendi "2"
	call serial_tx_wait
	txsendi "J"
	call serial_cursor_home
	ret
