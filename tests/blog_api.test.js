const { test, after, beforeEach } = require('node:test')
const assert = require('node:assert')
const Blog = require('../models/blog')
const mongoose = require('mongoose')
const helper = require('./test_helper')
const supertest = require('supertest')
const app = require('../app')

const api = supertest(app)

beforeEach(async () => {
  await Blog.deleteMany({})

  const blogObjects = helper.initialBlogs
    .map(blog => new Blog(blog))
  
  const promiseArray = blogObjects.map(blog => blog.save())
  await Promise.all(promiseArray)
})

test('blogs are returned as json and the correct amount of blogs', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)

  const blogs = await helper.blogsInDb()
  
  assert.strictEqual(helper.initialBlogs.length, blogs.length)
})

test('there are two blogs', async () => {
  const response = await api.get('/api/blogs')

  assert.strictEqual(response.body.length, 2)
})

test('a valid blog can be added', async () => {
  const newBlog = {
    title: "hello world",
    author: "Chad C. Collins",
    url: "http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.css",
    likes: 3123
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)
  
  const blogs = await helper.blogsInDb()
  assert.strictEqual(blogs.length, helper.initialBlogs.length + 1)

  const titles = blogs.map(r => r.title)
  assert(titles.includes("hello world"))
})

test('blog without likes stated defaults to 0', async () => {
  const newBlog = {
    title: "tech is fun",
    author: "Chad C. Collins",
    url: "http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.css",
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)
  
    const blogs = await helper.blogsInDb()

  const blog = blogs.find(blog => blog.title === "tech is fun")

  assert.strictEqual(blog.likes, 0)
})

test('a specific blog can be viewed', async () => {
  const blogsAtStart = await helper.blogsInDb()

  const blogToView = blogsAtStart[0]

  const resultBlog = await api
    .get(`/api/blogs/${blogToView.id}`)
    .expect(200)
    .expect('Content-Type', /application\/json/)

  assert.strictEqual(JSON.stringify(resultBlog.body.toString()), JSON.stringify(blogToView.toString()))
})

test('a blog can be deleted', async () => {
  const blogsAtStart = await helper.blogsInDb()
  const blogToDelete = blogsAtStart[0]

  await api
    .delete(`/api/blogs/${blogToDelete.id}`)
    .expect(204)

  const blogsAtEnd = await helper.blogsInDb()

  const titles = blogsAtEnd.map(r => r.titles)
  assert(!titles.includes(blogToDelete.title))

  assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length - 1)
})

after(async () => {
  await mongoose.connection.close()
})