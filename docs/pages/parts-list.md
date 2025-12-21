---
title: Part List
layout: default
permalink: /part-list
nav_order: 6
---

<link rel="stylesheet" href="./styles/switch.css">
<script type="module" src="./dist/PartList.js"></script>

---

<div class="toggle-switch-container">
  <label>Show the origins of the parts</label>
  <label class="switch small">
    <input type="checkbox" id="toggle-switch" checked>
    <span class="slider round"></span>
  </label>
</div>

---

<part-list src="ALL"></part-list>

<script>
  const checkbox = document.getElementById("toggle-switch");

  checkbox.addEventListener("change", () => {
    const cells = document.querySelectorAll(".part-list-table-col2");
    cells.forEach(cell => {
      cell.classList.toggle("hidden", !checkbox.checked);
    });
  });
</script>

<style>
  .hidden {
    display: none;
  }

  .toggle-switch-container {
    display: flex;
    justify-content: space-between;
  }

  .main-content ul > li::before {
    content: "▹";
  }
</style>
