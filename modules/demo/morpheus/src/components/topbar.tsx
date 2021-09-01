import React, { Component, Fragment } from 'react';
import AppBar from '@material-ui/core/AppBar';
import Typography from '@material-ui/core/Typography';
import { CircularProgress, Drawer, Grid, IconButton, List, ListItem, ListItemIcon, ListItemText, Toolbar } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

import InboxIcon from '@material-ui/icons/MoveToInbox';
import MailIcon from '@material-ui/icons/Mail';
import MenuIcon from '@material-ui/icons/Menu';

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
  },
  status: {
    flexGrow: 1,
    paddingRight: 20,
  },
  list: {
    width: 250,
  },
  fullList: {
    width: 'auto',
  },
  drawer: {
    width: '50%',
  },
  progressIcon: {
    align: 'right',
  }
}));

export default function TopBar() {
  const classes = useStyles();
  const [state, setState] = React.useState({
    drawerOpen: false,
  });

  const toggleDrawer = (open: boolean) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }

    setState({ ...state, drawerOpen: open });
  };

  const OptionBarContent = (
    <div
      onClick={toggleDrawer(false)}
      onKeyDown={toggleDrawer(false)}
    >
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <List>
            {['Inbox', 'Starred', 'Send email', 'Drafts'].map((text, index) => (
              <ListItem button key={text}>
                <ListItemIcon>{index % 2 === 0 ? <InboxIcon /> : <MailIcon />}</ListItemIcon>
                <ListItemText primary={text} />
              </ListItem>
            ))}
          </List>
        </Grid>
        <Grid item xs={6}>
          <List>
            {['All mail', 'Trash', 'Spam'].map((text, index) => (
              <ListItem button key={text}>
                <ListItemIcon>{index % 2 === 0 ? <InboxIcon /> : <MailIcon />}</ListItemIcon>
                <ListItemText primary={text} />
              </ListItem>
            ))}
          </List>
        </Grid>
      </Grid>

    </div>
  );

  return (
    <div className={classes.root}>
      <AppBar position="static">
        <Toolbar>
          <IconButton edge="start" className={classes.menuButton} color="inherit" aria-label="menu" onClick={toggleDrawer(true)}>
            <MenuIcon />
          </IconButton>
          <Drawer PaperProps={{ className: classes.drawer }} anchor='left' open={state['drawerOpen']} onClose={toggleDrawer(false)} BackdropProps={{ invisible: true }}>
            {OptionBarContent}
          </Drawer>
          <Typography variant="h6" className={classes.title} align='left'>
            Viz App Title
          </Typography>
          <Typography variant="h6" className={classes.status} align='right'>
            Status
          </Typography>
          <CircularProgress className={classes.progressIcon} color="secondary" />
        </Toolbar>
      </AppBar>
    </div>
  );
}
