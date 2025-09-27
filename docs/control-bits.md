---
title: Control Bits
layout: default
nav_order: 4
---

Each module (Registers, ALU, memory, ...) has multiple input bits that control the function of the module: Whether it loads data from the bus, outputs data to the bus, resets the module, which operation it should compute, etc. The name, abbreviation in the schematic and the description of each control bit is listed in the following table:

{: .note }
s/a stands for synchronous/asynchronous

## Program Counter (PC)

| Abbreviation                                              | Name                  | s/a | Description                                                     |
| :-------------------------------------------------------- | :-------------------- | :-- | :-------------------------------------------------------------- |
| CE                                                        | Count Enable          | s   | Enables incrementing the PC on the next positive clock edge     |
| <span style="text-decoration: overline;"> IE_PC_L </span> | Input Enable PC Low   | s   | Enables loading data from the bus to the low byte of the PC     |
| <span style="text-decoration: overline;"> IE_PC_H </span> | Input Enable PC High  | s   | Enables loading data from the bus to the high byte of the PC    |
| <span style="text-decoration: overline;"> OE_PC_L </span> | Output Enable PC Low  | a   | Enables outputting data from the low byte of the PC to the bus  |
| <span style="text-decoration: overline;"> OE_PC_H </span> | Output Enable PC High | a   | Enables outputting data from the high byte of the PC to the bus |

## A-Register

| Abbreviation                                           | Name            | s/a | Description                                            |
| :----------------------------------------------------- | :-------------- | :-- | :----------------------------------------------------- |
| <span style="text-decoration: overline;"> IE_A </span> | Input Enable A  | s   | Enables loading data from the bus to the A-Register    |
| <span style="text-decoration: overline;"> OE_A </span> | Output Enable A | a   | Enables outputting data from the A-Register to the bus |

## Memory-Address-Register (MAR)

| Abbreviation                                               | Name                  | s/a | Description                                                   |
| :--------------------------------------------------------- | :-------------------- | :-- | :------------------------------------------------------------ |
| <span style="text-decoration: overline;"> IE_MAR_L </span> | Input Enable MAR Low  | s   | Enables loading data from the bus to the low byte of the MAR  |
| <span style="text-decoration: overline;"> IE_MAR_H </span> | Input Enable MAR High | s   | Enables loading data from the bus to the high byte of the MAR |

## Arithmetic Logic Unit (ALU)

| Abbreviation                                             | Name                     | s/a | Description                                                                                                                                                   |
| :------------------------------------------------------- | :----------------------- | :-- | :------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| <span style="text-decoration: overline;"> OE_ALU </span> | Output Enable ALU        | a   | Enables outputting the ALU-result to the bus                                                                                                                  |
| ALU_SRC                                                  | ALU Source               | a   | Sets the source of the ALU: 0 = arithmetic operation, 1 = bitwise operation                                                                                   |
| ALU_CIN                                                  | ALU Carry In             | a   | Sets the Carry In for the adders of the ALU                                                                                                                   |
| ALU_AOP                                                  | ALU Arithmetic Operation | a   | Sets the arithmetic operation of the ALU: <br> 0 = ADD <br> 1 = SUB                                                                                           |
| ALU_BOP[0:2]                                             | ALU Bitwise Operation    | a   | Sets the bitwise operation of the ALU: <br> 000 = AND <br> 001 = OR <br> 010 = XOR <br> 011 = NOT <br> 100 = SHL <br> 101 = SLR <br> 110 = SAR <br> 111 = ROR |

## Flags-Register

| Abbreviation                                           | Name                | s/a | Description                                                |
| :----------------------------------------------------- | :------------------ | :-- | :--------------------------------------------------------- |
| <span style="text-decoration: overline;"> IE_F </span> | Input Enable Flags  | s   | Enables loading data from the bus to the Flags-Register    |
| <span style="text-decoration: overline;"> OE_F </span> | Output Enable Flags | a   | Enables outputting data from the Flags-Register to the bus |

## Memory

| Abbreviation                                                | Name                       | s/a | Description                                                                                                              |
| :---------------------------------------------------------- | :------------------------- | :-- | :----------------------------------------------------------------------------------------------------------------------- |
| <span style="text-decoration: overline;"> MEM_WE </span>    | Memory Write Enable        | s   | Enables writing to RAM                                                                                                   |
| <span style="text-decoration: overline;"> MEM_EN_IO </span> | Memory Enable Input/Output | a   | Enables data flow between memory and bus (direction depends on <span style="text-decoration: overline;"> MEM_WE </span>) |

## Controller

