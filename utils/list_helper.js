const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  return blogs.reduce(
    (sum, blog) => sum + blog.likes, 
    0
  )
}

const favoriteBlog = (blogs) => {
  return blogs.find(
    blog => blog.likes === Math.max(
      ...blogs.map(blog => blog.likes)
    )
  )
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog
}