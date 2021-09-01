// Copyright (c) 2021, NVIDIA CORPORATION.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import type { NextPage, GetServerSidePropsContext } from 'next';
import Head from 'next/head';

import styles from '../styles/Index.module.css';
import GraphVisApp from '../components/graphvisapp'

type Props = {
  rtcId: string;
};

export async function getServerSideProps({ params = { rtcId: '' } }: GetServerSidePropsContext<Props>) {
  // Force server-side rendering to translate the rtcId from the URL into a React prop
  return {
    props: {
      rtcId: params.rtcId,
    }
  };
}

const Index = ((props: Props) => {
  return (
    <div className={styles['app']}>
      <Head>
        <title>rtc session id: {props.rtcId}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <GraphVisApp rtcId={props.rtcId} />
    </div>
  )
}) as NextPage;

export default Index;
