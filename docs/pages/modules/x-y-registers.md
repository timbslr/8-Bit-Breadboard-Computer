---
title: X-/Y-Registers
layout: default
nav_order: 18
permalink: /modules/x-y-registers
parent: Modules
---

<script type="module" src="{{ site.baseurl }}/dist/PartList.js"></script>

## X- and Y-Register

The X- and Y-Register both serve as general-purpose registers, but they have one additional feature compared to the A-Register: The "inc" and "dec" inputs. <br>
With these inputs, the register's values can be incremented or decremented in a single step and without ALU-operation, that's why they are e.g. used for index variables in loops. <br>
<br>
If "inc" or "dec" is active on the rising edge of the CLK, the registers increment or decrement accordingly. If none of these two inputs are active, nothing happens to the contents of the register, so it can be used as a normal general-purpose register. <br>
<br>
Internally, the registers use two 4-Bit up/down counters each, which increment and decrement according to the INC- and DEC-inputs. <br>
One problem with these up/down counters is, that they load data asynchronously when their input is enabled. That's why I introduced a monostable multivibrator, which generates short active signals on the input enable pins of the counters. This makes them act as a register which only load data on the rising edge of a CLK/enable signal.

### X-Register

<part-list src="{{ site.baseurl }}/resources/PartLists/X-Register.csv"></part-list>
<br>

### Schematic

<img src="{{ site.baseurl }}/resources/Wiring Diagrams/X-Register.svg" alt="X-Register schematic" style="width:100%; height:auto;">

### Y-Register

<part-list src="{{ site.baseurl }}/resources/PartLists/Y-Register.csv"></part-list>
<br>

### Schematic

<img src="{{ site.baseurl }}/resources/Wiring Diagrams/Y-Register.svg" alt="Y-Register schematic" style="width:100%; height:auto;">
