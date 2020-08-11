import React, { useEffect, useState } from 'react'
import { FaCode } from "react-icons/fa";
import { Card, Icon, Avatar, Col, Typograpy, Row, Typography} from 'antd'
import moment from 'moment';
import Axios from 'axios';
const { Title } = Typography
const { Meta } = Card

function LandingPage() {

    const [Video, setVideo] = useState([])

    // DOM이 로딩되자마자 실행
    useEffect(() => {
        Axios.get('/api/video/getVideos')
            .then(response => {
                if(response.data.success){
                    setVideo(response.data.videos)
                }else{
                    alert('비디오 가져오기를 실패했습니다.')
                }
            })
       
    }, []) // input 부분이 없을경우 계속 실행, []: DOM이 업데이트될 때 한번만


    const renderCards = Video.map((video, index) => {
        var minutes = Math.floor(video.duration / 60)
        var seconds = Math.floor(video.duration - minutes * 60)

        return <Col  lg={6} md={8} xs={24}>
                <a href={`/video/${video._id}`}>
                    <div style={{ position: 'relative'}}>
                        <img style={{ width: '100%'}} src={`http://localhost:5000/${video.thumbnail}`} alt="thumbnail" />
                        <div className="duration">
                            <span>{minutes} : {seconds}</span>
                        </div>
                    </div>
                </a>
                <br />
                <Meta 
                    avatar = { <Avatar src={video.writer.image} />}
                    title = {video.title}
                    description = ""
                />
                <span>{video.writer.name}</span><br />
                <span style={{ marginLeft:'3rem'}}>{video.views} views</span> - <span>{moment(video.createdAt).format("MMM Do YY")}</span>
            </Col>

        
    })



    return (
       <div style={{width:'85%', margin:'3rem auto'}}>
           <Title level={2}>Recommended</Title>
           <hr />
           <Row gutter={[32, 16]}>  

                {renderCards}

           </Row>

       </div>
    )
}

export default LandingPage
