import { AppDataSource } from "./data-source"
import { User } from "./entity/User"
import express from 'express'
import { Post } from './entity/Post'
import path from 'path'


AppDataSource.initialize().then(async () => {

    const app = express()
    app.use(express.json())
    app.use(express.static(path.join(__dirname, 'client/build')))
    
    app.get('/posts', async (req, res) => {
      const posts = await AppDataSource.manager
        .createQueryBuilder(Post, 'post')
        .where('post.seen = false')
        .orderBy('post.score', 'DESC')
        .limit(10)
        .getMany()
      res.json(posts)
    })
    
    app.post('/posts/seen', async (req, res) => {
      const postIds = req.body
      await AppDataSource.manager
        .createQueryBuilder()
        .update(Post)
        .set({ seen: true })
        .whereInIds(postIds)
        .execute()
      res.status(200).send()
    })

    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, 'client/build', 'index.html'))
    })
    
    const port = 3000
    app.listen(port, () => {
      console.log(`Server running on http://localhost:${port}`)
    })

}).catch(error => console.log(error))