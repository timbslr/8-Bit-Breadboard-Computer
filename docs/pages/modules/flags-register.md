---
title: Flags-Register
layout: default
nav_order: 8
permalink: /modules/flags-register
parent: Modules
---

<script type="module" src="{{ site.baseurl }}/dist/PartList.js"></script>

## Flags-Register

The flags register stores the four ALU flags (Overflow, Negative, Carry and Zero) in a single 4-bit register (74LS173).
It behaves exactly like one of the other 8-bit registers (except from its size being twice as small).
<br>

When outputting its values to the bus, the contents of the bus will be the following:

{: #bit-table}

|       | msb |     |     |     |     |     |     | lsb |
| :---: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: |
|  Bit  |  7  |  6  |  5  |  4  |  3  |  2  |  1  |  0  |
| Value |  0  |  0  |  0  |  0  |  V  |  N  |  C  |  Z  |

<table>
  <thead>
  </thead>
  <tbody>
  </tbody>
</table>

<br>
<part-list src="{{ site.baseurl }}/resources/PartLists/Flags-Register.csv"></part-list>

### Schematic

<br>
<img src="{{ site.baseurl }}/resources/Wiring Diagrams/Flags-Register.svg" alt="Flags-Register schematic" style="width:100%; height:auto;">

<style>
  #bit-table td,
  #bit-table th {
    min-width: 0;
  }

  #bit-table {
    table-layout: fixed;
    width: 100%;
  }
</style>
