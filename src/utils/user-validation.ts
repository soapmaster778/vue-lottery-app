import * as yup from 'yup'

export const userSchema = yup.object({
  firstName: yup.string().trim().required('Введіть ім’я.'),

  lastName: yup.string().trim().required('Введіть прізвище.'),

  email: yup
    .string()
    .trim()
    .email('Вкажіть коректну електронну пошту.')
    .required('Введіть електронну пошту.'),

  username: yup.string().trim().required('Введіть username.'),

  password: yup
    .string()
    .required('Введіть пароль.')
    .min(6, 'Пароль має містити щонайменше 6 символів.'),

  age: yup
    .number()
    .transform((value, originalValue) => (originalValue === '' ? undefined : value))
    .typeError('Вкажіть вік числом.')
    .integer('Вік має бути цілим числом.')
    .min(0, 'Вік не може бути від’ємним.')
    .max(120, 'Вкажіть вік від 0 до 120.')
    .required('Вкажіть вік.'),

  gender: yup
    .string()
    .oneOf(['male', 'female', 'other'], 'Оберіть стать.')
    .required('Оберіть стать.'),

  phone: yup
    .string()
    .trim()
    .required('Введіть телефон.')
    .matches(/^\+?[0-9 ()-]{7,25}$/, 'Вкажіть коректний номер телефону.'),
})
