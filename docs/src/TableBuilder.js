export default class TableBuilder {
  constructor() {
    this.table = {
      headers: [],
      rows: [],
      style: {
        textAlign: null,
        firstColumnMinWidth: null,
      },
      id: "",
    };
  }

  /**
   * @param {string[]} headers
   * @returns {TableBuilder}
   */
  headers(headers) {
    this.table.headers = headers;
    this.table.amountOfColumns = headers.length;
    return this;
  }

  /**
   * @param {string[]} row
   * @returns {TableBuilder}
   */
  addRow(row) {
    if (row.length != this.table.headers.length) {
      throw new Error("Row length must match the length of the headers!");
    }

    this.table.rows.push(row);
    return this;
  }

  /**
   * @param {string[][]} rows[]
   * @returns {TableBuilder}
   */
  addRows(rows) {
    rows.forEach((row) => {
      this.addRow(row);
    });

    return this;
  }

  textAlign(alignments) {
    if (alignments.length != this.table.headers.length) {
      throw new Error("Alignments length must match the length of the headers!");
    }

    this.table.style.textAlign = alignments;
    return this;
  }

  id(idString) {
    this.table.id = idString;
    return this;
  }

  firstColumnMinWidth(minWidth) {
    this.table.style.firstColumnMinWidth = minWidth;
    return this;
  }

  build() {
    const table = document.createElement("table");
    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");

    this.table.headers.forEach((headerContent) => {
      const header = document.createElement("th");
      header.innerHTML = headerContent;
      headerRow.appendChild(header);
    });

    thead.append(headerRow);
    table.appendChild(thead);

    const tbody = document.createElement("tbody");

    this.table.rows.forEach((rowContents) => {
      const row = document.createElement("tr");
      rowContents.forEach((cellContent, columnIndex) => {
        const cell = document.createElement("td");
        cell.innerHTML = cellContent;

        if (this.table.style.textAlign) {
          cell.style.textAlign = this.table.style.textAlign[columnIndex];
        }

        if (this.table.style.firstColumnMinWidth) {
          cell.style.minWidth = this.table.style.firstColumnMinWidth;
        }

        row.appendChild(cell);
      });

      tbody.appendChild(row);
    });

    table.appendChild(tbody);

    table.id = this.table.id;

    return this.#surroundWithTableWrapperDiv(table);
  }

  #surroundWithTableWrapperDiv(table) {
    const wrapperDiv = document.createElement("div");
    wrapperDiv.classList.add("table-wrapper");
    wrapperDiv.appendChild(table);
    return wrapperDiv;
  }
}
