---
title: Key Characteristics
layout: default
permalink: /key-characteristics
nav_order: 2
---

<script type="module" src="{{ site.baseurl }}/dist/PageLoader/loadKeyCharacteristics.js"></script>

## Key Characteristics

<div id="outer-container">
  <div id="inner-container">
    <table> 
      <tbody> 
        <tr> <td>CPU type</td> <td>Multi-cycle processor</td> </tr>
        <tr> <td>Architecture</td> <td>Von-Neumann</td> </tr>
        <tr> <td>Opcode size</td> <td>8-bit</td> </tr>
        <tr> <td>Amount of instructions</td> <td id="amount-of-instructions">Loading...</td> </tr>
        <tr> <td>&empty;CPI</td> <td id="average-cpi">Loading...</td> </tr>
        <tr> <td>Data width</td> <td>8 bit</td> </tr>
        <tr> <td>Address width</td> <td>16 bit</td> </tr>
        <tr> <td>Program Counter width</td> <td>16 bit</td> </tr>
        <tr> <td>Stack pointer width</td> <td>15 bit</td> </tr>
        <tr> <td>Bus width</td> <td>8 bit</td> </tr>
        <tr> <td>Endianness</td> <td>Little Endian</td> </tr>
        <tr> <td></td> <td></td> </tr>
        <tr> <td>ALU size</td> <td>8 bit</td> </tr>
        <tr> <td>ALU Status flags</td> <td><ul><li>Zero (Z)</li><li>Negative (N)</li><li>Carry (C)</li><li>Overflow (V)</li></ul></td> </tr>
        <tr> <td></td> <td></td> </tr>
        <tr> <td>ROM size</td> <td>32 KiB</td> </tr>
        <tr> <td>ROM type</td> <td>EEPROM</td> </tr>
        <tr> <td>RAM size</td> <td>32 KiB</td> </tr>
        <tr> <td>RAM type</td> <td>SRAM</td> </tr>
        <tr> <td></td> <td></td> </tr>
        <tr> <td>I/O</td> <td><ul><li>7 Segment Display</li><li>LCD</li><li>Serial Interface</li></ul></td> </tr>
        <tr> <td>Serial Baudrate</td> <td>57600</td> </tr>
        <tr> <td>Memory-mapped I/O?</td> <td>No</td> </tr>
        <tr> <td></td> <td></td> </tr>
        <tr> <td>Frequency</td> <td>1MHz</td> </tr>
        <tr> <td>V<sub>CC</sub></td> <td>5V</td> </tr>
        <tr> <td>Power Consumption</td> <td>~ 800mA</td> </tr>
        <tr> <td></td> <td></td> </tr>
        <tr> <td>Logic Family</td> <td>TTL</td> </tr>
        <tr> <td>Amount of ICs</td> <td id="amount-of-ics">Loading...</td> </tr>
        <tr> <td>Amount of Breadboards</td> <td>18</td> </tr>
      </tbody>
    </table>
  </div>
</div>

<style>
  #outer-container {
    padding: 3%;
    width: 100%;
  }

  #inner-container {
    border: 1px solid black;
    border-radius: 12px;
  }

  .table-wrapper {
    border-radius: 12px;
    margin: 0 !important;
  }

  table {
    position: relative;
    z-index: -1
  }
</style>
