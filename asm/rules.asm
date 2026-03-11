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
  A    => 0b000
  TMP  => 0b001
  B    => 0b010
  C    => 0b011
  X    => 0b110
  Y    => 0b111
}

#subruledef idxregister { ;subruledef prevents the mnemonics from being used as freestanding instructions
  X    => 0b0
  Y    => 0b1
}

#subruledef lcdregister { ;subruledef prevents the mnemonics from being used as freestanding instructions
  CTRL => 0b0
  DATA => 0b1
}

#ruledef {
	add                                                      => 0b11010000
	addi {imm: i8}                                           => asm{ li TMP, {imm} } @ asm{ add }
	addc                                                     => 0b00100100
	addci {imm: i8}                                          => asm{ li TMP, {imm} } @ asm{ addc }
	sub                                                      => 0b11010010
	subc                                                     => 0b00100101
	subci {imm: i8}                                          => asm{ li TMP, {imm} } @ asm{ subc }
	and                                                      => 0b11100010
	andi {imm: i8}                                           => asm{ li TMP, {imm} } @ asm{ and }
	or                                                       => 0b11100011
	ori {imm: i8}                                            => asm{ li TMP, {imm} } @ asm{ or }
	xor                                                      => 0b11110011
	xori {imm: i8}                                           => asm{ li TMP, {imm} } @ asm{ xor }
	not                                                      => 0b11100100
	neg                                                      => asm{ not } @ asm{ addi 1 }
	shl                                                      => 0b11110010
	slr                                                      => 0b11010001
	sar                                                      => 0b11110000
	ror                                                      => 0b11110100
	rol                                                      => 0b11110001
	clr {reg: register}                                      => asm{ li {reg}, 0 }
	mov TMP, A                                               => 0b10011000
	mov B, A                                                 => 0b10011001
	mov C, A                                                 => 0b10011010
	mov X, A                                                 => 0b10011011
	mov Y, A                                                 => 0b10011100
	mov A, TMP                                               => 0b10101000
	mov B, TMP                                               => 0b10101001
	mov C, TMP                                               => 0b10101010
	mov X, TMP                                               => 0b10101011
	mov Y, TMP                                               => 0b10101100
	mov A, B                                                 => 0b10111000
	mov TMP, B                                               => 0b10111001
	mov C, B                                                 => 0b10111010
	mov X, B                                                 => 0b10111011
	mov Y, B                                                 => 0b10111100
	mov A, C                                                 => 0b11001000
	mov TMP, C                                               => 0b11001001
	mov B, C                                                 => 0b11001010
	mov X, C                                                 => 0b11001011
	mov Y, C                                                 => 0b11001100
	mov A, X                                                 => 0b11011000
	mov TMP, X                                               => 0b11011001
	mov B, X                                                 => 0b11011010
	mov C, X                                                 => 0b11011011
	mov Y, X                                                 => 0b11011100
	mov A, Y                                                 => 0b10011101
	mov TMP, Y                                               => 0b10101101
	mov B, Y                                                 => 0b10111101
	mov C, Y                                                 => 0b11001101
	mov X, Y                                                 => 0b11011101
	mov A, F                                                 => 0b10011110
	mov TMP, F                                               => 0b10101110
	mov B, F                                                 => 0b10111110
	mov C, F                                                 => 0b11001110
	mov X, F                                                 => 0b11011110
	mov Y, F                                                 => 0b11101110
	ld {reg: register}, {addr: u16}                          => 0b00010 @ reg @ le(addr)
	ldo {reg: register}, {idxreg: idxregister}, {addr: u16}  => 0b0011 @ idxreg @ reg @ le(addr)
	ldsprel {imm: i8}                                        => 0b01010 @ imm
	st {reg: register}, {addr: u16}                          => 0b00011 @ reg @ le(addr)
	sto {reg: register}, {addr: u16}                         => 0b0100 @ reg @ le(addr)
	stosprel {reg: register}, {addr: u16}                    => 0b01011 @ reg @ le(addr)
	li {reg: register}, {imm: i8}                            => 0b01101 @ reg @ imm
	push {reg: register}                                     => 0b10010 @ reg
	pop {reg: register}                                      => 0b10100 @ reg
	peek {reg: register}                                     => 0b10110 @ reg
	incx                                                     => 0b01100100
	incy                                                     => 0b01100110
	incm {addr: u16}                                         => asm{ ld X, {addr} } @ asm{ incx } @ asm{ st X, {addr} }
	decx                                                     => 0b01100101
	decy                                                     => 0b01100111
	decm {addr: u16}                                         => asm{ ld X, {addr} } @ asm{ decx } @ asm{ st X, {addr} }
	out7sd {reg: register}                                   => 0b00101 @ reg
	s7sdsm                                                   => 0b11000010
	s7sdum                                                   => 0b00000011
	out7sdi {imm: i8}                                        => 0b00101111 @ imm
	outlcd {lcdreg: lcdregister}, {reg: register}            => 0b1000 @ lcdreg @ reg
	outlcdi {lcdreg: lcdregister}, {imm: i8}                 => 0b1000111 @ lcdreg @ imm
	lcdrda {lcdreg: lcdregister}                             => 0b1000110 @ lcdreg
	rxrd {reg: register}                                     => 0b01110 @ reg
	txsend {reg: register}                                   => 0b01111 @ reg
	txsendi {imm: i8}                                        => 0b01111111 @ imm
	nop                                                      => 0b00000000
	hlt                                                      => 0b00000001
	call {addr: u16}                                         => asm{ 
			li TMP, nextInstructionAddress[15:8]
			push TMP
			li TMP, nextInstructionAddress[7:0]
			push TMP
			jmp {addr}
			nextInstructionAddress: }
	ret                                                      => 0b00000111
	jmp {addr: u16}                                          => 0b00000101 @ le(addr)
	jmpr                                                     => 0b00000110
	jmpind                                                   => 0b00100110
	beq {addr: u16}                                          => 0b00001010 @ le(addr)
	beqi {imm: i8}, {addr: u16}                              => asm{ li TMP, {imm} } @ asm{ beq {addr} }
	bne {addr: u16}                                          => 0b00001011 @ le(addr)
	bnei {imm: i8}, {addr: u16}                              => asm{ li TMP, {imm} } @ asm{ bne {addr} }
	blt {addr: u16}                                          => 0b10010110 @ le(addr)
	blti {imm: i8}, {addr: u16}                              => asm{ li TMP, {imm} } @ asm{ blt {addr} }
	bltu {addr: u16}                                         => 0b00100010 @ le(addr)
	bltiu {imm: i8}, {addr: u16}                             => asm{ li TMP, {imm} } @ asm{ bltu {addr} }
	ble {addr: u16}                                          => 0b10100110 @ le(addr)
	blei {imm: i8}, {addr: u16}                              => asm{ li TMP, {imm} } @ asm{ ble {addr} }
	bleu {addr: u16}                                         => 0b11000000 @ le(addr)
	bleiu {imm: i8}, {addr: u16}                             => asm{ li TMP, {imm} } @ asm{ bleu {addr} }
	bge {addr: u16}                                          => 0b10010111 @ le(addr)
	bgei {imm: i8}, {addr: u16}                              => asm{ li TMP, {imm} } @ asm{ bge {addr} }
	bgeu {addr: u16}                                         => 0b00100011 @ le(addr)
	bgeiu {imm: i8}, {addr: u16}                             => asm{ li TMP, {imm} } @ asm{ bgeu {addr} }
	bgt {addr: u16}                                          => 0b10100111 @ le(addr)
	bgti {imm: i8}, {addr: u16}                              => asm{ li TMP, {imm} } @ asm{ bgt {addr} }
	bgtu {addr: u16}                                         => 0b11000001 @ le(addr)
	bgtiu {imm: i8}, {addr: u16}                             => asm{ li TMP, {imm} } @ asm{ bgtu {addr} }
	bzs {addr: u16}                                          => 0b00001000 @ le(addr)
	bzc {addr: u16}                                          => 0b00001001 @ le(addr)
	bcs {addr: u16}                                          => 0b00100000 @ le(addr)
	bcc {addr: u16}                                          => 0b00100001 @ le(addr)
	bns {addr: u16}                                          => 0b11110101 @ le(addr)
	bnc {addr: u16}                                          => 0b11110110 @ le(addr)
	bvs {addr: u16}                                          => 0b01100000 @ le(addr)
	bvc {addr: u16}                                          => 0b01100001 @ le(addr)
	brxrdys {addr: u16}                                      => 0b11100000 @ le(addr)
	brxrdyc {addr: u16}                                      => 0b11100001 @ le(addr)
	btxrdys {addr: u16}                                      => 0b11101000 @ le(addr)
	btxrdyc {addr: u16}                                      => 0b11101001 @ le(addr)
}

#bank ROM
