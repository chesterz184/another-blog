var Post = require('../lib/mongo').Post
var marked = require('marked')

//markdown转换成html
Post.plugin('contentToHtml', {
	afterFind: function(posts) {
		return posts.map(function (post) {
			post.content = marked(post.content)
			return post
		})
	},
	afterFindOne: function(post) {
		if(post) {
			post.content = marked(post.content)
		}
		return post
	}
})
module.exports = {
	publish: function publish(post) {
		return Post.create(post).exec()
	},
	getPostById: function getPostById(postId) {
		return Post
		.findOne({_id: postId})
		.populate({path: 'author', model: 'User'})
		.addCreatedAt()
		.contentToHtml()
		.exec()
	},
	//按时间降序获取文章
	getPosts: function getPosts(author) {
		var query = {}
		if(author) {
			query.author = author
		}
		return Post
		.find(query)
		.populate({path: 'author', model: 'User'})
		.addCreatedAt()
		.contentToHtml()
		.exec()
	},
	//增加点击量
	incPv: function incPv(postId) {
		return Post
		.update({_id: postId}, {$inc: {pv : 1}})
		.exec()
	},
	getRawPostById: function getRawPostById(postId) {
		return Post
		.findOne({ _id: postId })
		.populate({ path: 'author', model: 'User' })
		.exec()
	},
	// 通过用户 id 和文章 id 更新一篇文章
	updatePostById: function updatePostById(postId, author, data) {
		return Post.update({ author: author, _id: postId }, { $set: data }).exec()
	},

	// 通过用户 id 和文章 id 删除一篇文章
	delPostById: function delPostById(postId, author) {
		return Post.remove({ author: author, _id: postId }).exec()
	}

}