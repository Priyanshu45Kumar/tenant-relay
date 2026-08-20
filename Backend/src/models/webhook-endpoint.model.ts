import {Schema,model, type Document, type Types} from "mongoose";

export interface IWebhookEndpoint extends Document{
    tenantId:Types.ObjectId;
    name:string;
    url:string;
    secret:string;
    active:boolean;
    createdAt:Date;
    updatedAt:Date
}

const webhookEndpointSchema = new Schema<IWebhookEndpoint>(
    {
        tenantId:{
            type:Schema.Types.ObjectId,
            ref:"Tenant",
            required:true,
            index:true
        },

        name :{
            type:String,
            req:true,
            trim:true
        },
        url:{
            type:String,
            required:true,
            trim:true
        },

        secret:{
            type:String,
            required:true
        },

        active:{
            type:Boolean,
            default:true
        },
    },
    {
        timestamps:true,
    }
);

export const WebhookEndpointModel = model<IWebhookEndpoint>(
    "webhookendpoint",
    webhookEndpointSchema
);