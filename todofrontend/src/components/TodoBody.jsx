import React, { useEffect, useMemo, useState } from "react";
import Navbar from "./Navbar";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import AddIcon from "@mui/icons-material/Add";
import AgTable from "./AgTable";
import Chip from "@mui/material/Chip";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import ToastMessage from "./ToastMessage";
import CircularProgress from "@mui/material/CircularProgress";
import { BASE_URL } from "../App";

const TodoBody = () => {
  const [todoList, setTodoList] = React.useState([]);
  const [body, setBody] = React.useState("");
  const [mode, setMode] = useState("ADD");
  const [todoID, setTodoID] = useState("");
  const [toast, setToast] = useState({
    open: false,
    message: "",
  });
  const [loading, setLoading] = useState(false);

  const QuickActionsRenderer = (params) => {
    return (
      <div className="action-cell-container">
        <IconButton
          disabled={params.data.completed || mode === "EDIT"}
          onClick={() => completeTodo(params.data.id)}
        >
          <CheckCircleOutlineOutlinedIcon />
        </IconButton>
        <Tooltip title="Edit">
          <IconButton
            disabled={params.data.completed || mode === "EDIT"}
            onClick={() => handleUpdate(params?.data)}
          >
            <EditIcon />
          </IconButton>
        </Tooltip>

        <Tooltip title="Delete">
          <IconButton
            onClick={() => deleteTodo(params.data.id)}
            disabled={mode === "EDIT"}
          >
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      </div>
    );
    //
  };

  const StatusCellRender = (params) => {
    return (
      <div>
        <Chip
          label={params?.data?.completed ? "Completed" : "Pending"}
          color={params?.data?.completed ? "success" : "warning"}
        />
      </div>
    );

    //
  };
  const ColDef = useMemo(() => {
    return [
      { field: "sNo", headerName: "S.No", width: 300 },
      { field: "body", headerName: "Task", width: 1000 },
      {
        field: "status",
        headerName: "Status",
        width: 410,
        cellRendererSelector: (params) => {
          return params.node.group
            ? undefined
            : { component: StatusCellRender };
        },
      },
      {
        headerName: "Actions",
        field: "status",
        cellRendererSelector: (params) => {
          return params.node.group
            ? undefined
            : { component: QuickActionsRenderer };
        },
        cellClass: "actions-cell",
        minWidth: 166,
        sortable: false,
        suppressMenu: true,
        suppressMovable: true,
        pinned: "right",
      },
    ];
  }, [todoList]);

  const handleUpdate = (data) => {
    setMode("EDIT");
    setTodoID(data?.id);
    setBody(data?.body);
  };

  const handleClose = () => {
    setToast({ ...toast, open: false });
  };

  async function addTodo() {
    const payload = {
      body: body,
      completed: false,
    };
    console.log(payload, "-------------aaa");

    try {
      await fetch("http://localhost:5000/api/createTodos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      setBody("");
      setToast({
        open: true,
        message: "Task added successfully",
      });
      getTodoList();
    } catch (error) {
      console.error(error);
    }
  }

  async function getTodoList() {
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/getTodos`);
      if (response.status === 200) {
        const data = await response.json();
        const updatedData = data.map((item, index) => {
          return {
            ...item,
            sNo: index + 1,
          };
        });
        setTodoList(updatedData);
        setLoading(false);
      } else {
        setToast({
          open: true,
          error: true,
          message: "Failed to fetch todo data",
        });
        setLoading(false);
      }
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  }

  async function updateTodo() {
    setMode("EDIT");
    const payload = {
      body: body,
      completed: false,
    };
    setLoading(true);

    try {
      const response = await fetch(`${BASE_URL}/updateTodos/${todoID}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      if (response.status === 200) {
        setLoading(false);

        setToast({
          open: true,
          message: "Task Updated successfully",
        });
        setBody("");
        setMode("ADD");
        getTodoList();
      } else {
        setLoading(false);
        setBody("");
        setMode("ADD");
        setToast({
          open: true,
          message: "Error updating task",
          error: true,
        });
      }
    } catch (error) {
      setLoading(false);
      console.error(error);
    }
  }

  async function deleteTodo(id) {
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/deleteTodos/${id}`, {
        method: "DELETE",
      });

      if (response.status === 200) {
        setLoading(false);
        setToast({
          open: true,
          message: "Task deleted successfully",
        });
        getTodoList();
      } else {
        setLoading(false);
        setToast({
          open: true,
          message: "Error deleting task",
          error: true,
        });
      }
    } catch (error) {
      setLoading(false);
      console.error(error);
    }
  }

  async function completeTodo(id) {
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/completeTodos/${id}`, {
        method: "PATCH",
      });

      if (response.status === 200) {
        setLoading(false);
        setToast({
          open: true,
          message: "Task completed successfully",
        });
        getTodoList();
      } else {
        setLoading(false);
        setToast({
          open: true,
          message: "Error completing task",
          error: true,
        });
      }
    } catch (error) {
      setLoading(false);
      console.error(error);
    }
  }

  useEffect(() => {
    getTodoList();
  }, []);

  const handleChangeBody = (e) => {
    setBody(e.target.value);
  };
  return (
    <div>
      {loading && (
        <div className="loader">
          <CircularProgress />
        </div>
      )}
      <Navbar />
      <div className="search-container">
        <TextField
          id="standard-basic"
          label="Enter Todo task"
          variant="standard"
          className="text-field"
          value={body}
          onChange={handleChangeBody}
        />
        {mode === "ADD" ? (
          <Button variant="outlined" onClick={() => addTodo()}>
            <AddIcon />
          </Button>
        ) : (
          <Button variant="outlined" onClick={updateTodo}>
            <EditIcon />
          </Button>
        )}
      </div>
      <div className="table-container">
        <AgTable data={todoList} columns={ColDef} />
      </div>
      <ToastMessage
        open={toast.open}
        error={toast.error}
        message={toast.message}
        handleClose={handleClose}
      />
    </div>
  );
};

export default TodoBody;
