---
title: Instruction Set
layout: default
nav_order: 2
---

:point_right: Click to switch representation:

[Instruction Set Overview](./overview.html){: .btn .btn-green}
[OpCode Matrix](./opcode-matrix.html){: .btn .btn-outline}
[Instruction Details](./details.html){: .btn .btn-outline}

---

{: .highlight }
This instruction set is work in progress and can change anytime.

{: .note }
The opcodes are not set yet and will be added later.

{: .note }
A = A-Register<br>
B = B-Register<br>
X = X-Register<br>
TMP = TMP-Register<br>
SP = Stack-Pointer<br>
SP_L = SP_L-Register<br>
SP_H = SP_H-Register<br>
ZF = Zero flag<br>
NF = Negative flag<br>
CF = Carry flag<br>
VF = Overflow flag<br>

{: .note }
Mnemonics with an asterisk are pseudo-instructions, their mapped instructions can be seen [here](#pseudo-instructions). <br> <br>
Angle brackets indicate an argument (\<arg>). These are not written out in Assembly, but are replaced with their actual values. <br> <br>
A \<reg> argument means that you can input the A-, B-, X- or TMP-register there. Other registers are not allowed in this case and may have separate instructions.

## ALU instructions

All ALU-operations are performed on the A-register (and the TMP-register as a second operand, if it's a binary operation).

| OpCode | mnemonic | Instruction         | Description                      |
| :----- | :------- | :------------------ | :------------------------------- |
| ?      | add      | add \<reg>          | \<reg> = A + TMP                 |
| ?      | addi     | addi \<reg>, \<imm> | \<reg> = A + \<imm>              |
| ?      | addc     | addc \<reg>         | \<reg> = A + TMP + CF            |
| ?      | sub      | sub \<reg>          | \<reg> = A - TMP                 |
| ?      | subc     | subc \<reg>         | \<reg> = A - TMP - (1-CF)        |
| ?      | and      | and \<reg>          | \<reg> = A & TMP                 |
| ?      | andi     | andi \<reg>, \<imm> | \<reg> = A & \<imm>              |
| ?      | or       | or \<reg>           | \<reg> = A \| TMP                |
| ?      | ori      | ori \<reg>, \<imm>  | \<reg> = A \| \<imm>             |
| ?      | xor      | xor \<reg>          | \<reg> = A ^ TMP                 |
| ?      | xori     | xor \<reg>, \<imm>  | \<reg> = A ^ \<imm>              |
| ?      | not      | not \<reg>          | \<reg> = ~A                      |
| ?      | \*neg    | neg \<reg>          | \<reg> = ~A + 1                  |
| ?      | shl      | shl \<reg>          | \<reg> = A \<< 1                 |
| ?      | slr      | slr \<reg>          | \<reg> = A \>> 1                 |
| ?      | sar      | sar \<reg>          | \<reg> = A \>> 1 (sign-extended) |
| ?      | ror      | ror \<reg>          | Rotate A right by one bit        |
| ?      | \*rorn   | rorn \<reg>, \<n>   | Rotate A right by \<n> bits      |
| ?      | \*rol    | rol \<reg>          | Rotate A left by one bit         |
| ?      | \*roln   | roln \<reg>, \<n>   | Rotate A left by \<n> bits       |
| ?      | bit      | bit \<imm>          | A & \<imm>, only updates flags   |

## Register, load & store Instructions

| OpCode | mnemonic | Instruction          | Description                     |
| :----- | :------- | :------------------- | :------------------------------ |
| ?      | \*clr    | clr \<reg>           | \<reg> = 0                      |
| ?      | mov      | mov \<regd>, \<regs> | \<regd> = \<regs>               |
| ?      | movf     | movf \<reg>          | \<reg> = Flag Register          |
| ?      | ld       | ld \<reg>, \<addr>   | \<reg> = mem[\<addr>]           |
| ?      | ldo      | ldo \<reg>, \<addr>  | \<reg> = mem[\<addr> + X]       |
| ?      | st       | st \<reg>, \<addr>   | mem[\<addr>] = \<reg>           |
| ?      | sto      | sto \<reg>, \<addr>  | mem[\<addr> + X] = \<reg>       |
| ?      | ldsp     | ldsp \<reg>          | \<reg> = mem[SP]                |
| ?      | stsp     | stsp \<reg>          | mem[SP] = \<reg>                |
| ?      | li       | li \<reg>, \<imm>    | \<reg> = \<imm>                 |
| ?      | \*push   | push \<reg>          | SP = SP - 1, mem[SP] = \<reg>   |
| ?      | \*pop    | pop \<reg>           | \<reg> = mem[SP], SP = SP + 1   |
| ?      | \*peek   | peek \<reg>          | \<reg> = mem[SP]                |
| ?      | incx     | incx                 | X= X + 1                        |
| ?      | \*incsp  | incsp                | SP = SP + 1                     |
| ?      | \*incm   | incm \<addr>         | mem[\<addr>] = mem[\<addr>] + 1 |
| ?      | decx     | decx                 | X = X - 1                       |
| ?      | \*decsp  | decsp                | SP = SP - 1                     |
| ?      | \*decm   | decm \<addr>         | mem[\<addr>] = mem[\<addr>] - 1 |

## I/O Instructions

| OpCode | mnemonic | Instruction     | Description                                                           |
| :----- | :------- | :-------------- | :-------------------------------------------------------------------- |
| ?      | out7sd   | out7sd \<reg>   | Outputs the value in the given register to the 7-segment display      |
| ?      | outlcdc  | outlcdc \<reg>  | Outputs the value in the given register to the LCD-display as control |
| ?      | outlcdci | outlcdci \<imm> | Outputs the immediate value to the LCD-display as control             |
| ?      | outlcdd  | outlcdd \<reg>  | Outputs the value in the given register to the LCD-display as data    |
| ?      | outlcddi | outlcddi \<imm> | Outputs the immediate value to the LCD-display as data                |

## System Instructions

| OpCode | mnemonic | Instruction  | Description                                                                    |
| :----- | :------- | :----------- | :----------------------------------------------------------------------------- |
| ?      | nop      | nop          | Does nothing                                                                   |
| ?      | hlt      | hlt          | Halts the entire computer. This instruction is called in the end of a program. |
| ?      | call     | call \<addr> | Calls the function placed at the given address                                 |
| ?      | ret      | ret          | Returns from a function call                                                   |

## Branch- and Jump Instructions

The given \<addr> is the absolute address to which the computer jumps or branches to.

| OpCode | mnemonic | Instruction           | Description                       |
| :----- | :------- | :-------------------- | :-------------------------------- |
| ?      | jmp      | jmp \<addr>           | PC = \<addr>                      |
| ?      | beq      | beq \<addr>           | branch if A == TMP                |
| ?      | beqi     | beqi \<addr>          | branch if A == \<imm>             |
| ?      | bne      | bne \<addr>           | branch if A != TMP                |
| ?      | bnei     | bnei \<imm>, \<addr>  | branch if A != \<imm>             |
| ?      | blt      | blt \<addr>           | branch if A \< TMP                |
| ?      | blti     | blti \<imm>, \<addr>  | branch if A \< \<imm>             |
| ?      | bltu     | bltu \<addr>          | branch if A \< TMP (unsigned)     |
| ?      | bltiu    | bltiu \<imm>, \<addr> | branch if A \< \<imm> (unsigned)  |
| ?      | ble      | ble \<addr>           | branch if A \<= TMP               |
| ?      | blei     | blei \<imm>, \<addr>  | branch if A \<= \<imm>            |
| ?      | bleu     | bleu \<addr>          | branch if A \<= TMP (unsigned)    |
| ?      | bleiu    | bleiu \<imm>, \<addr> | branch if A \<= \<imm> (unsigned) |
| ?      | bge      | bge \<addr>           | branch if A \>= TMP               |
| ?      | bgei     | bgei \<imm>, \<addr>  | branch if A \>= \<imm>            |
| ?      | bgeu     | bgeu \<addr>          | branch if A \>= TMP (unsigned)    |
| ?      | bgeiu    | bgeiu \<imm>, \<addr> | branch if A \>= \<imm> (unsigned) |
| ?      | bgt      | bgt \<addr>           | branch if A \> TMP                |
| ?      | bgti     | bgti \<imm>, \<addr>  | branch if A \> \<imm>             |
| ?      | bgtu     | bgtu \<addr>          | branch if A \> TMP (unsigned)     |
| ?      | bgtiu    | bgtiu \<imm>, \<addr> | branch if A \> \<imm> (unsigned)  |
| ?      | bns      | bns \<addr>           | branch if NF is set               |
| ?      | bnc      | bnc \<addr>           | branch if NF is not set           |
| ?      | bcs      | bcs \<addr>           | branch if CF is set               |
| ?      | bcc      | bcc \<addr>           | branch if CF is not set           |
| ?      | bvs      | bvs \<addr>           | branch if VF is set               |
| ?      | bvc      | bvc \<addr>           | branch if VF is not set           |

## Pseudo-Instructions

Some of the instructions/mnemonics in the upper tables have an asterisk, which means that they are pseudo-instructions. Pseudo-instructions are aren't hardcoded into the controller and have no dedicated opcode, instead, they use other instructions of the ISA. Their purpose is to make programming more convenient by having to write less or more understandable instructions/code.
Here is a list of all pseudo-instructions that were mentioned in the tables above, with their mapped instructions.

| OpCode | mnemonic | Mapped Instruction                                                                          |
| :----- | :------- | :------------------------------------------------------------------------------------------ |
| ?      | \*neg    | not A <br> addi \<reg>, 1                                                                   |
| ?      | rorn     | executes "ror \<reg>" n times                                                               |
| ?      | rol      | executes "ror \<reg>" (8-n) times                                                           |
| ?      | roln     | executes "rol \<reg>" n times                                                               |
| ?      | clr      | li \<reg>, 0                                                                                |
| ?      | push     | decsp <br> stsp \<reg>                                                                      |
| ?      | pop      | peek \<reg> <br> incsp                                                                      |
| ?      | peek     | ldsp \<reg>                                                                                 |
| ?      | incsp    | mov SP_L, A <br> addi SP_L, 1 <br> mov SP_H, A <br> addc SP_H <br> //TODO: Test if correct  |
| ?      | decsp    | mov SP_L, A <br> addi SP_L, -1 <br> mov SP_H, A <br> subc SP_H <br> //TODO: Test if correct |
