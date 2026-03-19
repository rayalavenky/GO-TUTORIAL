import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import React from "react";

const ToastMessage = (props) => {
  console.log(props, "--------------props");

  return (
    <Snackbar
      open={props?.open}
      autoHideDuration={5000}
      onClose={props?.handleClose}
      anchorOrigin={{ vertical: "top", horizontal: "right" }}
    >
      <Alert
        onClose={props?.handleClose}
        severity={props?.error ? "error" : "success"}
        variant="filled"
      >
        {props?.message}
      </Alert>
    </Snackbar>
  );
};

export default ToastMessage;
