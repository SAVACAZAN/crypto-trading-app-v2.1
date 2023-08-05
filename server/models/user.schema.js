import { defineMongooseModel } from '#nuxt/mongoose'
export const userSchema = defineMongooseModel({
    name: 'users',
    schema: {
        username: {
            type: String,
            required: true
        },
        password: {
            type: String,
            required: true
        },
    },
})
