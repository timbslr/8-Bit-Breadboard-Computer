#include "./rules.asm"

outlcdi CTRL, %00000001 ; Clear display
outlcdi CTRL, %00111000 ; Function set:             8-bit display interface, 2-line display, 5x8 dots
outlcdi CTRL, %00001100 ; Display on/off control:   display on, cursor off, cursor blinking off
outlcdi CTRL, %00000110 ; Entry mode set:           move cursor from left to right, no display shift

outlcdi DATA, "H"
outlcdi DATA, "e"
outlcdi DATA, "l"
outlcdi DATA, "l"
outlcdi DATA, "o"
outlcdi DATA, ","
outlcdi DATA, " "
outlcdi DATA, "W"
outlcdi DATA, "o"
outlcdi DATA, "r"
outlcdi DATA, "l"
outlcdi DATA, "d"
outlcdi DATA, "!"
