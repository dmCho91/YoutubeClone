import React, { useState } from 'react'
import { Comment, Avatar, Button, Input} from 'antd'
import Axios from 'axios'
import { useSelector } from 'react-redux'

const { TextArea } = Input

function SingleComment(props) {
    const user = useSelector(state => state.user) // redux - state에서 가져옴

    const [OpenReply, setOpenReply] = useState(false)
    const [CommentValue, setCommentValue] = useState("")

    const onClickReplyOpen = () => {
        setOpenReply(!OpenReply)
    }
    
    const onHandleChange = (event) => {
        setCommentValue(event.currentTarget.value)
    }

    const onSubmit = (event) => {
        event.preventDefault()

        const variables = {
            content: CommentValue,
            writer : user.userData._id, // redux 사용
            postId: props.postId,
            responseTo : props.comment._id
        }

        console.log('single: ', variables.postId)
        Axios.post('/api/comment/saveComment', variables)
            .then(response => {
                if(response.data.success){
                    setCommentValue("")
                    setOpenReply(!OpenReply)
                    props.refreshFunc(response.data.result)
                }else{
                    alert(' 코멘트를 저장하지 못했습니다.')
                }
            })

    }

    const actions = [
        <span onClick={onClickReplyOpen} key="comment-basic-reply-to">Reply to</span>
    ]



    return (
        <div>
            <Comment 
                actions={actions}
                author={props.comment.writer.name}
                avatar={
                    <Avatar src={props.comment.writer.image} alt="image"/>
                }
                content={
                    <p> 
                        {props.comment.content}
                    </p>}
            />

            { OpenReply && 
                <form style={{display:'flex'}} onSubmit={onSubmit}>
                    <TextArea 
                        style={{width:'100%', borderRadius:'5px'}}
                        onChange = {onHandleChange}
                        value = {CommentValue}
                        placeholder='코멘트를 작성해주세요'

                    />
                    <br />
                    <Button style={{width:'20%', height:'52px'}} onClick={onSubmit} >Submit</Button>
                </form>
            }
        </div>
    )
}

export default SingleComment
