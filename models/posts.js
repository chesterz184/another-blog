var Post = require('../lib/mongo').Post
var marked = require('marked')
var CommentModel = require('./comments')

// 给 post 添加留言数 commentsCount
Post.plugin('addCommentsCount', {
	afterFind: function (posts) {
		return Promise.all(posts.map(function (post) {
			return CommentModel.getCommentsCount(post._id).then(function (commentsCount) {
				post.commentsCount = commentsCount
				return post
			})
		}))
	},
	afterFindOne: function (post) {
		if (post) {
			return CommentModel.getCommentsCount(post._id).then(function (count) {
				post.commentsCount = count
				return post
			});
		}
		return post
	}
})

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
		.addCommentsCount()
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
		.addCommentsCount()
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
		return Post.remove({ author: author, _id: postId })
		.exec()
		.then(function (res) {
			if (res.result.ok && res.result.n > 0) {
				return CommentModel.delCommentsByPostId(postId);
			}
		});
	}

}