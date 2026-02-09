---
title: Reset
layout: default
nav_order: 14
permalink: /modules/reset
parent: Modules
---

<script type="module" src="../dist/PartList.js"></script>

## Reset

The reset module basically consists of a single button and a not gate which allows to send an active low or an active high reset signal to all other modules after the button was pressed (which you should do after every power-up, or when you just want to rerun your program).

### Why do we even need a reset signal at all?

The obvious reason is that we may want to run our program multiple times in a row. After the first run of the program was successful, we may want to run it again without disconnecting the power every time.
<br>
The more important reason however is that the reset after each power-up is actually essential for the correct operation of the computer: When it first gets power, all registers contain random values instead of clean zeros. With a reset after power-up, we bring the computer into a known state, so all computations will end in the same result later.

<br>
<part-list src="../resources/PartLists/Reset.csv"></part-list>

### Schematic

<br>
<img src="../resources/Wiring Diagrams/Reset.svg" alt="Reset schematic" style="width:100%; height:auto;">
