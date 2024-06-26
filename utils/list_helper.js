const dummy = (blogs) => {
  return 1
}


const totalLikes = (posts) => {
  return posts.reduce((sum, post) => sum+post.likes, 0)
}

const favoriteBlog = (blogs) => {
    if(blogs.length === 0) {
        return null
    }
  const topBlog = blogs.reduce((top, blog) => {
    return top.likes > blog.likes ? top : blog
  })
  const result = {
    title: topBlog.title,
    author: topBlog.author,
    likes: topBlog.likes
  }

  return result
}

module.exports = {
  dummy, totalLikes, favoriteBlog
}
