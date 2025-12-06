export default class TableUtilProvider {
  static getTableBodyById(tableId) {
    const table = document.getElementById(tableId);
    if (!table) {
      console.error(`Table with id ${tableId} not found!`);
      return;
    }

    return table.querySelector("tbody");
  }

  static surroundWithTableWrapper(tableObject) {
    const wrapperDiv = document.createElement("div");
    wrapperDiv.classList.add("table-wrapper");
    wrapperDiv.appendChild(tableObject);
    return wrapperDiv;
  }
}
