import { Entity, Column, PrimaryColumn, CreateDateColumn, Index } from 'typeorm'

@Entity('posts')
export class Post {
    @PrimaryColumn('varchar', { length: 255 })
    id: string

    @Column('text')
    content: string

    @Column('text')
    mediaUrls: string

    @Column('text')
    postUrl: string

    @Column('varchar', { length: 255 })
    account: string

    @Column('int')
    favouritesCount: number

    @Column('int')
    reblogsCount: number

    @Column('int')
    repliesCount: number

    @Index()
    @Column('int')
    score: number

    @Index()
    @CreateDateColumn()
    created_at: Date
}