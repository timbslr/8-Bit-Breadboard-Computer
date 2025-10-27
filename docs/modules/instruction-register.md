---
title: IR
layout: default
nav_order: 8
parent: Modules
---

## Instruction-Register (IR)

The Instruction-Register is built the same as the A-Register, but serves a completely different purpose. It's not used as a general-purpose register, instead it stores the opcode of the instruction that is currently executed. <br>
In that way, the controller, which is directly connected to the Instruction-Register, can select the corresponding microinstructions for the current instruction.
