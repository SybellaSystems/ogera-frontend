import React, { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  Checkbox,
  IconButton,
  TextField,
  InputAdornment,
  Paper,
  Typography,
  Box,
  CircularProgress,
} from "@mui/material";
import {
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
} from "@mui/icons-material";

export interface Column<T> {
  id: keyof T | string;
  label: string;
  minWidth?: number;
  align?: "left" | "right" | "center";
  format?: (value: any, row: T) => React.ReactNode;
  sortable?: boolean;
  searchable?: boolean;
}

export interface TableAction<T> {
  label: string;
  onClick: (row: T) => void;
  icon?: React.ReactNode;
  color?: "primary" | "secondary" | "error" | "warning" | "success";
  show?: (row: T) => boolean;
}

export interface CustomTableProps<T> {
  columns: Column<T>[];
  data: T[];
  actions?: TableAction<T>[];
  onRowClick?: (row: T) => void;
  selectable?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
  onSelectionChange?: (selected: T[]) => void;
  loading?: boolean;
  emptyMessage?: string;
  rowsPerPageOptions?: number[];
  defaultRowsPerPage?: number;
  stickyHeader?: boolean;
  maxHeight?: number | string;
  getRowId?: (row: T, index: number) => string | number;
  dense?: boolean;
  hover?: boolean;
  // Server-side pagination props
  serverSidePagination?: boolean;
  totalCount?: number;
  page?: number;
  onPageChange?: (page: number) => void;
  onRowsPerPageChange?: (rowsPerPage: number) => void;
}

