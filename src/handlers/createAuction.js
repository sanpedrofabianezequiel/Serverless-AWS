import { v4 as uuid } from "uuid";
import AWS from "aws-sdk";
import middy from "@middy/core";
import httpJsonBodyParser from "@middy/http-json-body-parser";
import httpErrorHandler from "@middy/http-error-handler";
import httpEventNormalizer from "@middy/http-event-normalizer";
import createError from "http-errors";
import commonMiddleware from "../lib/commonMiddleware";
import createAuctionSchema from  '../lib/schemas/createAuctionSchema';
import validator from "@middy/validator";


const dynamoDb = new AWS.DynamoDB.DocumentClient();

async function createAuction(event, context) {
  const { title } = event.body;

  const now =  new Date();
  const endDate =  new Date();
  endDate.setHours(now.getHours() + 1);

  const auction = {
    id: uuid(),
    title,
    status: "OPEN",
    createdAt: new Date().toISOString(),
    endingAt: endDate,
    highesBid:{
      amount:0,
    }
  };

  try {
    await dynamoDb.put({
      TableName: process.env.AUCTIONS_TABLE_NAME,
      Item: auction,
    }).promise();
  }catch(e) {
    console.error(e);
    throw new createError.InternalServerError(e);
  }
  
  return {
    statusCode: 201,
    body: JSON.stringify(auction),
  };
}

export const handler = commonMiddleware(createAuction)
                        .use(validator({inputSchema: createAuctionSchema}))