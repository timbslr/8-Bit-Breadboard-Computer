---
title: Instruction Set
layout: default
nav_order: 2
---

{: .highlight }
This instruction set is work in progress and can change anytime.

{: .note }
The opcodes are not set yet and will be added later.

{: .note }
Mnemonics with an asterisk are pseudo-instructions, their mapped instructions can be seen [here](#pseudo-instructions).

## ALU instructions

| OpCode | mnemonic | Instruction         | Description                                                                                  |
| :----- | :------- | :------------------ | :------------------------------------------------------------------------------------------- |
| ?      | add      | add \<reg>          | Adds the value of the A-register and the TMP-register and stores it in another register      |
| ?      | sub      | add \<reg>          | Subtracts the value of the A-register and the TMP-register and stores it in another register |
| ?      | \*addi   | addi \<reg>, \<imm> | Adds the value in the A-register and the immediate and stores it in another register         |
| ?      | \*subi   | subi \<reg>, \<imm> | Subtracts the immediate from the value in the A-register and stores it in another register   |
| ?      | cmp      | cmp \<reg>, \<reg>  | Compares the two registers and sets the flag. It does not store the result.                  |

## Register, load & store Instructions

| OpCode | mnemonic | Instruction          | Description                                                                       |
| :----- | :------- | :------------------- | :-------------------------------------------------------------------------------- |
| ?      | \*clr    | clr \<reg>           | Clears a given register by setting its value to zero                              |
| ?      | mov      | mov \<regd>, \<regs> | Moves a value from register regs to register regd                                 |
| ?      | ld       | ld \<reg>, \<addr>   | Loads the value from the given memory-address and stores it in the given register |
| ?      | st       | st \<reg>, \<addr>   | Stores the value from the given register into memory at the given memory-address  |
| ?      | li       | li \<reg>, \<imm>    | Stores the given immediate in the given register                                  |
| ?      | \*push   | push \<reg>          | Pushes the value in a given register onto the stack                               |
| ?      | \*pop    | pop \<reg>           | Pops a value from the stack and stores it in the given register                   |
| ?      | \*inc    | inc \<reg>           | Increments the value in the given register by one                                 |
| ?      | \*dec    | dec \<reg>           | Decrements the value in the given register by one                                 |

## I/O Instructions

| OpCode | mnemonic | Instruction | Description                                                      |
| :----- | :------- | :---------- | :--------------------------------------------------------------- |
| ?      | out7sd   | out7sd      | Outputs the value in the given register to the 7-segment display |
| ?      | outlcd   | outlcd      | Outputs the value in the given register to the LCD-display       |

## System Instructions

| OpCode | mnemonic | Instruction  | Description                                                                    |
| :----- | :------- | :----------- | :----------------------------------------------------------------------------- |
| ?      | nop      | nop          | Does nothing                                                                   |
| ?      | hlt      | hlt          | Halts the entire computer. This instruction is called in the end of a program. |
| ?      | rst      | rst          | Resets the computer by enabling the reset bit                                  |
| ?      | call     | call \<addr> | Calls the function placed on the given address                                 |

## Branch- and Jump Instructions

| OpCode | mnemonic | Instruction                   | Description                                                                      |
| :----- | :------- | :---------------------------- | :------------------------------------------------------------------------------- |
| ?      | jmp      | jmp \<addr>                   | Jumps to the 16-Bit address a.                                                   |
| ?      | jal      | jal \<reg>, \<addr>           | Jumps to the 16-Bit address and stores the previous PC into the given register   |
| ?      | beq      | beq \<reg1>, \<reg2>, \<addr> | Branches to the given address if the values in the given registers are equal     |
| ?      | bne      | bne \<reg2>, \<reg2>, \<addr> | Branches to the given address if the values in the given registers not are equal |
| ?      | bcr      | bcr \<addr>                   | Branches to the given address if the carry flag is set                           |
| ?      | bzr      | bzr \<addr>                   | Branches to the given address if the zero flag is set                            |

## Pseudo-Instructions

Some of the instructions/mnemonics in the upper tables have an asterisk, which means that they are pseudo-instructions. Pseudo-instructions are aren't hardcoded into the controller, instead they use other instructions of the system. Their purpose is to make programming for convenient by having to write less or more understandable code/mnemonics.
Here is a list of all pseudo-instructions that were mentioned in the tables above, with their mapped instructions.

| OpCode | mnemonic | Mapped Instruction                                                                            |
| :----- | :------- | :-------------------------------------------------------------------------------------------- |
| ?      | clr      | li \<reg>, 0                                                                                  |
| ?      | addi     | li TMP, \<imm> \<br> add \<reg>                                                               |
| ?      | subi     | li TMP \<br>, \<imm> sub \<reg>                                                               |
| ?      | push     | TODO, 8-bit ALU has to make two steps in order to decrement the 16 bit stack-pointer register |
| ?      | pop      | TODO, 8-bit ALU has to make two steps in order to increment the 16 bit stack-pointer register |
