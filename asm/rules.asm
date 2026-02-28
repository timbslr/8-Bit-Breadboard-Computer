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
	add                                            => 0b11010000
	addi {imm: i8}                                 => asm{ li TMP, {imm} } @ asm{ add }
	addc                                           => 0b00110000
	addci {imm: i8}                                => asm{ li TMP, {imm} } @ asm{ addc }
	sub                                            => 0b11010010
	subc                                           => 0b00110001
	subci {imm: i8}                                => asm{ li TMP, {imm} } @ asm{ subc }
	and                                            => 0b11100010
	andi {imm: i8}                                 => asm{ li TMP, {imm} } @ asm{ and }
	or                                             => 0b11100011
	ori {imm: i8}                                  => asm{ li TMP, {imm} } @ asm{ or }
	xor                                            => 0b11110011
	xori {imm: i8}                                 => asm{ li TMP, {imm} } @ asm{ xor }
	not                                            => 0b11100100
	neg                                            => asm{ not } @ asm{ addi 1 }
	shl                                            => 0b11110010
	slr                                            => 0b11010100
	sar                                            => 0b11110000
	ror                                            => 0b11110100
	rol                                            => 0b11110001
	clr {reg: register}                            => asm{ li {reg}, 0 }
	mov {regd: register}, {regs: register}         => 0b1001 @ regs @ regd
	movs TMP, BUF                                  => 0b01110000
	movs BUF, TMP                                  => 0b01110001
	movs PC_L, TMP                                 => 0b01110010
	movs PC_H, TMP                                 => 0b01110011
	movs TMP, PC_L                                 => 0b01110100
	movs TMP, PC_H                                 => 0b01110101
	movs A, F                                      => 0b01110110
	movs TMP, F                                    => 0b01110111
	movs B, F                                      => 0b01111000
	movs X, F                                      => 0b01111001
	movs A, SP_L                                   => 0b01111011
	movs A, SP_H                                   => 0b01111100
	ld {reg: register}, {addr: u16}                => 0b100011 @ reg @ le(addr)
	ldox {reg: register}, {addr: u16}              => 0b001001 @ reg @ le(addr)
	ldoy {reg: register}, {addr: u16}              => 0b001010 @ reg @ le(addr)
	ldsprel {imm: i8}                              => 0b001011 @ imm
	st {reg: register}, {addr: u16}                => 0b100010 @ reg @ le(addr)
	stox {reg: register}, {addr: u16}              => 0b001101 @ reg @ le(addr)
	stoy {reg: register}, {addr: u16}              => 0b001110 @ reg @ le(addr)
	stosprel {reg: register}, {addr: u16}          => 0b001111 @ reg @ le(addr)
	li {reg: register}, {imm: i8}                  => 0b011011 @ reg @ imm
	push {reg: register}                           => 0b101001 @ reg
	pop {reg: register}                            => 0b101010 @ reg
	peek {reg: register}                           => 0b101011 @ reg
	incx                                           => 0b01100100
	incy                                           => 0b01100110
	incm {addr: u16}                               => asm{ ld X, {addr} } @ asm{ incx } @ asm{ st X, {addr} }
	decx                                           => 0b01100101
	decy                                           => 0b01100111
	decm {addr: u16}                               => asm{ ld X, {addr} } @ asm{ decx } @ asm{ st X, {addr} }
	out7sd {reg: register}                         => 0b000111 @ reg
	s7sdsm                                         => 0b10110000
	s7sdum                                         => 0b00000011
	out7sdi {imm: i8}                              => 0b00001111 @ imm
	outlcd {lcdreg: lcdregister}, {reg: register}  => 0b01001 @ lcdreg @ reg
	outlcdi {lcdreg: lcdregister}, {imm: i8}       => 0b0100011 @ lcdreg @ imm
	lcdrd {lcdreg: lcdregister}, {reg: register}   => 0b01011 @ lcdreg @ reg
	rxrd {reg: register}                           => 0b010100 @ reg
	txsend {reg: register}                         => 0b010101 @ reg
	txsendi {imm: i8}                              => 0b01000010 @ imm
	nop                                            => 0b00000000
	hlt                                            => 0b00000001
	call {addr: u16}                               => asm{ 
			li TMP, nextInstructionAddress[15:8]
			push TMP
			li TMP, nextInstructionAddress[7:0]
			push TMP
			jmp {addr}
			nextInstructionAddress: }
	ret                                            => 0b00010100
	jmp {addr: u16}                                => 0b00000101 @ le(addr)
	jmpr                                           => 0b00000110
	jmpind                                         => 0b00110010
	beq {addr: u16}                                => 0b00010000 @ le(addr)
	beqi {imm: i8}, {addr: u16}                    => asm{ li TMP, {imm} } @ asm{ beq {addr} }
	bne {addr: u16}                                => 0b00010001 @ le(addr)
	bnei {imm: i8}, {addr: u16}                    => asm{ li TMP, {imm} } @ asm{ bne {addr} }
	blt {addr: u16}                                => 0b10000000 @ le(addr)
	blti {imm: i8}, {addr: u16}                    => asm{ li TMP, {imm} } @ asm{ blt {addr} }
	bltu {addr: u16}                               => 0b00100010 @ le(addr)
	bltiu {imm: i8}, {addr: u16}                   => asm{ li TMP, {imm} } @ asm{ bltu {addr} }
	ble {addr: u16}                                => 0b10100000 @ le(addr)
	blei {imm: i8}, {addr: u16}                    => asm{ li TMP, {imm} } @ asm{ ble {addr} }
	bleu {addr: u16}                               => 0b11000000 @ le(addr)
	bleiu {imm: i8}, {addr: u16}                   => asm{ li TMP, {imm} } @ asm{ bleu {addr} }
	bge {addr: u16}                                => 0b10000001 @ le(addr)
	bgei {imm: i8}, {addr: u16}                    => asm{ li TMP, {imm} } @ asm{ bge {addr} }
	bgeu {addr: u16}                               => 0b00100011 @ le(addr)
	bgeiu {imm: i8}, {addr: u16}                   => asm{ li TMP, {imm} } @ asm{ bgeu {addr} }
	bgt {addr: u16}                                => 0b10100001 @ le(addr)
	bgti {imm: i8}, {addr: u16}                    => asm{ li TMP, {imm} } @ asm{ bgt {addr} }
	bgtu {addr: u16}                               => 0b11000001 @ le(addr)
	bgtiu {imm: i8}, {addr: u16}                   => asm{ li TMP, {imm} } @ asm{ bgtu {addr} }
	bzs {addr: u16}                                => 0b00001000 @ le(addr)
	bzc {addr: u16}                                => 0b00001001 @ le(addr)
	bcs {addr: u16}                                => 0b00100000 @ le(addr)
	bcc {addr: u16}                                => 0b00100001 @ le(addr)
	bns {addr: u16}                                => 0b01000000 @ le(addr)
	bnc {addr: u16}                                => 0b01000001 @ le(addr)
	bvs {addr: u16}                                => 0b01100000 @ le(addr)
	bvc {addr: u16}                                => 0b01100001 @ le(addr)
	brxrdys {addr: u16}                            => 0b11100000 @ le(addr)
	brxrdyc {addr: u16}                            => 0b11100001 @ le(addr)
	btxrdys {addr: u16}                            => 0b11101000 @ le(addr)
	btxrdyc {addr: u16}                            => 0b11101001 @ le(addr)
}

#bank ROM
