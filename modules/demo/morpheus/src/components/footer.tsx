import React from "react";
import { Link } from '@material-ui/core';
import { Typography } from '@material-ui/core';
import styles from '../styles/GraphVisApp.module.css';


export default function Footer() {

  return (
    <>
      <Typography variant="h6" align='left'>
        Powered by <Link href="https://developer.nvidia.com/rapids">RAPIDS</Link> |
        <Link href="https://example.com"> Docs</Link> |
        <Link href="https://developer.nvidia.com/rapids"> GitHub</Link>
      </Typography>
    </>
  );
}
