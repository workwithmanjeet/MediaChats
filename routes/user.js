const express = require('express');
const router = express.Router();
const {db, User,Post} = require('../models.js');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {isLoggedIn} = require('../middleware.js');
const { Sequelize  } = require('sequelize');
const Op = Sequelize.Op



function removeUsername(array,username ){
    for( var i = 0; i < array.length; i++){ 
        if ( array[i] === username){     
            array.splice(i, 1); 
        }  
    }
    return array;
}



router.post('/authenticate',async (req, res)=>{
    try{
        const {email, password}= req.body
        User.findAll({
            attributes: ['username','userId','password'],
            where: {
                email: email
            }
        })
        .then(data=>{
            // console.log(data)
            if(data.length==0){
                res.status(401).send('Invalid Credentials')
            }else{
                const ans =  bcrypt.compareSync(password, data[0].password); 
                if(ans){
                    token=jwt.sign({
                        userId: data[0].userId,
                        username:data[0].username
                    }, 'darksecretkey', { expiresIn: '20h' });
                   
                res.status(200).send({'token':token})
                }else{
                    res.status(401).send('Invalid Credentials')
                }
            }
        })
        .catch(err=>{
            console.log(err)
        })      


    }catch(e){
        console.log(e)
    }
})


router.post('/user/new',async (req, res)=>{
    try{

        const hash = bcrypt.hashSync(req.body.password, 8);
        const newuser = await User.create(
            { username: req.body.username, email: req.body.email ,follower:[],following:[], password:hash }, 
        );
        console.log(newuser);
        res.send({
            username:newuser.username,
            userId:newuser.userId,
            email:newuser.email
        })

    }catch(error){
        console.log(error)
    }
  
})

router.post('/follow/:fid',isLoggedIn,async (req, res)=>{
    const id=req.authData.userId
    const {fid}=req.params
    try{
        const check= await User.findAll({
            attributes: ['username','userId'],
            where: {
                userId: fid
            }
        })
        if(id==fid){
            res.json({'message': 'User cannot follow itself'})

        }else if(check.length > 0){
            const fusername = check[0].dataValues.username
            console.log(fusername)
            const v= await User.findAll({
                attributes: ['username'],
                where:{
                    userId:id,
                    following: {  [Op.contains]: [fusername] },
                }
                
            })
            if(v.length==0){
                const follow = await User.update({'follower': db.fn('array_append', db.col('follower'),req.authData.username)},
                    { 'where': {userId :fid}}
                );
                const following = await User.update({'following': db.fn('array_append', db.col('following'),fusername)},
                    {'where': {userId :id}}
                );
                res.json({'message': 'User follow Successfully!'})
            }else{
                res.json({'message': 'User already followed'})
            }

        }else{
            res.json({'message': 'User Not Exist'})
        }


    }catch(error){
        console.log(error)
        res.json({'message': 'User Not Exist'})
    }
  
})


router.post('/unfollow/:ufid',isLoggedIn,async (req, res)=>{
    const id=req.authData.userId
    const {ufid}=req.params
    
    try{
        if(id==ufid){
            res.json({'message': 'User cannot unfollow itself'})
        }else{
            const check= await User.findAll({
                attributes: ['username','userId'],
                where: {
                    userId: ufid
                }
            })
            if(check.length>=0){
                const ufusername = check[0].dataValues.username
                console.log(ufusername)
                const currfollowing= await User.findAll({
                    attributes: ['username','following'],
                    where:{
                        userId:id,
                        following: {  [Op.contains]: [ufusername] },
                    }
                })
                if(currfollowing.length>=0){
                    const currfollower=await User.findAll({
                        attributes: ['username','follower'],
                        where:{
                            userId:ufid,
                            follower: {  [Op.contains]: [req.authData.username] },
                        }
                    })
                    console.log(currfollowing)
                    console.log(currfollower)
                  
                    newfollowing=removeUsername(currfollowing[0].dataValues.following,currfollower[0].dataValues.username)
                    newfollower=removeUsername(currfollower[0].dataValues.follower,currfollowing[0].dataValues.username)
                    console.log("=====================================")
                    console.log(newfollowing)
                    console.log(newfollower)
                    const ch1= await User.update({ following: newfollowing }, {
                        where: {
                            userId:id,
                        }
                      });
                    const ch2= await User.update({ follower: newfollower}, {
                        where: {
                            userId:ufid,
                        }
                      });
                    res.json({'message': 'User unfollow Successfully!'})


                }else{
                    res.json({'message': 'User not follow this account!'})
                }
            }else{
                res.json({'message': 'User Not Exist'})
            }
            res.send(check)
        }
        

    }catch(error){
        console.log(error)
        res.json({'message': 'User Not Exist'})
    }
  
})





router.get('/user/all',isLoggedIn, async (req, res)=>{
    try{
        console.log(req.authData)
        const userRes= await User.findAll({
            attributes: [
                'username',
                'userId','follower','following'
                // [db.fn('array_length', db.col('follower'),1), 'follower'],
                // [db.fn('array_length', db.col('following'),1), 'following']
            ],
            
        })
        console.log(userRes)
        res.send(userRes)

    }catch(error){
        console.log(error)
    }
  
})
router.get('/user',isLoggedIn,async (req, res)=>{
    const id=req.authData.userId
    try{
        const userRes= await User.findAll({
            attributes: ['username', 'follower',  'following'],
            where:{
                userId :id
            }
        })
        console.log(userRes)
        res.send(userRes[0])

    }catch(error){
        console.log(error)
    }
  
})
router.get('/all_post',isLoggedIn,async (req, res)=>{
    const id=req.authData.userId
    try{
        const allpost= await Post.findAll({
            attributes: ['postId','title','description','createdAt','likes','comments'],
            where:{
                userId :id
            }
        })
        console.log(allpost)
        res.send(allpost)

    }catch(error){
        console.log(error)
    }
  
})

module.exports = router

