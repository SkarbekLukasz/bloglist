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

const mostBlogs = (blogs) => {
  if (blogs.length === 0) {
    return null
  }

  const countedAuthors = blogs.reduce((counter, blog) => {
    counter[blog.author] = (counter[blog.author] || 0) + 1
    return counter
  }, {})

  const topAuthor = Object.keys(countedAuthors).reduce((top, author) => {
    return countedAuthors[author] > (countedAuthors[top] || 0) ? author : top
  }, null)

  return {
    author: topAuthor,
    blogs: countedAuthors[topAuthor]
  }
}

const mostLikes = (blogs) => {
  if (blogs.length === 0) {
    return null
  }

  const countedAuthors = blogs.reduce((counter, blog) => {
    counter[blog.author] = (counter[blog.author] || 0) + blog.likes
    return counter
  }, {})

  const topLiked = Object.keys(countedAuthors).reduce((top, author) => {
    return countedAuthors[author] > (countedAuthors[top] || 0) ? author : top
  }, null)

  return { author: topLiked, likes: countedAuthors[topLiked] }
}

module.exports = {
  dummy, totalLikes, favoriteBlog, mostBlogs, mostLikes
}
