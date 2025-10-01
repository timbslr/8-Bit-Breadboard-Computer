---
title: OpCode Matrix
layout: default
nav_exclude: true
---

:point_right: Click to switch representation:

[Instruction Set Overview](./overview.html){: .btn .btn-outline}
[OpCode Matrix](./opcode-matrix.html){: .btn .btn-green}
[Instruction Details](./details.html){: .btn .btn-outline}

---

{: #opcode-table}

|            |     -0     |     -1     |     -2     |     -3     |     -4     |     -5     |     -6     |     -7     |     -8     |     -9     |     -A     |     -B     |     -C     |     -D     |     -E     |     -F     |
| :--------: | :--------: | :--------: | :--------: | :--------: | :--------: | :--------: | :--------: | :--------: | :--------: | :--------: | :--------: | :--------: | :--------: | :--------: | :--------: | :--------: |
| Loading... | Loading... | Loading... | Loading... | Loading... | Loading... | Loading... | Loading... | Loading... | Loading... | Loading... | Loading... | Loading... | Loading... | Loading... | Loading... | Loading... |

Each opcode has an associated color which represents the flag (combination) that is available to that opcode.
Because of this, I only need to connect a single flag-bit to the controller, which saves address/input bits in order to be able to have a full 8-bit opcode input.
The single flag-input-bit is selected with a 3-to-8 multiplexer from all the available flags. The control bits for the multiplexer are the three most significant bits of the opcode.

{: #table2}

| Color/Opcode range |                Available flag (combination)                |
| :----------------: | :--------------------------------------------------------: |
|      000xxxxx      |                             ZF                             |
|      001xxxxx      |                             CF                             |
|      010xxxxx      |                             NF                             |
|      011xxxxx      |                             VF                             |
|      100xxxxx      |                       NF &oplus; VF                        |
|      101xxxxx      |                  (NF &oplus; VF) &or; ZF                   |
|      110xxxxx      | <span style="text-decoration: overline;">CF</span> &or; ZF |
|      111xxxxx      |                 <i> not assigned yet </i>                  |

<style>
 :root {
   --color1: #ff000060;
   --color2: #ffe60060;
   --color3: #0055ff60;
   --color4: #09ff0060;
   --color5: #7a521b60;
   --color6: #ff00ff60;
   --color7: #00ddff60;
   --color8: #ff910060;
   --matrix-hover-color: #ffffff;
 }

 #opcode-table th,
 #opcode-table td {
  min-width: 0rem;
  padding: 0rem;
  margin: 0rem; 
  border-width: 1px;
  border-color: black;
 }

 #opcode-table th {
    background: #D6D6FF;
    height: 30px;
 }

 a:link {
  color: #5c5962;
  text-decoration: none;
 }

 #opcode-table thead th {
  border-width: 1px;
  border-color: black;
 }

 #opcode-table {
  line-height: 1.5;
  border-spacing: 0px; 
  width: 100%;
 }

 #opcode-table th:not(:first-child),
 #opcode-table td:not(:first-child) {
  min-width: 40px;
  width: 6.25%;
 }

 #opcode-table td:not(:first-child) {
  height: 40px;
 }

 #opcode-table tr:nth-child(1),
 #opcode-table tr:nth-child(2),
 #table2 tr:nth-child(1) td:first-child {
  background-color: var(--color1);
 }

 #opcode-table tr:nth-child(3),
 #opcode-table tr:nth-child(4),
 #table2 tr:nth-child(2) td:first-child {
  background-color: var(--color2);
 }

 #opcode-table tr:nth-child(5),
 #opcode-table tr:nth-child(6),
 #table2 tr:nth-child(3) td:first-child {
  background-color: var(--color3);
 }

 #opcode-table tr:nth-child(7),
 #opcode-table tr:nth-child(8),
 #table2 tr:nth-child(4) td:first-child {
  background-color: var(--color4);
 }

 #opcode-table tr:nth-child(9),
 #opcode-table tr:nth-child(10),
 #table2 tr:nth-child(5) td:first-child {
  background-color: var(--color5);
 }

 #opcode-table tr:nth-child(11),
 #opcode-table tr:nth-child(12),
 #table2 tr:nth-child(6) td:first-child {
  background-color: var(--color6);
 }

 #opcode-table tr:nth-child(13),
 #opcode-table tr:nth-child(14),
 #table2 tr:nth-child(7) td:first-child {
  background-color: var(--color7);
 }

 #opcode-table tr:nth-child(15),
 #opcode-table tr:nth-child(16),
 #table2 tr:nth-child(8) td:first-child {
  background-color: var(--color8);
 }

 #opcode-table td:hover {
  background-color: var(--matrix-hover-color);
 }

 #opcode-table td {
   background-color: inherit;
 }

 #opcode-table th:first-child,
 #opcode-table td:first-child {
  position: sticky;
  left: 0;
  z-index: 2;
  background: #D6D6FF;
  font-weight: bold;
 }
</style>

<script type="module" src="../scripts/loadOpcodeMatrixData.js">
