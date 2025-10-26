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

#ruledef {
	add {reg: register} => 0b110100 @ reg
	addi {reg: register}, {imm: i8} => asm{ li TMP, {imm} } @ asm{ add {reg} }
	addc {reg: register} => 0b001001 @ reg
	addci {reg: register}, {imm: i8} => asm{ li TMP, {imm} } @ asm{ addc {reg} }
	sub {reg: register} => 0b110101 @ reg
	subc {reg: register} => 0b001010 @ reg
	subci {reg: register}, {imm: i8} => asm{ li TMP, {imm} } @ asm{ subc {reg} }
	and {reg: register} => 0b110110 @ reg
	andi {reg: register}, {imm: i8} => asm{ li TMP, {imm} } @ asm{ and {reg} }
	or {reg: register} => 0b110111 @ reg
	ori {reg: register}, {imm: i8} => asm{ li TMP, {imm} } @ asm{ or {reg} }
	xor {reg: register} => 0b111000 @ reg
	xori {reg: register}, {imm: i8} => asm{ li TMP, {imm} } @ asm{ xor {reg} }
	not {reg: register} => 0b111001 @ reg
	neg {reg: register} => asm{ not A } @ asm{ addi {reg}, 1 }
	shl {reg: register} => 0b111010 @ reg
	slr {reg: register} => 0b111011 @ reg
	sar {reg: register} => 0b111100 @ reg
	ror {reg: register} => 0b111101 @ reg
	rorn {reg: register}, 0 => asm{ }
	rorn {reg: register}, 1 => asm{ ror {reg} }
	rorn {reg: register}, 2 => asm{ ror A } @ asm{ ror {reg} }
	rorn {reg: register}, 3 => asm{ ror A } @ asm{ ror A } @ asm{ ror {reg} }
	rorn {reg: register}, 4 => asm{ ror A } @ asm{ ror A } @ asm{ ror A } @ asm{ ror {reg} }
	rorn {reg: register}, 5 => asm{ rol A } @ asm{ rol A } @ asm{ rol {reg} }
	rorn {reg: register}, 6 => asm{ rol A } @ asm{ rol {reg} }
	rorn {reg: register}, 7 => asm{ rol {reg} }
	rol {reg: register} => 0b111110 @ reg
	roln {reg: register}, 0 => asm{ }
	roln {reg: register}, 1 => asm{ rol {reg} }
	roln {reg: register}, 2 => asm{ rol A } @ asm{ rol {reg} }
	roln {reg: register}, 3 => asm{ rol A } @ asm{ rol A } @ asm{ rol {reg} }
	roln {reg: register}, 4 => asm{ rol A } @ asm{ rol A } @ asm{ rol A } @ asm{ rol {reg} }
	roln {reg: register}, 5 => asm{ ror A } @ asm{ ror A } @ asm{ ror {reg} }
	roln {reg: register}, 6 => asm{ ror A } @ asm{ ror {reg} }
	roln {reg: register}, 7 => asm{ ror {reg} }
	bit {imm: i8} => 0b11111100 @ imm
	clr {reg: register} => asm{ li {reg}, 0 }
	mov {regd: register}, {regs: register} => 0b1001 @ regs @ regd
	movspla => 0b01101100
	movspha => 0b01101101
	movaspl => 0b01101110
	movasph => 0b01101111
	movf {reg: register} => 0b100011 @ reg
	ld {reg: register}, {addr: u16} => 0b101011 @ reg @ le(addr)
	ldo {reg: register}, {addr: u16} => 0b101100 @ reg @ le(addr)
	st {reg: register}, {addr: u16} => 0b101101 @ reg @ le(addr)
	sto {reg: register}, {addr: u16} => 0b101110 @ reg @ le(addr)
	lds {reg: register} => 0b101110 @ reg
	sts {reg: register} => 0b101111 @ reg
	li {reg: register}, {imm: i8} => 0b101010 @ reg @ imm
	push {reg: register} => asm{ sts {reg} } @ asm{ incsp }
	pop {reg: register} => asm{ decsp } @ asm{ lds {reg} }
	peek {reg: register} => asm{ pop {reg} } @ asm{ incsp }
	incx => 0b01110000
	incsp  => asm{ movaspl } @ asm{ addi A, 1 } @ asm{ movspla } @ asm{ movasph } @ asm{ addci A, 0 } @ asm{ movspha }
	incm {addr: u16} => asm{ ld X, {addr} } @ asm{ incx } @ asm{ st X, {addr} }
	decx => 0b01110001
	decsp  => asm{ movaspl } @ asm{ addi A, -1 } @ asm{ movspla } @ asm{ movasph } @ asm{ subci A, 0 } @ asm{ movspha }
	decm {addr: u16} => asm{ ld X, {addr} } @ asm{ decx } @ asm{ st X, {addr} }
	out7sd {reg: register} => 0b001111 @ reg
	out7sdi {imm: i8} => 0b00111011 @ imm
	outlcdc {reg: register} => 0b010011 @ reg
	outlcdic {imm: i8} => 0b01001011 @ imm
	outlcdd {reg: register} => 0b010111 @ reg
	outlcdid {imm: i8} => 0b01011011 @ imm
	nop => 0b00000000
	hlt => 0b00000001
	call {addr: u16} => 0b00000010 @ le(addr)
	ret => 0b00000011
	jmp {addr: u16} => 0b00000101 @ le(addr)
	beq {addr: u16} => asm{ bzs {addr} }
	beqi {imm: i8}, {addr: u16} => asm{ li TMP, {imm} } @ asm{ beq {addr} }
	bne {addr: u16} => asm{ bzc {addr} }
	bnei {imm: i8}, {addr: u16} => asm{ li TMP, {imm} } @ asm{ bne {addr} }
	blt {addr: u16} => 0b10000000 @ le(addr)
	blti {imm: i8}, {addr: u16} => asm{ li TMP, {imm} } @ asm{ blt {addr} }
	bltu {addr: u16} => asm{ bcc {addr} }
	bltiu {imm: i8}, {addr: u16} => asm{ li TMP, {imm} } @ asm{ bltu {addr} }
	ble {addr: u16} => 0b10100000 @ le(addr)
	blei {imm: i8}, {addr: u16} => asm{ li TMP, {imm} } @ asm{ ble {addr} }
	bleu {addr: u16} => 0b11000000 @ le(addr)
	bleiu {imm: i8}, {addr: u16} => asm{ li TMP, {imm} } @ asm{ bleu {addr} }
	bge {addr: u16} => 0b10000001 @ le(addr)
	bgei {imm: i8}, {addr: u16} => asm{ li TMP, {imm} } @ asm{ bge {addr} }
	bgeu {addr: u16} => asm{ bcs {addr} }
	bgeiu {imm: i8}, {addr: u16} => asm{ li TMP, {imm} } @ asm{ bgeu {addr} }
	bgt {addr: u16} => 0b10100001 @ le(addr)
	bgti {imm: i8}, {addr: u16} => asm{ li TMP, {imm} } @ asm{ bgt {addr} }
	bgtu {addr: u16} => 0b11000001 @ le(addr)
	bgtiu {imm: i8}, {addr: u16} => asm{ li TMP, {imm} } @ asm{ bgtu {addr} }
	bzs {addr: u16} => 0b00001000 @ le(addr)
	bzc {addr: u16} => 0b00001001 @ le(addr)
	bcs {addr: u16} => 0b00100000 @ le(addr)
	bcc {addr: u16} => 0b00100001 @ le(addr)
	bns {addr: u16} => 0b01000000 @ le(addr)
	bnc {addr: u16} => 0b01000001 @ le(addr)
	bvs {addr: u16} => 0b01100000 @ le(addr)
	bvc {addr: u16} => 0b01100001 @ le(addr)
}

#bank ROM
