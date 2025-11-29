---
title: Home
layout: home
nav_order: 0
---

## 8-Bit Breadboard Computer Documentation

Welcome to the documentation of my 8-Bit breadboard computer! Here you will find everything from the overall structure of the build, schematics, explanation of the modules, the instruction set and so much more. Have fun digging into the technical specifications of this project!
<br>
<br>
![Image of the 8-Bit Breadboard Computer](resources/images/Breadboard Computer Top Down.jpg)
<br>
<br>

As the name already tells, this computer is based on an 8-Bit approach, which means that every number that this computer can store or compute arithmetic or logic with is in the range of -128 to 127 or 0 to 255, depending on the interpretation of the number (signed or unsigned). This means that all the registers, the bus, the memory and the ALU are 8-Bit long. <br>
There is one exception: With 8 bits, you wouldn't be able to write bigger programs, as each program could only use a maximum of 256 bytes. But some instructions are up to three bytes long, and I wanted to have a RAM besides ROM. So I decided to double the addresses bits, resulting in a 16-Bit address, which is stored in little-endian format in memory. This means that the [Program Counter](modules/program-counter.html), the [Memory Address Register](modules/memory-address-register.html) and the [Stack Pointer](modules/stack-pointer.html) are 16-Bit long. Each of them is split up into a high and a low byte, so addresses can be transferred over the bus in two steps.

## Color Coding

The project uses different colors for wires and LEDs. This makes determining the functionality of a cable or the affiliation of an LED to a module much easier, especially during debugging the circuits.

|                             LED/Wire Color                              | Functionality                                             |
| :---------------------------------------------------------------------: | :-------------------------------------------------------- |
| ![Yellow LED Icon](resources/Icons/LEDs/yellowLED.svg) <br> 220 &Omega; | 4-Bit value                                               |
|   ![Blue LED Icon](resources/Icons/LEDs/blueLED.svg) <br> 680 &Omega;   | 8-Bit value, only for the bus                             |
|    ![Red LED Icon](resources/Icons/LEDs/redLED.svg) <br> 470 &Omega;    | 8-Bit value, everything except the bus                    |
| ![Green LED Icon](resources/Icons/LEDs/greenLED.svg) <br> 2200 &Omega;  | 16-Bit value                                              |
|          ![Red Wire Icon](resources/Icons/Wires//redWire.svg)           | +5V                                                       |
|         ![Black Wire Icon](resources/Icons/Wires/blackWire.svg)         | GND                                                       |
|         ![Green Wire Icon](resources/Icons/Wires/greenWire.svg)         | Internal module connections                               |
|        ![Yellow Wire Icon](resources/Icons/Wires/yellowWire.svg)        | CLK + Internal module connections\*                       |
|          ![Blue Wire Icon](resources/Icons/Wires/blueWire.svg)          | Direct connection to the bus                              |
|         ![White Wire Icon](resources/Icons/Wires/whiteWire.svg)         | Control line, connected directly to the controller        |
|         ![Brown Wire Icon](resources/Icons/Wires/brownWire.svg)         | Reset line + Control line + Internal module connections\* |

\*At some point, I ran out of correct colored wires, that's why some wire colors are occupied more than once.
