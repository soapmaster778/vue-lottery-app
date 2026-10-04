export interface TableColumn<Row> {
  key: string
  label: string
  value?: (row: Row, index: number) => unknown
  ariaSort?: 'none' | 'ascending' | 'descending'
}
