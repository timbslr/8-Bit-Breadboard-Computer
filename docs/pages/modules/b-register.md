---
title: B-Register
layout: default
nav_order: 4
permalink: /modules/b-register
parent: Modules
---

<script type="module" src="{{ site.baseurl }}/dist/PartList.js"></script>

## B-Register

The B-Register is a general-purpose 8-bit register and is built the same as the A-Register. <br>
It uses two 4-bit register chips (SN74LS173AN) and a single 8-bit bus transceiver (SN74LS245N), which controls outputting data to the bus. <br>
Technically, the 4-bit register chips even have a three-state output, so an extra 8-bit bus transceiver wouldn't be necessary. But always enabling the output of the registers and controlling the output to the bus with the bus transceiver allows me to hook up LED's to the registers output and thus displaying their contents permanently, not only on outputting to the bus. <br>

An asynchronous input provides the ability to reset the registers to zero, the CLK-input provides a synchronization for loading data from the bus (on the rising CLK edge). On the other hand, outputting data from the register to the bus is asynchronous, as the bus transceiver outputs data immediately after it's Output Enable signal goes low.
<br>
<part-list src="{{ site.baseurl }}/resources/PartLists/B-Register.csv"></part-list>

### Schematic

<br>
<img src="{{ site.baseurl }}/resources/Wiring Diagrams/B-Register.svg" alt="B-Register schematic" style="width:100%; height:auto;">
