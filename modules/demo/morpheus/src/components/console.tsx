import React from 'react';
import { Button, Paper } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { Typography } from '@material-ui/core';


const useStyles = makeStyles((theme) => ({
  paper: {
    padding: theme.spacing(2),
    textAlign: 'center',
    color: theme.palette.text.secondary,
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
}));

export default function ConsoleView() {
  const classes = useStyles();

  return (
    <Paper className={classes.paper}>

      <Typography variant="h5">
        Console
      </Typography>
    </Paper>
  );
}
