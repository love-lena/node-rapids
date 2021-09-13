import { Button } from '@material-ui/core';
import * as React from 'react';
import { useTable, usePagination } from 'react-table'
import { getPeer } from '../webrtc/client';

import makeData from './makeData'


function Table({
  columns,
  data,
  fetchData,
  loading,
  pageCount: controlledPageCount,
}) {
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    rows,
    // page,
    // canPreviousPage,
    // canNextPage,
    // pageOptions,
    // pageCount,
    // gotoPage,
    // nextPage,
    // previousPage,
    // setPageSize,
    // Get the state from the instance
    // state: { pageIndex, pageSize },
  } = useTable(
    {
      columns,
      data,
      // initialState: { pageIndex: 0 }, // Pass our hoisted table state
      // manualPagination: true, // Tell the usePagination
      // hook that we'll handle our own data fetching
      // This means we'll also have to provide our own
      // pageCount.
      // pageCount: controlledPageCount,
    },
    // usePagination
  )

  // Listen for changes in pagination and use the state to fetch our new data
  // React.useEffect(() => {
  //   fetchData({ pageIndex, pageSize })
  // }, [fetchData, pageIndex, pageSize])

  return (<></>)
  // Render the UI for your table
  // return (
  //   <>
  //     <table {...getTableProps()}>
  //       <thead>
  //         {headerGroups.map(headerGroup => (
  //           <tr {...headerGroup.getHeaderGroupProps()}>
  //             {headerGroup.headers.map(column => (
  //               <th {...column.getHeaderProps()}>
  //                 {column.render('Header')}
  //                 <span>
  //                   {column.isSorted
  //                     ? column.isSortedDesc
  //                       ? ' 🔽'
  //                       : ' 🔼'
  //                     : ''}
  //                 </span>
  //               </th>
  //             ))}
  //           </tr>
  //         ))}
  //       </thead>
  //       <tbody {...getTableBodyProps()}>
  //         {rows.map((row, i) => {
  //           prepareRow(row)
  //           return (
  //             <tr {...row.getRowProps()}>
  //               {row.cells.map(cell => {
  //                 return <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
  //               })}
  //             </tr>
  //           )
  //         })}
  //       </tbody>
  //     </table>
  //     {/*
  //       Pagination can be built however you'd like.
  //       This is just a very basic UI implementation:
  //     */}
  //     <div className="pagination">
  //       <button onClick={() => previousPage()} >
  //         {'<'}
  //       </button>{' '}
  //       <button onClick={() => nextPage()} >
  //         {'>'}
  //       </button>{' '}
  //       <span>
  //         Page{' '}
  //         <strong>
  //           ? of ?
  //         </strong>{' '}
  //       </span>
  //       <span>
  //         | Go to page:{' '}
  //         <input
  //           type="number"
  //           defaultValue={1}
  //           onChange={e => {
  //             const page = e.target.value ? Number(e.target.value) - 1 : 0
  //             gotoPage(page)
  //           }}
  //           style={{ width: '100px' }}
  //         />
  //       </span>{' '}
  //       <select
  //         value={10}
  //         onChange={e => {
  //           setPageSize(Number(e.target.value))
  //         }}
  //       >
  //         {[10, 20, 30, 40, 50].map(pageSize => (
  //           <option key={pageSize} value={pageSize}>
  //             Show {pageSize}
  //           </option>
  //         ))}
  //       </select>
  //     </div>
  //   </>
  // )
}


export default function DataTable(props) {

  let _peer = undefined;
  const columns = React.useMemo(
    () => [
      {
        Header: 'Name',
        columns: [
          {
            Header: 'First Name',
            accessor: 'firstName',
          },
          {
            Header: 'Last Name',
            accessor: 'lastName',
          },
        ],
      },
      {
        Header: 'Info',
        columns: [
          {
            Header: 'Age',
            accessor: 'age',
          },
          {
            Header: 'Visits',
            accessor: 'visits',
          },
          {
            Header: 'Status',
            accessor: 'status',
          },
          {
            Header: 'Profile Progress',
            accessor: 'progress',
          },
        ],
      },
    ],
    []
  )

  React.useEffect(() => {
    _peer = getPeer(props.rtcId);
    _peer.on('data', updateServerData);
  }, [props.rtcId]);

  // We'll start our table without any data
  const [data, setData] = React.useState([]) //the way the material panels work, the element is completly deleted and rerendered each time
  const [loading, setLoading] = React.useState(false)
  const [pageCount, setPageCount] = React.useState(2)
  const fetchIdRef = React.useRef(0)

  // const fetchData = React.useCallback(({ pageSize, pageIndex }) => {
  // }, [])

  const updateServerData = (newData) => {
    var decoded = new TextDecoder().decode(newData);
    var decodedjson = JSON.parse(decoded);
    setData(decodedjson.data);
  }

  const response = (rtcId) => {
    fetch('/api/sendnew', {
      method: 'POST',
      body: JSON.stringify({ rtcId }),
      headers: { 'Content-Type': 'application/json' },
    })
  };

  return (
    <>
      <Table
        columns={columns}
        data={data}
        fetchData={() => { }}
        loading={loading}
        pageCount={pageCount}
      />
      <Button variant="contained" color="primary" onClick={() => { response(props.rtcId) }}>get new data</Button>
    </>
  );
}



function gotoPage(arg0: number): void {
  throw new Error('Function not implemented.');
}

function previousPage(): void {
  throw new Error('Function not implemented.');
}

function nextPage(): void {
  throw new Error('Function not implemented.');
}

function setPageSize(arg0: number) {
  throw new Error('Function not implemented.');
}
