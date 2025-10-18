

import { userSchema } from '~/server/models/user.schema';
export default defineEventHandler(async (event) => {

    const nitroApp = useNitroApp()
    const query = getQuery(event)

    const response = await userSchema.find({ username: query.username, referralCode: query.referralCode });

    // console.log(response);

    return {
        data: response
    }
})
