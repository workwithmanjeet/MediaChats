const express = require('express');
const router = express.Router();
const {db, User, Post} = require('../models.js');
const { v4: uuidv4 } = require('uuid');
const {isLoggedIn} = require('../middleware.js');

function removeUsername(array,username ){
    for( var i = 0; i < array.length; i++){ 
        if ( array[i] === username){     
            array.splice(i, 1); 
        }  
    }
    return array;
}

router.post('/posts',isLoggedIn,async (req, res)=>{
    const id=req.authData.userId
    const { title,description} = req.body
    try{
        const newpost = await Post.create({ title: title, userId: id ,description: description});
        console.log(newpost)
        res.send(newpost)


    }catch(error){
        console.log(error)
    }
  
})


router.post('/like/:pid',isLoggedIn,async (req, res)=>{
    const username=req.authData.username
    const {pid} = req.params
    try{
        const chlike= await Post.findAll({
            attributes: ['likes'],
            where:{
                postId :pid
            }
        })
        if(chlike.length >0){
            const orglikes =chlike[0].dataValues.likes
            if(orglikes.includes(username)){
                res.json({'message': 'Post Already liked!'})
            }else{
                const post= await Post.update({'likes': db.fn('array_append', db.col('likes'),username)},
                    {'where': {postId :pid}
                });
                console.log(post)
                res.json({'message': 'Post liked Successfully!'})
            }
        }else{
            res.json({'message': 'No Post Found !'})
        }
        

        
    }catch(error){
        console.log(error)
    }
})

router.post('/unlike/:id',isLoggedIn,async (req, res)=>{
    const username=req.authData.username
    const {id} = req.params
    try{
        const chlike= await Post.findAll({
            attributes: ['likes'],
            where:{
                postId :id
            }
        })
        if(chlike.length >=0){
            newlike=removeUsername(chlike[0].dataValues.likes, username)
            const ch1= await Post.update({ 'likes': newlike }, {
                where: {
                    postId:id,
                }
            });
            res.json({'message': 'Post unliked Successfully!'})

        }else{
            res.json({'message': 'No Post Found !'})
        }
        
        
    }catch(error){
        res.json({'message': 'error'})
    }
})

router.post('/comment/:id',isLoggedIn,async (req, res)=>{
    const username=req.authData.username
    const {id} = req.params
    const text = req.body.text
    const stcom =JSON.stringify({'commentID':uuidv4(), 'username': username,'comment':text})
    try{
        const post= await Post.update({'comments': db.fn('array_append', db.col('comments'),stcom)},
            {'where': {postId :id}
        });
        console.log(post)
        res.send(post)
    }catch(error){
        console.log(error)
    }
})

router.get('/posts/:id',isLoggedIn,async (req, res)=>{
    const {id} = req.params
    try{
        const post= await Post.findAll({
            attributes: ['postId','title','description','createdAt','likes','comments'],
            where:{
                postId :id
            }
        })
        console.log(post)
        if(post.length != 0){
            if(post[0].comments){
                comments= post[0].comments
                let newcc=[]
                for(let cc of comments){
                    newcc.push(JSON.parse(cc))
                }
                post[0].comments=newcc
                console.log(newcc)
            }
            res.send(post[0])
        }else{
            res.send({'No Record Found': 0})
        }
    
    }catch(error){
        console.log(error)
    }
  
})

router.delete('/posts/:id',isLoggedIn,async (req, res)=>{
    const {id}=req.params
    try{
        const deletepost= await Post.destroy({
            where: {
              postId: id
            }
        });
        console.log(deletepost)
        res.status(200).send("Post Deleted")
    }catch(error){
        console.log(error)
    }
  
})


module.exports = router