---
title: Controller
layout: default
nav_order: 7
permalink: /modules/controller
parent: Modules
---

<script type="module" src="{{ site.baseurl }}/dist/PartList.js"></script>

## Controller

The controller is the brain of the computer. It controls which module is active at the moment, what it should do and when it should read from or write to bus.
Each microinstruction is loaded after a falling edge of the clock signal and executed at its rising edge.
The controller consists of a few submodules:

### Controller EEPROMs

The brain of the controller itself are four 28C64B EEPROMs, each containing 64KiB of data. They store all the instructions defined in the [instructionData.jsonc]({{ site.baseurl }}/resources/data/instructionData.jsonc) file and set their outputs based on 13 input bits in total:

<ul>
  <li> 4 bits for the <a href="#4-bit-step-counter">step counter</a> </li>
  <li> 8 bits for the <a href="#8-bit-opcode">opcode</a> of the instruction that is currently executed </li>
  <li> 1 bit for a <a href="#flag-multiplexer">flag input</a> </li> 
</ul>

### 4-Bit Step Counter

Each instruction consists of multiple steps (also called "microinstructions") that need to be processed in order to execute an instruction.
The controller needs to know the step the currently executed instruction is in to be able to set the control bits accordingly.
That's why we need a step counter: It keeps track of how many microinstructions were already executed and increments (at the falling edge of the clock signal) until it is reset by the end of the current instruction.
<br>
The counter has a total size of four bits, which allow us to represent 16 different states or 16 different microinstructions per instruction, although only 13 of them are actually available for a single instruction.
That's because the first three steps are the same for every instruction: They increment the [program counter](./program-counter) and load the opcode of the next instruction from [memory](./memory) into the [instruction register](./instruction-register).

### 8-Bit Opcode

I really wanted support for a full width 8-bit opcode. With the [optimization on the flag input](#flag-multiplexer) I was able to achieve this as there were eight address lines/inputs left on the controller EEPROMs.
This means my computer supports a total of 256 different instructions (although not all opcodes are occupied at the moment), whose definitions you can look up [here]({{ site.baseurl }}/instruction-set/overview).

### Flag Multiplexer

The computer supports the four most common flags coming from the ALU: Zero, Negative, Carry and Overflow.
So the naive approach is to use four of the controller EEPROMs address pins/inputs in order to input all flag (combination) to the controller.
Unfortunately, there was only one address line left on these EEPROMs (12/13 are already used for the 4-bit step counter and the 8-bit opcode), so i had to came up with a solution to that problem.
<br>
In fact, every instruction uses at most one (combination) of the flags above, so I'm able to introduce a multiplexer and some combinatorial logic to route always only one flag to the controller.
The three upper bits of the opcodes are fed into the control lines of that multiplexer, which means that theres a [range of opcodes]({{ site.baseurl }}/instruction-set/opcode-matrix#table2) where a specific flag (combination) is available.
If you define an instruction, you must ensure that, if the instruction needs a specific flag, its opcode lies within the range where that needed flag is available.

### Control Line Decoders

With only four control EEPROMs, having eight outputs each, there's only a total amount of 32 possible control lines that the controller could have, but that's not enough in order to control all the modules that this computer has.
<br>
One solution to that problem would be to increase the number of control EEPROMs, resulting in more control lines. But these memory chips aren't cheap compared to other chips of this build, and it would mean that more chips need to be reprogrammed when changing or expanding the instruction set (which happened quite a lot during the build and development phase).
That's why I decided against this solution and used a little trick to increase the number of control lines by still having only four control EEPROMs.
<br>
If you think about it, many control lines aren't active at the same time: At most one module outputs its contents to the bus at a time, and in fact, at most one module is reading from the bus too.
That enables me to introduce two 4-to-16 bit decoders to the circuit, one for most of the input enable (IE) control lines and one for the output enable (OE) control lines.
The control bits of the decoders are connected to four outputs of the control EEPROMs each, but in return, I get 16 new control lines per EEPROM, resulting in a total of 3\*8+2\*16 = 56 control lines that I have available to control all of my modules.

### Annoying behaviour of the 28C64B

The 28C64B EEPROMs have an annoying behaviour: When their address/input lines change, their outputs are undefined for a short period of time, until the correct value for the next input is loaded and the outputs stabilize again.
For some control lines, that's not an issue, because they are only read on the rising edge of the clock signal (like most input enable (IE) lines for example).
But for some others, this results in a misbehaviour of the module and thus the entire computer. The issue is that during this undefined time period, there may be a spike on a control line.
On the other hand, some modules are very sensitive to such spikes. As an example, have a look at the INC_X control line: As soon as there is a short spike on that line, the register increments. But if that spike occurs unintentionally, the register may increment without you specifying this in your assembly code.
That's why you must avoid these spikes on some control lines at all cost.
<br>
The solution is a simple circuit called a ["low pass filter"](https://en.wikipedia.org/wiki/Low-pass_filter), consisting of just a single resistor and a capacitor.
When wired up correctly, this circuit dampens all spikes shorter than a given time interval (specified by the values of the two components) to such a level that the modules won't recognize it as a spike anymore.
You can see many of these resistor-capacitor pairs spread across many control lines to prevent those spikes from reaching the modules.

<br>
<part-list src="{{ site.baseurl }}/resources/PartLists/Controller.csv"></part-list>

### Schematic

<br>
<img src="{{ site.baseurl }}/resources/Wiring Diagrams/Controller.svg" alt="Controller schematic" style="width:100%; height:auto;">
