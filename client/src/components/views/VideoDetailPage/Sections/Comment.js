import React, { useState } from 'react'
import Axios from 'axios'
import { useSelector } from 'react-redux'
import SingleComment from './SingleComment'
import { Button } from 'antd'
import ReplyComment from './ReplyComment'

function Comment(props) {
    const videoId = props.postId

    const user = useSelector(state => state.user) // redux - state에서 가져옴
    const [CommentValue, setCommentValue] = useState("")

    const handleClick = (event) => {
        setCommentValue(event.currentTarget.value)
    }

    const onSubmit = (event) => {
        event.preventDefault() //refresh 방지

        const variables = {
            content: CommentValue,
            // writer: localStorage.getItem('userId'),
            writer : user.userData._id, // redux 사용
            postId: videoId
        }

        Axios.post('/api/comment/saveComment', variables)
            .then(response => {
                if(response.data.success){
                    console.log(response.data.result)
                    setCommentValue("")
                    props.refreshFunc(response.data.result)
                }else{
                    alert(' 코멘트를 저장하지 못했습니다.')
                }
            })
    }

    return (
        <div>
            <br />
            <p> Replies</p>
            <hr />

            {/* Comment Lists */} 
            {props.commentLists && props.commentLists.map((comment, index) => (
                (!comment.responseTo &&
                    <React.Fragment>
                        <SingleComment refreshFunc={props.refreshFunc} comment={comment} postId={props.postId}/>
                        <ReplyComment refreshFunc={props.refreshFunc} parentCommentId={comment._id} commentLists={props.commentLists} postId={props.postId}/>
                    </React.Fragment>
                )
            ))} 

            {/* Root Comment Form */}

            <form style={{display:'flex'}} onSubmit={onSubmit}>
                <textarea 
                    style={{width:'100%', borderRadius:'5px'}}
                    onChange={handleClick}
                    value={CommentValue}
                    placeholder='코멘트를 작성해주세요'

                />
                <br />
                <Button style={{width:'20%', height:'52px'}} onClick={onSubmit} >Submit</Button>
            </form>
        </div>
    )
}

export default Comment
