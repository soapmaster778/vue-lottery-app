export interface TableColumn<Row> {
  key: keyof Row | 'index'
  label: string
}
