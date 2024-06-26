const dummy = (blogs) => {
  return 1
}


const totalLikes = (posts) => {
  return posts.reduce((sum, post) => sum+post.likes, 0)
}

module.exports = {
  dummy, totalLikes
}
