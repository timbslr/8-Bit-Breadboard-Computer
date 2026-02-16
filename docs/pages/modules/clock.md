---
title: Clock
layout: default
nav_order: 6
permalink: /modules/clock
parent: Modules
---

<script type="module" src="{{ site.baseurl }}/dist/PartList.js"></script>

## Clock

This module is controlling the speed of the entire computer. It generates a 50% duty-cycle clock signal that is used to synchronize all modules with each other.
<br>
A switch lets you select between the internal 1MHz clock and an external clock, which can be connected to the breadboard using a jumper cable.
There's also an input for a halt signal which, when pulled high, stops the clock until the computer's reset button is pressed.
<br>
<part-list src="{{ site.baseurl }}/resources/PartLists/Clock.csv"></part-list>

### Schematic

<br>
<img src="{{ site.baseurl }}/resources/Wiring Diagrams/Clock.svg" alt="Clock schematic" style="width:100%; height:auto;">
