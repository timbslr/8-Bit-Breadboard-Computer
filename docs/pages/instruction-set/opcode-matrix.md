---
title: OpCode Matrix
layout: default
permalink: /instruction-set/opcode-matrix
nav_exclude: true
---

:point_right: Click to switch representation:

[Instruction Set Overview](./overview){: .btn .btn-outline}
[OpCode Matrix](./opcode-matrix){: .btn .btn-green}
[Instruction Details](./details){: .btn .btn-outline}

---

<div id="placeholder-opcode-table"></div>

Each opcode has an associated color which represents the flag (combination) that is available to that opcode.
Because of this, I only need to connect a single flag-bit to the controller, which saves address/input bits in order to be able to have a full 8-bit opcode input.
The single flag-input-bit is selected with a 3-to-8 multiplexer from all the available flags. The control bits for the multiplexer are the three most significant bits of the opcode.

{: #table2}

| Color/Opcode range |                Available flag (combination)                |
| :----------------: | :--------------------------------------------------------: |
|      000xxxxx      |                    ZF (= ALU Zero-Flag)                    |
|      001xxxxx      |                   CF (= ALU Carry-Flag)                    |
|      010xxxxx      |                  NF (= ALU Negative-Flag)                  |
|      011xxxxx      |                  VF (= ALU Overflow-Flag)                  |
|      100xxxxx      |                       NF &oplus; VF                        |
|      101xxxxx      |                  (NF &oplus; VF) &or; ZF                   |
|      110xxxxx      | <span style="text-decoration: overline;">CF</span> &or; ZF |
|      111xxxxx      |                         SER_RX_RDY                         |

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
    background: #D6D6FFFF;
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

 #opcode-table tr:nth-child(1) td,
 #opcode-table tr:nth-child(2) td,
 #table2 tr:nth-child(1) td:first-child {
  background-color: var(--color1);
 }

 #opcode-table tr:nth-child(3) td,
 #opcode-table tr:nth-child(4) td,
 #table2 tr:nth-child(2) td:first-child {
  background-color: var(--color2);
 }

 #opcode-table tr:nth-child(5) td,
 #opcode-table tr:nth-child(6) td,
 #table2 tr:nth-child(3) td:first-child {
  background-color: var(--color3);
 }

 #opcode-table tr:nth-child(7) td,
 #opcode-table tr:nth-child(8) td,
 #table2 tr:nth-child(4) td:first-child {
  background-color: var(--color4);
 }

 #opcode-table tr:nth-child(9) td,
 #opcode-table tr:nth-child(10) td,
 #table2 tr:nth-child(5) td:first-child {
  background-color: var(--color5);
 }

 #opcode-table tr:nth-child(11) td,
 #opcode-table tr:nth-child(12) td,
 #table2 tr:nth-child(6) td:first-child {
  background-color: var(--color6);
 }

 #opcode-table tr:nth-child(13) td,
 #opcode-table tr:nth-child(14) td,
 #table2 tr:nth-child(7) td:first-child {
  background-color: var(--color7);
 }

 #opcode-table tr:nth-child(15) td,
 #opcode-table tr:nth-child(16) td,
 #table2 tr:nth-child(8) td:first-child {
  background-color: var(--color8);
 }

 #opcode-table td:not(:first-child):hover {
  background-color: var(--matrix-hover-color);
 }

 #opcode-table th:first-child,
 #opcode-table tr td:first-child {
  position: sticky;
  left: 0;
  z-index: 2;
  background: #D6D6FFFF;
  font-weight: bold;
 }
</style>

<script type="module" src="../dist/PageLoader/loadOpcodeMatrix.js">
