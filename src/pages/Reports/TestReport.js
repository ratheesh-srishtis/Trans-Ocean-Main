// ResponsiveDialog.js
import React, { useState, useEffect } from "react";

import * as XLSX from "xlsx";

const TestReport = () => {
  const handleExportExcel = () => {
    // Prepare the data
    const fruits = ["Apple", "Orange", "banana"];
    // Use "\n" for line breaks in Excel, and add a space after the dot for clarity
    const cellValue = fruits
      .map((name, idx) => `${idx + 1}. ${name}`)
      .join("\n");
    const data = [
      {
        Fruits: cellValue,
      },
    ];
    // Create worksheet and workbook
    const worksheet = XLSX.utils.json_to_sheet(data);
    worksheet["!cols"] = [{ wch: 40 }];
    // Create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
    // Export
    XLSX.writeFile(workbook, "FruitsTable.xlsx");
    // NOTE: In Excel, select the cell and click "Wrap Text" to see each fruit on a new line.
  };

  return (
    <>
      <button onClick={handleExportExcel}>Export Excel</button>
    </>
  );
};

export default TestReport;
