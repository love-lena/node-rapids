import * as React from 'react';
import { DataGrid } from '@material-ui/data-grid';
import { useTable } from 'react-table';

const oldcolumns = [
  { field: 'id', headerName: 'ID', width: 90 },
  {
    field: 'firstName',
    headerName: 'First name',
    width: 150,
    editable: true,
  },
  {
    field: 'lastName',
    headerName: 'Last name',
    width: 150,
    editable: true,
  },
  {
    field: 'age',
    headerName: 'Age',
    type: 'number',
    width: 110,
    editable: true,
  },
  {
    field: 'fullName',
    headerName: 'Full name',
    description: 'This column has a value getter and is not sortable.',
    sortable: false,
    width: 160,
    valueGetter: (params) =>
      `${params.getValue(params.id, 'firstName') || ''} ${params.getValue(params.id, 'lastName') || ''
      }`,
  },
];

const rows1 = [
  { id: 1, lastName: 'Snow', firstName: 'Jon', age: 35 },
  { id: 2, lastName: 'Lannister', firstName: 'Cersei', age: 42 },
  { id: 3, lastName: 'Lannister', firstName: 'Jaime', age: 45 },
  { id: 4, lastName: 'Stark', firstName: 'Arya', age: 16 },
  { id: 5, lastName: 'Targaryen', firstName: 'Daenerys', age: null },
  { id: 6, lastName: 'Melisandre', firstName: null, age: 150 },
  { id: 7, lastName: 'Clifford', firstName: 'Ferrara', age: 44 },
  { id: 8, lastName: 'Frances', firstName: 'Rossini', age: 36 },
  { id: 9, lastName: 'Roxie', firstName: 'Harvey', age: 65 },
];

const rows2 = [
  { id: 1, lastName: 'Not Snow', firstName: 'Not Jon', age: 35 },
  { id: 2, lastName: 'Not Lannister', firstName: 'Not Cersei', age: 42 },
  { id: 3, lastName: 'Not Lannister', firstName: 'Not Jaime', age: 45 },
  { id: 4, lastName: 'Not Stark', firstName: 'Not Arya', age: 16 },
  { id: 5, lastName: 'Not Targaryen', firstName: 'Not Daenerys', age: null },
  { id: 6, lastName: 'Not Melisandre', firstName: null, age: 150 },
  { id: 7, lastName: 'Not Clifford', firstName: 'Not Ferrara', age: 44 },
  { id: 8, lastName: 'Not Frances', firstName: 'Not Rossini', age: 36 },
  { id: 9, lastName: 'Not Roxie', firstName: 'Not Harvey', age: 65 },
];



export default function DataTable(props) {

  const data = React.useMemo(
    () => [
      {
        col1: 'Hello',
        col2: 'World',
      },
      {
        col1: 'react-table',
        col2: 'rocks',
      },
      {
        col1: 'whatever',
        col2: 'you want',
      },
    ],
    []
  )

  const columns = React.useMemo(
    () => [
      {
        Header: 'Column 1',
        accessor: 'col1', // accessor is the "key" in the data
      },
      {
        Header: 'Column 2',
        accessor: 'col2',
      },
    ],
    []
  )

  //@ts-ignore
  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow, } = useTable({ columns, data })

  fetch('./api/table')
    .then(response => response.json())
    .then(data => console.log(data));


  return (

    <DataGrid
      rows={props.sel ? rows2 : rows1}
      columns={oldcolumns}
      pageSize={5}
      rowsPerPageOptions={[5]}
      checkboxSelection
      disableSelectionOnClick
    />
  );
}
