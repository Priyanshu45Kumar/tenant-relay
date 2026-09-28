import mongoose from "mongoose";
import {Schema,model, type Document, type Types} from "mongoose";

export interface IApiKey extends Document{
    tenantId: mongoose.Types.ObjectId,
    name :string,
    keyHash:string,
    prefix:string,
    active:boolean,
    createdAt:Date,
    updatedAt:Date
}

const apiKeySchema = new Schema<IApiKey>(
    {
        tenantId:{
            type:Schema.Types.ObjectId,
            ref:"Tenant",
            required:true,
            index:true,
        },
       name:{
          type:String,
          required:true,
          trim:true,
          maxLength:100
        },
        keyHash:{
            type:String,
            required:true,
            unique:true,
        },
        prefix:{
          type: String,
          required: true,
          trim: true,
        },
        active:{
            type:Boolean,
            default:true
        }
    },
    {
        timestamps:true
    }
);

export const ApiKeyModel = mongoose.model<IApiKey>("ApiKey",apiKeySchema);