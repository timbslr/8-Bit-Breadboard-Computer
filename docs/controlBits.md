---
title: Control Bits
layout: default
nav_order: 3
---

Each module (registers, ALU, memory, ...) has multiple input bits that control the function of the module: Whether it loads data from the bus, outputs data to the bus, resets the module, which operation it should compute, etc. The name, abbreviation in the schematic and the description of each control bit is listed in the following table:

## Program Counter (PC)

| Abbreviation                                              | Name                  | Sync/Async | Description                                                     |
| :-------------------------------------------------------- | :-------------------- | :--------- | :-------------------------------------------------------------- |
| CE                                                        | Count Enable          | s          | Enables incrementing the PC on the next positive clock edge     |
| <span style="text-decoration: overline;"> IE_PC_L </span> | Input Enable PC Low   | s          | Enables loading data from the bus to the low byte of the PC     |
| <span style="text-decoration: overline;"> IE_PC_H </span> | Input Enable PC High  | s          | Enables loading data from the bus to the high byte of the PC    |
| <span style="text-decoration: overline;"> OE_PC_L </span> | Output Enable PC Low  | a          | Enables outputting data from the low byte of the PC to the bus  |
| <span style="text-decoration: overline;"> OE_PC_H </span> | Output Enable PC High | a          | Enables outputting data from the high byte of the PC to the bus |
| <span style="text-decoration: overline;"> RST_PC </span>  | Reset PC              | a          | Resets the PC to zero                                           |

## A-Register

| Abbreviation                                           | Name            | Sync/Async | Description                                            |
| :----------------------------------------------------- | :-------------- | :--------- | :----------------------------------------------------- |
| <span style="text-decoration: overline;"> IE_A </span> | Input Enable A  | s          | Enables loading data from the bus to the A-register    |
| <span style="text-decoration: overline;"> OE_A </span> | Output Enable A | a          | Enables outputting data from the A-register to the bus |
| RST_A                                                  | Reset A         | a          | Resets the A-register to zero                          |

## B-Register

| Abbreviation                                           | Name            | Sync/Async | Description                                            |
| :----------------------------------------------------- | :-------------- | :--------- | :----------------------------------------------------- |
| <span style="text-decoration: overline;"> IE_B </span> | Input Enable B  | s          | Enables loading data from the bus to the B-register    |
| <span style="text-decoration: overline;"> OE_B </span> | Output Enable B | a          | Enables outputting data from the B-register to the bus |
| RST_B                                                  | Reset B         | a          | Resets the B-register to zero                          |

## C-Register

| Abbreviation                                           | Name            | Sync/Async | Description                                            |
| :----------------------------------------------------- | :-------------- | :--------- | :----------------------------------------------------- |
| <span style="text-decoration: overline;"> IE_C </span> | Input Enable C  | s          | Enables loading data from the bus to the C-register    |
| <span style="text-decoration: overline;"> OE_C </span> | Output Enable C | a          | Enables outputting data from the C-register to the bus |
| RST_C                                                  | Reset C         | a          | Resets the C-register to zero                          |

## TMP-Register

| Abbreviation                                           | Name              | Sync/Async | Description                                              |
| :----------------------------------------------------- | :---------------- | :--------- | :------------------------------------------------------- |
| <span style="text-decoration: overline;"> IE_T </span> | Input Enable TMP  | s          | Enables loading data from the bus to the TMP-register    |
| <span style="text-decoration: overline;"> OE_T </span> | Output Enable TMP | a          | Enables outputting data from the TMP-register to the bus |
| RST_T                                                  | Reset TMP         | a          | Resets the TMP-register to zero                          |
