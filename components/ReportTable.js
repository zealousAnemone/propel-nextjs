import { useTable } from 'react-table'
import { useMemo } from 'react'
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer
} from '@chakra-ui/react'

const ReportTable = (props) => {
  const columns = useMemo(() => props.columns, [props.columns])

  const data = useMemo(() => props.rows, [props.rows])

  const table = useTable({ columns, data })

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    table

  return (
    <TableContainer>
      <Table variant="striped" colorScheme="teal" {...getTableProps()}>
        <Thead>
          {headerGroups.map((headerGroup) => (
            <Tr key={headerGroup.id} {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column) => (
                <Th key={column.id} {...column.getHeaderProps()}>
                  {column.render('Header')}
                </Th>
              ))}
            </Tr>
          ))}
        </Thead>
        <Tbody {...getTableBodyProps()}>
          {rows.map((row) => {
            prepareRow(row)
            return (
              <Tr key={row.id} {...row.getRowProps()}>
                {row.cells.map((cell) => {
                  return (
                    <Td key={cell.id} {...cell.getCellProps()}>
                      {cell.render('Cell')}
                    </Td>
                  )
                })}
              </Tr>
            )
          })}
        </Tbody>
      </Table>
    </TableContainer>
  )
}

export default ReportTable