| Abbreviation | Name               | s/a | Description                                                                                                             |
| :----------- | :----------------- | :-- | :---------------------------------------------------------------------------------------------------------------------- |
| RSC          | Reset Step Counter | a   | Resets the steps counter to zero. This is executed at the end of each instruction to reduce microsteps per instruction. |

## Temporary-Register (TMP)

| Abbreviation                                           | Name              | s/a | Description                                              |
| :----------------------------------------------------- | :---------------- | :-- | :------------------------------------------------------- |
| <span style="text-decoration: overline;"> IE_T </span> | Input Enable TMP  | s   | Enables loading data from the bus to the TMP-Register    |
| <span style="text-decoration: overline;"> OE_T </span> | Output Enable TMP | a   | Enables outputting data from the TMP-Register to the bus |

## B-Register

| Abbreviation                                           | Name            | s/a | Description                                            |
| :----------------------------------------------------- | :-------------- | :-- | :----------------------------------------------------- |
| <span style="text-decoration: overline;"> IE_B </span> | Input Enable B  | s   | Enables loading data from the bus to the B-Register    |
| <span style="text-decoration: overline;"> OE_B </span> | Output Enable B | a   | Enables outputting data from the B-Register to the bus |

## Instruction-Register (IR)

| Abbreviation                                            | Name                               | s/a | Description                                                      |
| :------------------------------------------------------ | :--------------------------------- | :-- | :--------------------------------------------------------------- |
| <span style="text-decoration: overline;"> IE_IR </span> | Input Enable Instruction Register  | s   | Enables loading data from the bus to the Instruction-Register    |
| <span style="text-decoration: overline;"> OE_IR </span> | Output Enable Instruction Register | a   | Enables outputting data from the Instruction-Register to the bus |

## X-Register

| Abbreviation                                           | Name            | s/a | Description                                            |
| :----------------------------------------------------- | :-------------- | :-- | :----------------------------------------------------- |
| <span style="text-decoration: overline;"> IE_X </span> | Input Enable X  | s   | Enables loading data from the bus to the X-Register    |
| <span style="text-decoration: overline;"> OE_X </span> | Output Enable X | a   | Enables outputting data from the X-Register to the bus |
| INC_X                                                  | Increment X     | s   | Increments the X-Register if DEC_X is low              |
| DEC_X                                                  | Decrement X     | s   | Decrements the X-Register if INC_X is low              |

## Page-Register-Buffer-Register (PRB)

| Abbreviation                                             | Name              | s/a | Description                                              |
| :------------------------------------------------------- | :---------------- | :-- | :------------------------------------------------------- |
| <span style="text-decoration: overline;"> IE_PRB </span> | Input Enable PRB  | s   | Enables loading data from the bus to the PRB-Register    |
| <span style="text-decoration: overline;"> OE_PRB </span> | Output Enable PRB | a   | Enables outputting data from the PRB-Register to the bus |

## 7-Segment Display

| Abbreviation                                             | Name                           | s/a | Description                                                                                         |
| :------------------------------------------------------- | :----------------------------- | :-- | :-------------------------------------------------------------------------------------------------- |
| <span style="text-decoration: overline;"> IE_7SD </span> | Input Enable 7-Segment Display | s   | Enables loading data from the bus to the 7-Segment Display (the data will be displayed immediately) |

## Stack Pointer (SP)

| Abbreviation                                              | Name                             | s/a | Description                                                                |
| :-------------------------------------------------------- | :------------------------------- | :-- | :------------------------------------------------------------------------- |
| <span style="text-decoration: overline;"> IE_SP_L </span> | Input Enable Stack Pointer Low   | s   | Enables loading data from the bus to the low byte of the Stack Pointer     |
| <span style="text-decoration: overline;"> IE_SP_H </span> | Input Enable Stack Pointer High  | s   | Enables loading data from the bus to the high byte of the Stack Pointer    |
| <span style="text-decoration: overline;"> OE_SP_L </span> | Output Enable Stack Pointer Low  | a   | Enables outputting data from the low byte of the Stack Pointer to the bus  |
| <span style="text-decoration: overline;"> OE_SP_H </span> | Output Enable Stack Pointer High | a   | Enables outputting data from the high byte of the Stack Pointer to the bus |

## LCD

| Abbreviation | Name                | s/a | Description                                                                               |
| :----------- | :------------------ | :-- | :---------------------------------------------------------------------------------------- |
| LCD_RS       | LCD Register Select | a   | Chooses between the instruction register (0) and the data register (1) of the LCD-display |
| LCD_E        | LCD Enable          | a   | Writes the data that is currently present at the data pins                                |
