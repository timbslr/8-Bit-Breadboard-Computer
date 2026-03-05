---
title: B-/C-Registers
layout: default
nav_order: 4
permalink: /modules/b-c-registers
parent: Modules
---

<script type="module" src="{{ site.baseurl }}/dist/PartList.js"></script>

## B- and C-Register

The B- and the C-Register are two general-purpose 8-bit registers and are built the same as the A-Register. <br>
They use two 4-bit register chips (SN74LS173AN) and a single 8-bit bus transceiver (SN74LS245N) each, which controls outputting data to the bus. <br>
Technically, the 4-bit register chips even have a three-state output, so an extra 8-bit bus transceiver wouldn't be necessary. But always enabling the output of the registers and controlling the output to the bus with the bus transceiver allows me to hook up LED's to the registers outputs and thus displaying their contents permanently, not only when outputting to the bus. <br>

Asynchronous resets provides the ability to reset the registers to zero, the CLK-input provides a synchronization for loading data from the bus (on the rising CLK edge). On the other hand, outputting data from the register to the bus is asynchronous, as the bus transceiver outputs data immediately after it's Output Enable signal goes low.
<br>

### B-Register

<part-list src="{{ site.baseurl }}/resources/PartLists/B-Register.csv"></part-list>

### Schematic

<img src="{{ site.baseurl }}/resources/Wiring Diagrams/B-Register.svg" alt="B-Register schematic" style="width:100%; height:auto;">

### C-Register

<part-list src="{{ site.baseurl }}/resources/PartLists/C-Register.csv"></part-list>

### Schematic

<img src="{{ site.baseurl }}/resources/Wiring Diagrams/C-Register.svg" alt="C-Register schematic" style="width:100%; height:auto;">
