const  {Sequelize , DataTypes } = require('sequelize');

// const db = new Sequelize('MediaChats', 'postgres', 'root', {
//     host: 'localhost',
//     dialect:'postgres' 
// });

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


const User = db.define('User',{
    username:{
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    email:{
        type: DataTypes.STRING,
        allowNull: false  ,
        unique: true
    },
    follower:{
        type:DataTypes.ARRAY(DataTypes.STRING),

    },
    following:{
        type:DataTypes.ARRAY(DataTypes.STRING),
    },
    password:{
        type: DataTypes.STRING,
        allowNull: false
    },
    
    userId:{
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4 ,
        primaryKey: true
    }
})


const  Post = db.define('Post',{
    postId:{
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    userId:{
        type: DataTypes.UUID,
        allowNull: false
    },
    title:{
        type: DataTypes.STRING,
        allowNull: false
    },
    description:{
        type: DataTypes.STRING,
        allowNull: false
    },
    likes:{
        type: DataTypes.ARRAY(DataTypes.STRING)
    },
    comments:{
        type: DataTypes.ARRAY(DataTypes.STRING)
    },

})


module.exports = {db,User, Post}