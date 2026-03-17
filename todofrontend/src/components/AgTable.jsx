import React, { useMemo, forwardRef, memo, useCallback } from "react";
import { AgGridReact } from "ag-grid-react";
import {
  AllCommunityModule,
  ColDef,
  ModuleRegistry,
  GridReadyEvent,
  GetRowIdParams,
  ColDef as AGColDef,
} from "ag-grid-community";

// Automatically register all AG Grid community modules
ModuleRegistry.registerModules([AllCommunityModule]);

// Helper: Keyboard navigation suppression for cells
const suppressNavigation = (params) => {
  const event = params.event;
  const key = event.key;
  const keysToSuppress = [
    "ArrowUp",
    "ArrowDown",
    "ArrowLeft",
    "ArrowRight",
    "PageUp",
    "PageDown",
    "Tab",
    "F2",
    "Escape",
    "Backspace",
    "Delete",
    "Home",
    "End",
    " ", // Space
  ];
  return keysToSuppress.includes(key);
};

// Helper: Keyboard navigation suppression for headers
const suppressHeaderNavigation = (params) => {
  const key = params.event.key;
  return key === "ArrowUp" || key === "ArrowDown";
};

// Default overlay for no rows
const NoRowsOverlay = () => (
  <div className="no-rows-overlay ag-data-available-text">
    No data available
  </div>
);

// Custom loading overlay
const LoadingOverlay = () => (
  <div className="ag-loading-overlay">Loading...</div>
);

// Reusable AgTable component
const AgTable = memo(
  forwardRef((props, ref) => {
    const {
      data,
      columns,
      gridRef,
      onGridReady,
      getRowId,
      className = "",
      style = {},
      gridOptions = {},
      autoHeight = true,
      getRowClass,
      loading = false,
      handleSelectedCases,
      onFirstDataRendered,
      onColumnMoved,
      onColumnResized,
      ...rest
    } = props;

    const defaultColDef = useMemo(
      () => ({
        editable: false,
        filter: false,
        suppressKeyboardEvent: suppressNavigation,
        suppressHeaderKeyboardEvent: suppressHeaderNavigation,
      }),
      [],
    );

    const mergedGridOptions = useMemo(
      () => ({
        enableCellTextSelection: true,
        suppressClipboardPaste: true,
        ...gridOptions,
      }),
      [gridOptions],
    );

    const onSelectionChanged = useCallback(
      (params) => {
        handleSelectedCases?.(params.api.getSelectedRows() || []);
      },
      [handleSelectedCases],
    );

    return (
      <div
        className={`ag-table-responsive ag-theme-quartz ag-custom w-100 overflow-x-auto ${className ? className : "mt-4"}`}
        style={{ ...style }}
      >
        <AgGridReact
          ref={gridRef || ref}
          rowData={data}
          columnDefs={columns}
          defaultColDef={defaultColDef}
          domLayout={autoHeight ? "autoHeight" : "normal"}
          noRowsOverlayComponent={NoRowsOverlay}
          loadingOverlayComponent={LoadingOverlay}
          loading={loading}
          onFirstDataRendered={onFirstDataRendered}
          getRowId={getRowId}
          onGridReady={onGridReady}
          suppressDragLeaveHidesColumns
          gridOptions={mergedGridOptions}
          pagination={false}
          getRowClass={getRowClass}
          onColumnMoved={onColumnMoved}
          onColumnResized={onColumnResized}
          pinnedBottomRowData={rest.pinnedBottomRowData}
          onSelectionChanged={onSelectionChanged}
          tooltipShowDelay={0}
          {...rest}
        />
      </div>
    );
  }),
);

AgTable.displayName = "AgTable";

export default AgTable;