function CustomTable<T extends Record<string, any>>({
  columns,
  data,
  actions,
  onRowClick,
  selectable = false,
  searchable = true,
  searchPlaceholder = "Search...",
  onSelectionChange,
  loading = false,
  emptyMessage = "No data available",
  rowsPerPageOptions = [5, 10, 25, 50],
  defaultRowsPerPage = 10,
  stickyHeader = true,
  maxHeight = 600,
  getRowId = (row, index) => row.id || index,
  dense = false,
  hover = true,
  serverSidePagination = false,
  totalCount,
  page: externalPage,
  onPageChange: externalOnPageChange,
  onRowsPerPageChange: externalOnRowsPerPageChange,
}: CustomTableProps<T>) {
  const [internalPage, setInternalPage] = useState(0);
  const [internalRowsPerPage, setInternalRowsPerPage] =
    useState(defaultRowsPerPage);

  // Use external pagination if server-side, otherwise use internal
  const page = serverSidePagination ? externalPage ?? 0 : internalPage;
  const rowsPerPage = serverSidePagination
    ? defaultRowsPerPage
    : internalRowsPerPage;
  const [orderBy, setOrderBy] = useState<keyof T | string | null>(null);
  const [order, setOrder] = useState<"asc" | "desc">("asc");
  const [searchQuery, setSearchQuery] = useState("");
  const [selected, setSelected] = useState<Set<string | number>>(new Set());

  // Handle sorting
  const handleSort = (columnId: keyof T | string) => {
    const isAsc = orderBy === columnId && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(columnId);
  };

  // Filter data based on search
  const filteredData = useMemo(() => {
    if (!searchQuery) return data;

    return data.filter((row) => {
      return columns.some((column) => {
        if (column.searchable === false) return false;
        const value = row[column.id as keyof T];
        if (value == null) return false;
        return String(value).toLowerCase().includes(searchQuery.toLowerCase());
      });
    });
  }, [data, searchQuery, columns]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!orderBy) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = a[orderBy as keyof T];
      const bValue = b[orderBy as keyof T];

      if (aValue == null) return 1;
      if (bValue == null) return -1;

      if (typeof aValue === "string" && typeof bValue === "string") {
        return order === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      if (aValue < bValue) return order === "asc" ? -1 : 1;
      if (aValue > bValue) return order === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredData, orderBy, order]);

  // Paginate data (only for client-side pagination)
  const paginatedData = useMemo(() => {
    if (serverSidePagination) {
      // For server-side, use data as-is (already paginated by server)
      return sortedData;
    }
    // For client-side, paginate locally
    return sortedData.slice(
      page * rowsPerPage,
      page * rowsPerPage + rowsPerPage
    );
  }, [sortedData, page, rowsPerPage, serverSidePagination]);

  // Handle page change
  const handleChangePage = (_event: unknown, newPage: number) => {
    if (serverSidePagination && externalOnPageChange) {
      externalOnPageChange(newPage);
    } else {
      setInternalPage(newPage);
    }
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    if (serverSidePagination && externalOnRowsPerPageChange) {
      externalOnRowsPerPageChange(newRowsPerPage);
    } else {
      setInternalRowsPerPage(newRowsPerPage);
      setInternalPage(0);
    }
  };

  // Handle select all
  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelected = new Set(
        paginatedData.map((row, i) => getRowId(row, i))
      );
      setSelected(newSelected);
      if (onSelectionChange) {
        onSelectionChange(paginatedData);
      }
    } else {
      setSelected(new Set());
      if (onSelectionChange) {
        onSelectionChange([]);
      }
    }
  };

  // Handle select single row
  const handleSelectRow = (row: T, index: number) => {
    const id = getRowId(row, index);
    const newSelected = new Set(selected);

    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }

    setSelected(newSelected);

    if (onSelectionChange) {
      const selectedRows = paginatedData.filter((r, i) =>
        newSelected.has(getRowId(r, i))
      );
      onSelectionChange(selectedRows);
    }
  };

  // Check if all rows are selected
  const isAllSelected =
    paginatedData.length > 0 &&
    paginatedData.every((row, i) => selected.has(getRowId(row, i)));

  const isIndeterminate =
    paginatedData.some((row, i) => selected.has(getRowId(row, i))) &&
    !isAllSelected;

  return (
    <Paper
      elevation={0}
      sx={{
        width: "100%",
        maxWidth: "100%",
        border: "1px solid #e5e7eb",
        borderRadius: "12px",
        overflow: "hidden",
        boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
      }}
      className="table-responsive"
    >
      {/* Search Bar */}
      {searchable && (
        <Box
          sx={{ p: { xs: 1.5, sm: 2 }, borderBottom: "1px solid #e5e7eb", bgcolor: "#fafafa" }}
        >
          <TextField
            fullWidth
            size="small"
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (serverSidePagination && externalOnPageChange) {
                externalOnPageChange(0);
              } else {
                setInternalPage(0);
              }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: "#9ca3af" }} />
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "8px",
                bgcolor: "white",
                "&:hover fieldset": {
                  borderColor: "#9333ea",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#9333ea",
                },
              },
            }}
          />
        </Box>
      )}

      {/* Table Container */}
      <TableContainer sx={{ maxHeight, overflowX: "auto", width: "100%" }}>
        <Table stickyHeader={stickyHeader} size={dense ? "small" : "medium"}>
          {/* Table Header */}
          <TableHead>
            <TableRow>
              {selectable && (
                <TableCell padding="checkbox" sx={{ bgcolor: "#f9fafb" }}>
                  <Checkbox
                    indeterminate={isIndeterminate}
                    checked={isAllSelected}
                    onChange={handleSelectAll}
                    sx={{
                      color: "#9333ea",
                      "&.Mui-checked": {
                        color: "#9333ea",
                      },
                      "&.MuiCheckbox-indeterminate": {
                        color: "#9333ea",
                      },
                    }}
                  />
                </TableCell>
              )}

              {columns.map((column) => (
                <TableCell
                  key={String(column.id)}
                  align={column.align || "left"}
                  style={{ minWidth: column.minWidth }}
                  sx={{
                    bgcolor: "#f9fafb",
                    fontWeight: 600,
                    fontSize: "0.75rem",
                    textTransform: "uppercase",
                    color: "#6b7280",
                    letterSpacing: "0.05em",
                  }}
                >
                  {column.sortable !== false ? (
                    <TableSortLabel
                      active={orderBy === column.id}
                      direction={orderBy === column.id ? order : "asc"}
                      onClick={() => handleSort(column.id)}
                      sx={{
                        "&.MuiTableSortLabel-root": {
                          color: "#6b7280",
                        },
                        "&.MuiTableSortLabel-root:hover": {
                          color: "#9333ea",
                        },
                        "&.Mui-active": {
                          color: "#9333ea",
                        },
                        "& .MuiTableSortLabel-icon": {
                          color: "#9333ea !important",
                        },
                      }}
                    >
                      {column.label}
                    </TableSortLabel>
                  ) : (
                    column.label
                  )}
                </TableCell>
              ))}

              {actions && actions.length > 0 && (
                <TableCell
                  align="center"
                  sx={{
                    bgcolor: "#f9fafb",
                    fontWeight: 600,
                    fontSize: "0.75rem",
                    textTransform: "uppercase",
                    color: "#6b7280",
                  }}
                >
                  Actions
                </TableCell>
              )}
            </TableRow>
          </TableHead>

          {/* Table Body */}
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={
                    columns.length + (selectable ? 1 : 0) + (actions ? 1 : 0)
                  }
                  align="center"
                  sx={{ py: 8 }}
                >
                  <CircularProgress sx={{ color: "#9333ea" }} />
                </TableCell>
              </TableRow>
            ) : paginatedData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={
                    columns.length + (selectable ? 1 : 0) + (actions ? 1 : 0)
                  }
                  align="center"
                  sx={{ py: 8 }}
                >
                  <Typography color="textSecondary">{emptyMessage}</Typography>
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((row, index) => {
                const rowId = getRowId(row, index);
                const isSelected = selected.has(rowId);

                return (
                  <TableRow
                    key={rowId}
                    hover={hover}
                    selected={isSelected}
                    onClick={() => onRowClick && onRowClick(row)}
                    sx={{
                      cursor: onRowClick ? "pointer" : "default",
                      "&.Mui-selected": {
                        bgcolor: "#faf5ff",
                      },
                      "&.Mui-selected:hover": {
                        bgcolor: "#f3e8ff",
                      },
                    }}
                  >
                    {selectable && (
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={isSelected}
                          onChange={() => handleSelectRow(row, index)}
                          onClick={(e) => e.stopPropagation()}
                          sx={{
                            color: "#9333ea",
                            "&.Mui-checked": {
                              color: "#9333ea",
                            },
                          }}
                        />
                      </TableCell>
                    )}

                    {columns.map((column) => {
                      const value = row[column.id as keyof T];
                      return (
                        <TableCell
                          key={String(column.id)}
                          align={column.align || "left"}
                          sx={{ color: "#374151" }}
                        >
                          {column.format ? column.format(value, row) : value}
                        </TableCell>
                      );
                    })}

                    {actions && actions.length > 0 && (
                      <TableCell align="center">
                        <Box
                          sx={{
                            display: "flex",
                            gap: 1,
                            justifyContent: "center",
                          }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {actions.map((action, actionIndex) => {
                            if (action.show && !action.show(row)) return null;

                            return (
                              <IconButton
                                key={actionIndex}
                                size="small"
                                onClick={() => action.onClick(row)}
                                sx={{
                                  color:
                                    action.color === "error"
                                      ? "#ef4444"
                                      : action.color === "success"
                                      ? "#10b981"
                                      : action.color === "warning"
                                      ? "#f59e0b"
                                      : "#9333ea",
                                  "&:hover": {
                                    bgcolor:
                                      action.color === "error"
                                        ? "#fee2e2"
                                        : action.color === "success"
                                        ? "#d1fae5"
                                        : action.color === "warning"
                                        ? "#fef3c7"
                                        : "#faf5ff",
                                  },
                                }}
                                title={action.label}
                              >
                                {action.icon || <MoreVertIcon />}
                              </IconButton>
                            );
                          })}
                        </Box>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <TablePagination
        rowsPerPageOptions={rowsPerPageOptions}
        component="div"
        count={serverSidePagination ? totalCount ?? 0 : sortedData.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        sx={{
          borderTop: "1px solid #e5e7eb",
          "& .MuiTablePagination-select": {
            borderRadius: "6px",
          },
          "& .MuiTablePagination-selectIcon": {
            color: "#9333ea",
          },
          "& .MuiTablePagination-actions button": {
            color: "#9333ea",
          },
          // Mobile-friendly pagination layout
          "& .MuiTablePagination-toolbar": {
            flexWrap: "wrap",
            justifyContent: "center",
            minHeight: { xs: "auto", sm: 52 },
            px: { xs: 1, sm: 2 },
            py: { xs: 0.5, sm: 0 },
            gap: { xs: 0.5, sm: 0 },
          },
          "& .MuiTablePagination-spacer": {
            display: { xs: "none", sm: "block" },
          },
          "& .MuiTablePagination-selectLabel": {
            fontSize: { xs: "0.75rem", sm: "0.875rem" },
            m: { xs: 0, sm: undefined },
          },
          "& .MuiTablePagination-displayedRows": {
            fontSize: { xs: "0.75rem", sm: "0.875rem" },
            m: { xs: 0, sm: undefined },
          },
        }}
      />
    </Paper>
  );
}

export default CustomTable;
