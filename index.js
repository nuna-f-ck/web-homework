import { renderComments } from './modules/render.js'
import { commentsList } from './modules/arrayComments.js'
import { createComment } from './modules/createComment.js'
import { clickOnComment } from './modules/clickLikes.js'
;('use strict')
renderComments(commentsList)
createComment()
clickOnComment()
