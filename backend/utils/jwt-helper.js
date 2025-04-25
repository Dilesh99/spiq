import jwt from 'jsonwebtoken';

/* Generate both access and refresh tokens */
function jwTokens(username){
    const user = {username};
    const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_KEY, {expiresIn:'1m'});
    const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_KEY, {expiresIn:'14d'});
    return ({accessToken, refreshToken});
}

export {jwTokens};