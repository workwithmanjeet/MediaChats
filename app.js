if (process.env.NODE_ENV!== "production"){
    require('dotenv').config({ path:'./.env' });
}
const pg = require('pg');
pg.defaults.ssl = true;
const express = require('express');
const { Sequelize , DataTypes } = require('sequelize');
const app = express()
const { User , Post} = require('./models.js')
const userRoutes= require('./routes/user.js')
const postRoutes= require('./routes/post.js')




const db = new Sequelize(process.env.database, process.env.username, process.env.password, {
    host: process.env.host,
    dialect:'postgres' ,
    dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false // <<<<<<< YOU NEED THIS
        }
      },
});
// const db = new Sequelize('MediaChats', 'postgres', 'root', {
//     host: 'localhost',
//     dialect:'postgres' 
// });


try{
    async function connection(){
        await db.authenticate();
        console.log('Connection has been established successfully.');
        User.hasMany(Post, {foreignKey: 'userId'});
        Post.belongsTo(User, {foreignKey: 'userId'})
        await User.sync() // {force:true  }
        await Post.sync()  
        
    }
    connection()
    
}catch (error) {
    console.error('Unable to connect to the database:', error);
}
// app.use((req, res,next)=>{    
//     res.locals.currUser=req.user;
//     next();
// })


const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({extended: true}))

app.use('/api',userRoutes)
app.use('/api',postRoutes)

app.get('/',(req,res)=>{
    res.json({'message':'hii'})
})
app.listen(PORT, () => {
    console.log(`Server  running on port ${ PORT }`);
});