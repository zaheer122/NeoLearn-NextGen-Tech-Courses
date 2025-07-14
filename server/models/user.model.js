import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true

    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true,
        
    },
    description:{
        type:String,
        
        
    },
    dateOfBirth:{
        type:Date,
        default:null
    },
    role:{
        type:String,
        enum:["instructor","student"],
        required:true
    },
    photoUrl:{
        type:String,
        default:""
    },
    avatarId:{
        type:String,
        default:""
    },
    enrolledCourses:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:'Course'
        }
    ]

},{timestamps:true})

export const  User = mongoose.model('User',userSchema);