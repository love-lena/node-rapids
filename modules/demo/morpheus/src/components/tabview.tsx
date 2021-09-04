import React, { Fragment } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import { Box, Tabs, Typography } from '@material-ui/core';
import Tab from '@material-ui/core/Tab';
import DataTable from './table';
import AutoSizer from 'react-virtualized-auto-sizer';


function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`nav-tabpanel-${index}`}
      aria-labelledby={`nav-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box p={3}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

function a11yProps(index) {
  return {
    id: `nav-tab-${index}`,
    'aria-controls': `nav-tabpanel-${index}`,
  };
}

function LinkTab(props) {
  return (
    <Tab
      component="a"
      onClick={(event) => {
        event.preventDefault();
      }}
      {...props}
    />
  );
}

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.background.paper,
  },
}));

export default function NavTabs(props) {
  const classes = useStyles();
  const [value, setValue] = React.useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <>
      <AppBar position="static">
        <Tabs
          variant="fullWidth"
          value={value}
          onChange={handleChange}
        >
          <LinkTab label="Nodes" href="/node-table" {...a11yProps(0)} />
          <LinkTab label="Edges" href="/edge-table" {...a11yProps(1)} />
          <LinkTab label="Page Three" href="/spam" {...a11yProps(2)} />
        </Tabs>
      </AppBar>
      <AutoSizer >
        {({ height, width }) => (
          <div style={{ height: height, width: width }}>
            <TabPanel value={value} index={0}>
              <div style={{ height: height * .85, width: '100%' }}>
                <DataTable rtcId={props.rtcId} />
              </div>
            </TabPanel>

            <TabPanel value={value} index={1}>
              <div style={{ height: height * .85, width: '100%' }}>
                <DataTable rtcId={props.rtcId} />
              </div>
            </TabPanel>

            <TabPanel value={value} index={2}>
              <div style={{ height: height * .85, width: '100%' }}>
                <DataTable rtcId={props.rtcId} />
              </div>
            </TabPanel>
          </div>
        )}
      </AutoSizer>
    </>
  );
}
