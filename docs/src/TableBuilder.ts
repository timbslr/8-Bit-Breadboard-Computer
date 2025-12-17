type Table = {
  headers: string[];
  rows: string[][];
  style: {
    textAlign?: TextAlignment[];
    firstColumnMinWidth?: string;
  };
  id?: string;
  amountOfColumns: number;
};

type TextAlignment = "left" | "center" | "right";

export default class TableBuilder {
  private table: Table = { headers: [], rows: [], style: {}, amountOfColumns: 0 };

  headers(headers: string[]): TableBuilder {
    this.table.headers = headers;
    this.table.amountOfColumns = headers.length;
    return this;
  }

  addRow(row: string[]): TableBuilder {
    if (row.length != this.table.headers.length) {
      throw new Error("Row length must match the length of the headers!");
    }

    this.table.rows.push(row);
    return this;
  }

  addRows(rows: string[][]): TableBuilder {
    rows.forEach((row: string[]) => {
      this.addRow(row);
    });

    return this;
  }

  textAlign(alignments: TextAlignment[]) {
    if (alignments.length != this.table.headers.length) {
      throw new Error("Alignments length must match the length of the headers!");
    }

    this.table.style.textAlign = alignments;
    return this;
  }

  id(id: string) {
    this.table.id = id;
    return this;
  }

  firstColumnMinWidth(minWidth: string) {
    this.table.style.firstColumnMinWidth = minWidth;
    return this;
  }

  sortByColumn(columnName: string, compareFunction: (a: string, b: string) => number) {
    const columnIndex = this.table.headers.indexOf(columnName);

    if (columnIndex === -1) {
      throw new ReferenceError(`Column ${columnName} does not exist on table with id ${this.table.id}`);
    }

    this.table.rows.sort((rowA, rowB) => compareFunction(rowA[columnIndex], rowB[columnIndex]));
    return this;
  }

  build(): HTMLElement {
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

    if (this.table.id) {
      table.id = this.table.id;
    }

    return this.#surroundWithTableWrapperDiv(table);
  }

  #surroundWithTableWrapperDiv(table: HTMLTableElement): HTMLElement {
    const wrapperDiv = document.createElement("div");
    wrapperDiv.classList.add("table-wrapper");
    wrapperDiv.appendChild(table);
    return wrapperDiv;
  }
}
