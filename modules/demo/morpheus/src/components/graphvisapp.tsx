import styles from '../styles/GraphVisApp.module.css';
import AutoSizer from 'react-virtualized-auto-sizer';
import WebRTCFrame from './webrtcframe';
import { Fragment } from 'react';
import TopBar from './topbar';
import Footer from './footer'
import NavTabs from './tabview';
import ConsoleView from './console';


type Props = {
  rtcId: string;
};

const GraphVisApp = (props: Props) => {

  return (
    <>
      <div className={styles['title-bar']}>
        <TopBar></TopBar>
      </div>
      <div className={styles['webrtc-view']}>
        <AutoSizer defaultWidth={800} defaultHeight={600}>
          {({ width, height }) => (
            <WebRTCFrame
              width={width}
              height={height}
              rtcId={props.rtcId}
            >
            </WebRTCFrame>
          )}
        </AutoSizer>
      </div>
      <div className={styles['bottom-view']}>
        <div className={styles['table-view']}>
          <NavTabs></NavTabs>
        </div>
        <div className={styles['console-view']}>
          <ConsoleView></ConsoleView>
        </div>
      </div >
      <div className={styles['footer']}>
        <Footer></Footer>
      </div>
    </>
  );
}

export default GraphVisApp;
