---
title: X-Register
layout: default
nav_order: 15
parent: Modules
---

## X-Register

The X-Register serves as a general-purpose register, but has one additional feature compared to the A-Register: The "inc" and "dec" inputs. <br>
With these inputs, the register's value can be incremented or decremented in a single step, that's why it is used for index variables in loops. <br>
<br>
If "inc" or "dec" is active on the rising edge of the CLK, the register increments or decrements accordingly. If both are active or both are inactive, nothing happens to the register, so it can be used as a normal general-purpose register. <br>
<br>
Internally, the register uses two 4-Bit up/down counters, which increment and decrement inputs are processed by an 8-Input multiplexer which serves as a lookup table when the corresponding inputs of the chips should be active. <br>
One problem with these up/down counters is, that they load data asynchronously when their input is enabled. That's why I introduced a monostable multivibrator, which generates short active signal on the load pin of the counters. This makes them act as a register which only load data on the edge of a CLK/enable signal.
<br>
All other registers load data on the rising edge of the CLK. In contrast, the up/down counters of this register don't have a dedicated CLK signal for loading data from the bus, they only have the load pin which goes active on the falling edge of CLK (because the controller works with an inverted CLK). While the load pin is active, data is latched into the counters. <br>
The reason that this approach works nevertheless is that the output enable signals of all other registers are asynchronous as well. So each register is already outputting its content to the bus on the falling clock edge, and the X-Register can latch it shortly after that.
