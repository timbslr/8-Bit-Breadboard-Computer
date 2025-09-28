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

{: #ALU-table}

|   OpCode   | mnemonic   | Instruction | Description |
| :--------: | :--------- | :---------- | :---------- |
| Loading... | Loading... | Loading...  | Loading...  |

## Register, load & store Instructions

{: #REG-MEM-table}

|   OpCode   | mnemonic   | Instruction | Description |
| :--------: | :--------- | :---------- | :---------- |
| Loading... | Loading... | Loading...  | Loading...  |

## I/O Instructions

{: #I-O-table}

|   OpCode   | mnemonic   | Instruction | Description |
| :--------: | :--------- | :---------- | :---------- |
| Loading... | Loading... | Loading...  | Loading...  |

## System Instructions

{: #SYS-table}

|   OpCode   | mnemonic   | Instruction | Description |
| :--------: | :--------- | :---------- | :---------- |
| Loading... | Loading... | Loading...  | Loading...  |

## Branch- and Jump Instructions

The given \<addr> is the absolute address to which the computer jumps or branches to.

{: #BR-JMP-table}

|   OpCode   | mnemonic   | Instruction | Description |
| :--------: | :--------- | :---------- | :---------- |
| Loading... | Loading... | Loading...  | Loading...  |

## Pseudo-Instructions

Some of the instructions/mnemonics in the upper tables have an asterisk, which means that they are pseudo-instructions. Pseudo-instructions are aren't hardcoded into the controller and have no dedicated opcode, instead, they use other instructions of the ISA. Their purpose is to make programming more convenient by having to write less or more understandable instructions/code.
Here is a list of all pseudo-instructions that were mentioned in the tables above, with their mapped instructions.

{: #pseudo-instructions-table}

| mnemonic   | Mapped Instruction |
| :--------- | :----------------- |
| Loading... | Loading...         |

<script src="./loadData.js">
