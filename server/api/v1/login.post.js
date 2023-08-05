import  bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { userSchema } from "~/server/models/user.schema";

export default defineEventHandler(async (event) => {
    const data = await readBody(event)

    const user = await userSchema.findOne({ username: data.username });
    if (!user) {
        throw createError({ statusCode: 401, statusMessage: 'Invalid username or password' })
    }
    const isValidPassword = await bcrypt.compare(data.password, user.password);
    if (!isValidPassword) {
        throw createError({ statusCode: 401, statusMessage: 'Invalid username or password' })
    }
    const token = jwt.sign({ userId: user._id }, 'randomkey1234');

    setCookie(event, 'token', token);
    setCookie(event, 'userID', user._id);

    return {
        data: {
            username: user.username,
            userID: user._id,
            token: token
        }
    }
})
