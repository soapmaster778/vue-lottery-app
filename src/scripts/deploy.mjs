import { execFileSync } from 'node:child_process'
import ghpages from 'gh-pages'

const branch = execFileSync('git', ['branch', '--show-current'], { encoding: 'utf8' }).trim()

if (branch !== 'feature/routing') {
  throw new Error('Запускайте деплой з гілки feature/routing.')
}

await new Promise((resolve, reject) => {
  ghpages.publish(
    'dist',
    {
      branch: 'gh-pages',
      nojekyll: true,
      message: 'Deploy feature/routing',
    },
    (error) => {
      if (error) {
        reject(error)
        return
      }

      resolve()
    },
  )
})

console.log('Збірку опубліковано в гілці gh-pages.')
