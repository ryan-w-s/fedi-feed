import fs from 'fs'
import generator, { Entity, Response, detector } from 'megalodon'
import { AppDataSource } from "./data-source"
import { Post } from "./entity/Post"
import { LessThan } from 'typeorm'


const { access_token, serverUrl } = JSON.parse(fs.readFileSync('tokenData.json', 'utf-8'))

AppDataSource.initialize().then(async () => {

    console.time('fetching')

    const instanceType = await detector(serverUrl)
    const client = generator(instanceType, serverUrl, access_token)

    let data: Array<Entity.Status>

    try {
        const res: Response<Array<Entity.Status>> = await client.getHomeTimeline({ limit: 25 })
        data = res.data
    } catch (error) {
        console.error('Failed to get home timeline:', error)
    }

    console.timeEnd('fetching')

    fs.writeFileSync('data.json', JSON.stringify(data, null, 2))

    const posts = data.filter(post => !post.in_reply_to_id && !post.reblog)
        .map(post => {
            const actualPost = post.reblog || post
            const instanceDomain = new URL(actualPost.account.url).hostname
            const fields = {
                id: actualPost.id,
                content: actualPost.content,
                mediaUrls: actualPost.media_attachments.map(media => media.url).join(';'),
                postUrl: `${serverUrl}/@${actualPost.account.username}@${instanceDomain}/posts/${actualPost.id}`,
                account: actualPost.account.username,
                favouritesCount: actualPost.favourites_count + actualPost.emoji_reactions.reduce((total, reaction) => total + reaction.count, 0),
                reblogsCount: actualPost.reblogs_count,
                repliesCount: actualPost.replies_count,
                score: actualPost.favourites_count 
                    + actualPost.reblogs_count 
                    + actualPost.replies_count 
                    + actualPost.emoji_reactions.reduce((total, reaction) => total + reaction.count, 0),
            }
            return Object.assign(new Post(), fields)
        })
    console.time('saving')
    await AppDataSource.manager.save(posts, { chunk: 100 })
    console.timeEnd('saving')

    // delete older than two weeks
    console.time('deleting')
    const twoWeeksAgo = new Date()
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14)
    await AppDataSource.manager.delete(Post, { created_at: LessThan(twoWeeksAgo) })
    console.timeEnd('deleting')

}).catch(error => console.log(error))

