---
title: Stack Pointer (SP)
layout: default
nav_order: 16
permalink: /modules/stack-pointer
parent: Modules
---

<script type="module" src="../dist/PartList.js"></script>

## Stack Pointer (SP)

The Stack Pointer stores a 16 bit value which represents the address of the next free position on the stack. Because it is a 16-Bit value, the stack can theoretically take up the whole RAM, which makes a maximum stack size of 32KiB. But in reality, it is much smaller.<br>
For simplicity, I chose the stack to grow up instead of down, which means that the Stack Pointer is incremented whenever a value is pushed to the stack and decremented when something is popped off the stack.

The stack is only active in RAM, that's why the most significant bit is manually tied to HIGH (which means that the Stack Pointer always refers to an address in RAM). The msb cannot be overwritten by a value loaded from the bus.
<br>
<part-list src="../resources/PartLists/SP.csv"></part-list>
<br>

### Schematic

<img src="../resources/Wiring Diagrams/SP.svg" alt="Stack Pointer schematic" style="width:100%; height:auto;">
