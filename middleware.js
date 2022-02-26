const jwt = require("jsonwebtoken");


module.exports.isLoggedIn = (req, res, next)=>{
    const bearerHeader = req.headers['authorization'];
    if(typeof bearerHeader !== 'undefined'){
        const bearer = bearerHeader.split(' ');
        const bearerToken = bearer[1];
        req.token = bearerToken;
        jwt.verify(req.token, 'darksecretkey', (err, authData) => {
            if(err){
            console.log(err)
            res.sendStatus(403);
            }else {
                req.authData=authData;
                next();
            }
        })
    }else{
        res.sendStatus(403)
    }
    

}
