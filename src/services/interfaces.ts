export interface ListParams {
  limit?: number
  skip?: number
}

export interface Readable<T, TCollection = T[]> {
  getAll(params?: ListParams): Promise<TCollection>
  getById(id: number): Promise<T>
}

export interface Creatable<T, TCreate = Partial<Omit<T, 'id'>>> {
  create(data: TCreate): Promise<T>
}

export interface Editable<T, TUpdate = Partial<Omit<T, 'id'>>> {
  update(id: number, data: TUpdate): Promise<T>
}

export interface Deletable<T> {
  delete(id: number): Promise<T>
}
