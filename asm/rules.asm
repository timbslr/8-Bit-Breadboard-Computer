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
	add {reg: register}                            => 0b110100 @ reg
	addi {reg: register}, {imm: i8}                => asm{ li TMP, {imm} } @ asm{ add {reg} }
	addc {reg: register}                           => 0b001001 @ reg
	addci {reg: register}, {imm: i8}               => asm{ li TMP, {imm} } @ asm{ addc {reg} }
	sub {reg: register}                            => 0b110101 @ reg
	subc {reg: register}                           => 0b001010 @ reg
	subci {reg: register}, {imm: i8}               => asm{ li TMP, {imm} } @ asm{ subc {reg} }
	and {reg: register}                            => 0b110110 @ reg
	andi {reg: register}, {imm: i8}                => asm{ li TMP, {imm} } @ asm{ and {reg} }
	or {reg: register}                             => 0b110111 @ reg
	ori {reg: register}, {imm: i8}                 => asm{ li TMP, {imm} } @ asm{ or {reg} }
	xor {reg: register}                            => 0b101100 @ reg
	xori {reg: register}, {imm: i8}                => asm{ li TMP, {imm} } @ asm{ xor {reg} }
	not {reg: register}                            => 0b111001 @ reg
	neg {reg: register}                            => asm{ not A } @ asm{ addi {reg}, 1 }
	shl {reg: register}                            => 0b110010 @ reg
	slr {reg: register}                            => 0b111011 @ reg
	sar {reg: register}                            => 0b111100 @ reg
	ror {reg: register}                            => 0b111101 @ reg
	rol {reg: register}                            => 0b111110 @ reg
	clr {reg: register}                            => asm{ li {reg}, 0 }
	mov {regd: register}, {regs: register}         => 0b1001 @ regs @ regd
	movs SP_L, TMP                                 => 0b01110000
	movs SP_H, TMP                                 => 0b01110001
	movs TMP, BUF                                  => 0b01110010
	movs BUF, TMP                                  => 0b01110011
	movs PC_L, TMP                                 => 0b01110100
	movs PC_H, TMP                                 => 0b01110101
	movs TMP, PC_L                                 => 0b01110110
	movs TMP, PC_H                                 => 0b01110111
	movs A, F                                      => 0b01111000
	movs TMP, F                                    => 0b01111001
	movs B, F                                      => 0b01111010
	movs X, F                                      => 0b01111011
	movs PC_L, BUF                                 => 0b01111100
	movs A, SP_L                                   => 0b01111101
	movs A, SP_H                                   => 0b01111110
	ld {reg: register}, {addr: u16}                => 0b101011 @ reg @ le(addr)
	ldo {reg: register}, {addr: u16}               => 0b001101 @ reg @ le(addr)
	st {reg: register}, {addr: u16}                => 0b101101 @ reg @ le(addr)
	sto {reg: register}, {addr: u16}               => 0b001110 @ reg @ le(addr)
	lds {reg: register}                            => 0b101110 @ reg
	sts {reg: register}                            => 0b101111 @ reg
	li {reg: register}, {imm: i8}                  => 0b101010 @ reg @ imm
	push {reg: register}                           => asm{ sts {reg} } @ asm{ incsp }
	pop {reg: register}                            => asm{ decsp } @ asm{ lds {reg} }
	peek {reg: register}                           => asm{ pop {reg} } @ asm{ incsp }
	incx                                           => 0b01100100
	incsp                                          => 0b00110000
	incm {addr: u16}                               => asm{ ld X, {addr} } @ asm{ incx } @ asm{ st X, {addr} }
	decx                                           => 0b01100101
	decsp                                          => 0b00110001
	decm {addr: u16}                               => asm{ ld X, {addr} } @ asm{ decx } @ asm{ st X, {addr} }
	out7sd {reg: register}                         => 0b000111 @ reg
	s7sdsm                                         => 0b00000010
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
	ret                                            => asm{ pop TMP } @ asm{ movs BUF, TMP } @ asm{ pop TMP } @ asm{ jmpr }
	jmp {addr: u16}                                => 0b00000101 @ le(addr)
	jmpr                                           => 0b00000110
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
