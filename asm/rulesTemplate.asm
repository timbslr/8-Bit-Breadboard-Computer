#bankdef ROM {
  #addr 0x0000
  #addr_end 0x8000 ;end is exclusive
  #outp 0
  #bits 8 ;8-Bit CPU
  #fill
}

#bankdef RAM {
  #addr 0x8000  ;e.g. for store: assert that addr is a valid RAM address 
  #addr_end 0x10000 ;end is exclusive
  #bits 8 ;8-Bit CPU
}

#subruledef register { ;subruledef prevents the mnemonics from being used as freestanding instructions
  A   => 0b00
  B   => 0b01
  X   => 0b10
  TMP => 0b11
}

#subruledef lcdregister { ;subruledef prevents the mnemonics from being used as freestanding instructions
  CTRL   => 0b0
  DATA   => 0b1
}

#ruledef {
	<RULES>
}

#bank ROM
