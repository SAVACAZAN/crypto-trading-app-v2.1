import  bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { userSchema } from "~/server/models/user.schema";

export default defineEventHandler(async (event) => {
    const nitroApp = useNitroApp()
    const data = await readBody(event)

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = new userSchema({ username: data.username, password: hashedPassword });
    await user.save();
    const token = jwt.sign({ userId: user._id }, 'randomkey1234');

    return {
        data: { token }
    }
})
