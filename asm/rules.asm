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
  X    => 0b100
  Y    => 0b101
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
	add                                                       => 0b11010000
	addi {imm: i8}                                            => asm{ li TMP, {imm} } @ asm{ add }
	addc                                                      => 0b00100100
	addci {imm: i8}                                           => asm{ li TMP, {imm} } @ asm{ addc }
	sub                                                       => 0b11010010
	subc                                                      => 0b00100101
	subci {imm: i8}                                           => asm{ li TMP, {imm} } @ asm{ subc }
	and                                                       => 0b11100010
	andi {imm: i8}                                            => asm{ li TMP, {imm} } @ asm{ and }
	or                                                        => 0b11100011
	ori {imm: i8}                                             => asm{ li TMP, {imm} } @ asm{ or }
	xor                                                       => 0b11110011
	xori {imm: i8}                                            => asm{ li TMP, {imm} } @ asm{ xor }
	not                                                       => 0b11100100
	neg                                                       => asm{ not } @ asm{ addi 1 }
	shl                                                       => 0b11110010
	slr                                                       => 0b11010001
	sar                                                       => 0b11110000
	ror                                                       => 0b11110100
	rol                                                       => 0b11110001
	clr {reg: register}                                       => asm{ li {reg}, 0 }
	mov BUF, A                                                => 0b10101111
	mov TMP, BUF                                              => 0b10111111
	mov A, F                                                  => 0b10011110
	mov TMP, F                                                => 0b10101110
	mov B, F                                                  => 0b10111110
	mov C, F                                                  => 0b11001110
	mov X, F                                                  => 0b11011110
	mov Y, F                                                  => 0b11101110
	mov {regd: register}, {regs: register}                    =>
		{
			regd == regs ? 0b0`0 : ; optimization: if registers are the same, don't emit an instruction
			regd == 0b000 ? (
				regs == 0b010 ? 0b10111000`8 :
				regs == 0b011 ? 0b11001000`8 :
				regs == 0b001 ? 0b10101000`8 :
				regs == 0b100 ? 0b11011000`8 :
				regs == 0b101 ? 0b10011101`8 :
				assert(false, "Invalid mov combination found!")
			) :
			regd == 0b010 ? (
				regs == 0b000 ? 0b10011001`8 :
				regs == 0b011 ? 0b11001010`8 :
				regs == 0b001 ? 0b10101001`8 :
				regs == 0b100 ? 0b11011010`8 :
				regs == 0b101 ? 0b10111101`8 :
				assert(false, "Invalid mov combination found!")
			) :
			regd == 0b011 ? (
				regs == 0b000 ? 0b10011010`8 :
				regs == 0b010 ? 0b10111010`8 :
				regs == 0b001 ? 0b10101010`8 :
				regs == 0b100 ? 0b11011011`8 :
				regs == 0b101 ? 0b11001101`8 :
				assert(false, "Invalid mov combination found!")
			) :
			regd == 0b001 ? (
				regs == 0b000 ? 0b10011000`8 :
				regs == 0b010 ? 0b10111001`8 :
				regs == 0b011 ? 0b11001001`8 :
				regs == 0b100 ? 0b11011001`8 :
				regs == 0b101 ? 0b10101101`8 :
				assert(false, "Invalid mov combination found!")
			) :
			regd == 0b100 ? (
				regs == 0b000 ? 0b10011011`8 :
				regs == 0b010 ? 0b10111011`8 :
				regs == 0b011 ? 0b11001011`8 :
				regs == 0b001 ? 0b10101011`8 :
				regs == 0b101 ? 0b11011101`8 :
				assert(false, "Invalid mov combination found!")
			) :
			regd == 0b101 ? (
				regs == 0b000 ? 0b10011100`8 :
				regs == 0b010 ? 0b10111100`8 :
				regs == 0b011 ? 0b11001100`8 :
				regs == 0b001 ? 0b10101100`8 :
				regs == 0b100 ? 0b11011100`8 :
				assert(false, "Invalid mov combination found!")
			) :
			assert(false, "Invalid mov combination found!")
		}
	ld {reg: register}, {addr: u16}                           => 0b00010 @ reg @ le(addr)
	ldo {reg: register}, {idxreg: idxregister}, {addr: u16}   => 0b0011 @ reg @ idxreg @ le(addr)
	ldsprel {reg: register}, {imm: i8}                        => 0b01010 @ reg @ imm
	st {reg: register}, {addr: u16}                           => 0b00011 @ reg @ le(addr)
	sto {reg: register}, {idxreg: idxregister}, {addr: u16}   => 0b0100 @ reg @ idxreg @ le(addr)
	stsprel {reg: register}, {addr: u16}                      => 0b01011 @ reg @ le(addr)
	li {reg: register}, {imm: i8}                             => 0b01101 @ reg @ imm
	push {reg: register}                                      => 0b10010 @ reg
	pop {reg: register}                                       => 0b10100 @ reg
	peek {reg: register}                                      => 0b10110 @ reg
	incx                                                      => 0b01100100
	incy                                                      => 0b01100110
	incm {addr: u16}                                          => asm{ ld X, {addr} } @ asm{ incx } @ asm{ st X, {addr} }
	decx                                                      => 0b01100101
	decy                                                      => 0b01100111
	decm {addr: u16}                                          => asm{ ld X, {addr} } @ asm{ decx } @ asm{ st X, {addr} }
	out7sd {reg: register}                                    => 0b00101 @ reg
	s7sdsm                                                    => 0b11000010
	s7sdum                                                    => 0b00000011
	out7sdi {imm: i8}                                         => 0b00101111 @ imm
	outlcd {lcdreg: lcdregister}, {reg: register}             => 0b1000 @ lcdreg @ reg
	outlcdi {lcdreg: lcdregister}, {imm: i8}                  => 0b1000 @ lcdreg @ 0b111 @ imm
	lcdrda {lcdreg: lcdregister}                              => 0b1000 @ lcdreg @ 0b110
	rxrd {reg: register}                                      => 0b01110 @ reg
	txsend {reg: register}                                    => 0b01111 @ reg
	txsendi {imm: i8}                                         => 0b01111111 @ imm
	nop                                                       => 0b00000000
	hlt                                                       => 0b00000001
	call {addr: u16}                                          => 
		asm{
			li TMP, nextInstructionAddress[15:8]
			push TMP
			li TMP, nextInstructionAddress[7:0]
			push TMP
			jmp {addr}
			nextInstructionAddress:
		}
	ret                                                       => 0b00000111
	jmp {addr: u16}                                           => 0b00000101 @ le(addr)
	jmpr                                                      => 0b00000110
	jmpind {addr: u16}                                        => 0b00100110 @ le(addr)
	beq {addr: u16}                                           => 0b00001010 @ le(addr)
	beqi {imm: i8}, {addr: u16}                               => asm{ li TMP, {imm} } @ asm{ beq {addr} }
	bne {addr: u16}                                           => 0b00001011 @ le(addr)
	bnei {imm: i8}, {addr: u16}                               => asm{ li TMP, {imm} } @ asm{ bne {addr} }
	blt {addr: u16}                                           => 0b10010110 @ le(addr)
	blti {imm: i8}, {addr: u16}                               => asm{ li TMP, {imm} } @ asm{ blt {addr} }
	bltu {addr: u16}                                          => 0b00100010 @ le(addr)
	bltiu {imm: i8}, {addr: u16}                              => asm{ li TMP, {imm} } @ asm{ bltu {addr} }
	ble {addr: u16}                                           => 0b10100110 @ le(addr)
	blei {imm: i8}, {addr: u16}                               => asm{ li TMP, {imm} } @ asm{ ble {addr} }
	bleu {addr: u16}                                          => 0b11000000 @ le(addr)
	bleiu {imm: i8}, {addr: u16}                              => asm{ li TMP, {imm} } @ asm{ bleu {addr} }
	bge {addr: u16}                                           => 0b10010111 @ le(addr)
	bgei {imm: i8}, {addr: u16}                               => asm{ li TMP, {imm} } @ asm{ bge {addr} }
	bgeu {addr: u16}                                          => 0b00100011 @ le(addr)
	bgeiu {imm: i8}, {addr: u16}                              => asm{ li TMP, {imm} } @ asm{ bgeu {addr} }
	bgt {addr: u16}                                           => 0b10100111 @ le(addr)
	bgti {imm: i8}, {addr: u16}                               => asm{ li TMP, {imm} } @ asm{ bgt {addr} }
	bgtu {addr: u16}                                          => 0b11000001 @ le(addr)
	bgtiu {imm: i8}, {addr: u16}                              => asm{ li TMP, {imm} } @ asm{ bgtu {addr} }
	bzs {addr: u16}                                           => 0b00001000 @ le(addr)
	bzc {addr: u16}                                           => 0b00001001 @ le(addr)
	bcs {addr: u16}                                           => 0b00100000 @ le(addr)
	bcc {addr: u16}                                           => 0b00100001 @ le(addr)
	bns {addr: u16}                                           => 0b11110101 @ le(addr)
	bnc {addr: u16}                                           => 0b11110110 @ le(addr)
	bvs {addr: u16}                                           => 0b01100000 @ le(addr)
	bvc {addr: u16}                                           => 0b01100001 @ le(addr)
	brxrdys {addr: u16}                                       => 0b11100000 @ le(addr)
	brxrdyc {addr: u16}                                       => 0b11100001 @ le(addr)
	btxrdys {addr: u16}                                       => 0b11101000 @ le(addr)
	btxrdyc {addr: u16}                                       => 0b11101001 @ le(addr)
		
	; Syntactic Sugar Rules:
	ld {reg: register}, {idxreg: idxregister}[{addr: u16}]    => asm{ ldo {reg}, {idxreg}, {addr}  } 
	st {reg: register}, {idxreg: idxregister}[{addr: u16}]    => asm{ sto {reg}, {idxreg}, {addr}  } 
	ld {reg: register}, {imm: i8}[SP]                         => asm{ ldsprel {reg}, {imm} } 
	st {reg: register}, {imm: i8}[SP]                         => asm{ stsprel {reg}, {imm} } 
	jmp [A, TMP]                                              => asm{ jmpr } 
	jmp ({addr: u16})                                         => asm{ jmpind {addr} }
	add {reg1: register}, {reg2: register}, {reg3: register}  => 
    {
      reg3 == 0b000 && reg2 != 0b000 ?  ; if reg3 is A (and reg2 is not A), it would be overwritten before the value can be read
      asm{ mov BUF, {reg3} } @ asm{ mov A, {reg2} } @ asm{ mov TMP, BUF } @ asm{ add } @ asm{ mov {reg1}, A } : ; so cache it in the BUF-Register
      asm{ mov A, {reg2} } @ asm{ mov TMP, {reg3} } @ asm{ add } @ asm{ mov {reg1}, A }
    }
	addc {reg1: register}, {reg2: register}, {reg3: register} => 
    {
      reg3 == 0b000 && reg2 != 0b000 ?  ; if reg3 is A (and reg2 is not A), it would be overwritten before the value can be read
      asm{ mov BUF, {reg3} } @ asm{ mov A, {reg2} } @ asm{ mov TMP, BUF } @ asm{ addc } @ asm{ mov {reg1}, A } : ; so cache it in the BUF-Register
      asm{ mov A, {reg2} } @ asm{ mov TMP, {reg3} } @ asm{ addc } @ asm{ mov {reg1}, A }
    }
	sub {reg1: register}, {reg2: register}, {reg3: register}  => 
    {
      reg3 == 0b000 && reg2 != 0b000 ?  ; if reg3 is A (and reg2 is not A), it would be overwritten before the value can be read
      asm{ mov BUF, {reg3} } @ asm{ mov A, {reg2} } @ asm{ mov TMP, BUF } @ asm{ sub } @ asm{ mov {reg1}, A } : ; so cache it in the BUF-Register
      asm{ mov A, {reg2} } @ asm{ mov TMP, {reg3} } @ asm{ sub } @ asm{ mov {reg1}, A }
    }
	subc {reg1: register}, {reg2: register}, {reg3: register} => 
    {
      reg3 == 0b000 && reg2 != 0b000 ?  ; if reg3 is A (and reg2 is not A), it would be overwritten before the value can be read
      asm{ mov BUF, {reg3} } @ asm{ mov A, {reg2} } @ asm{ mov TMP, BUF } @ asm{ subc } @ asm{ mov {reg1}, A } : ; so cache it in the BUF-Register
      asm{ mov A, {reg2} } @ asm{ mov TMP, {reg3} } @ asm{ subc } @ asm{ mov {reg1}, A }
    }
	and {reg1: register}, {reg2: register}, {reg3: register}  => 
    {
      reg3 == 0b000 && reg2 != 0b000 ?  ; if reg3 is A (and reg2 is not A), it would be overwritten before the value can be read
      asm{ mov BUF, {reg3} } @ asm{ mov A, {reg2} } @ asm{ mov TMP, BUF } @ asm{ and } @ asm{ mov {reg1}, A } : ; so cache it in the BUF-Register
      asm{ mov A, {reg2} } @ asm{ mov TMP, {reg3} } @ asm{ and } @ asm{ mov {reg1}, A }
    }
	or {reg1: register}, {reg2: register}, {reg3: register}   => 
    {
      reg3 == 0b000 && reg2 != 0b000 ?  ; if reg3 is A (and reg2 is not A), it would be overwritten before the value can be read
      asm{ mov BUF, {reg3} } @ asm{ mov A, {reg2} } @ asm{ mov TMP, BUF } @ asm{ or } @ asm{ mov {reg1}, A } : ; so cache it in the BUF-Register
      asm{ mov A, {reg2} } @ asm{ mov TMP, {reg3} } @ asm{ or } @ asm{ mov {reg1}, A }
    }
	xor {reg1: register}, {reg2: register}, {reg3: register}  => 
    {
      reg3 == 0b000 && reg2 != 0b000 ?  ; if reg3 is A (and reg2 is not A), it would be overwritten before the value can be read
      asm{ mov BUF, {reg3} } @ asm{ mov A, {reg2} } @ asm{ mov TMP, BUF } @ asm{ xor } @ asm{ mov {reg1}, A } : ; so cache it in the BUF-Register
      asm{ mov A, {reg2} } @ asm{ mov TMP, {reg3} } @ asm{ xor } @ asm{ mov {reg1}, A }
    }
	addi {reg1: register}, {reg2: register}, {imm: i8}        => asm{ mov A, {reg2} } @ asm{ addi {imm} } @ asm{ mov {reg1}, A }
	addci {reg1: register}, {reg2: register}, {imm: i8}       => asm{ mov A, {reg2} } @ asm{ addci {imm} } @ asm{ mov {reg1}, A }
	subci {reg1: register}, {reg2: register}, {imm: i8}       => asm{ mov A, {reg2} } @ asm{ subci {imm} } @ asm{ mov {reg1}, A }
	andi {reg1: register}, {reg2: register}, {imm: i8}        => asm{ mov A, {reg2} } @ asm{ andi {imm} } @ asm{ mov {reg1}, A }
	ori {reg1: register}, {reg2: register}, {imm: i8}         => asm{ mov A, {reg2} } @ asm{ ori {imm} } @ asm{ mov {reg1}, A }
	xori {reg1: register}, {reg2: register}, {imm: i8}        => asm{ mov A, {reg2} } @ asm{ xori {imm} } @ asm{ mov {reg1}, A }
	not {reg1: register}, {reg2: register}                    => asm{ mov A, {reg2} } @ asm{ not } @ asm{ mov {reg1}, A }
	negate {reg1: register}, {reg2: register}                 => asm{ mov A, {reg2} } @ asm{ negate } @ asm{ mov {reg1}, A }
	shl {reg1: register}, {reg2: register}                    => asm{ mov A, {reg2} } @ asm{ shl } @ asm{ mov {reg1}, A }
	slr {reg1: register}, {reg2: register}                    => asm{ mov A, {reg2} } @ asm{ slr } @ asm{ mov {reg1}, A }
	sar {reg1: register}, {reg2: register}                    => asm{ mov A, {reg2} } @ asm{ sar } @ asm{ mov {reg1}, A }
	ror {reg1: register}, {reg2: register}                    => asm{ mov A, {reg2} } @ asm{ ror } @ asm{ mov {reg1}, A }
	rol {reg1: register}, {reg2: register}                    => asm{ mov A, {reg2} } @ asm{ rol } @ asm{ mov {reg1}, A }
}

#bank ROM
