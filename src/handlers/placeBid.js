import { v4 as uuid } from "uuid";
import AWS from "aws-sdk";
import middy from "@middy/core";
import httpJsonBodyParser from "@middy/http-json-body-parser";
import httpErrorHandler from "@middy/http-error-handler";
import httpEventNormalizer from "@middy/http-event-normalizer";
import createError from "http-errors";
import getAuctionById from "./getAuction";
import validator from '@middy/validator'
import placeBidSchema  from '../lib/schemas/placeBidSchema'

const dynamoDb = new AWS.DynamoDB.DocumentClient();

async function placeBid(event, context) {
  const { id } = event.pathParameters
  const { amount } = event.body;
  const auction = await getAuctionById(id);
 
  if (auction.status !== "OPEN") {
    throw new createError.Forbidden("Auction is not open");
  }

  if(amount <= auction.highestBid.amount) {
    throw new createError.BadRequest(`Bid must be higher than current bid`);
  }
  const params = {
    TableName: process.env.AUCTIONS_TABLE_NAME,
    Key: { id },
    UpdateExpression: "set highestBid.amount = : amount",
    ExpressionAttributeValues: {
        ":amount": amount,
    },
    ReturnValues: "ALL_NEW",
  }

  let updateAuction;

  try {
      const result = await dynamoDb.update(params).promise();
        updateAuction = result.Attributes;
  } catch (error) {
      console.log(error);
        throw new createError.InternalServerError(error);
  }

  return {
    statusCode: 200,
    body: JSON.stringify(updateAuction),
  };
}
export const handler = middy(placeBid).use(httpJsonBodyParser()).use(httpEventNormalizer()).use(httpErrorHandler()).use(validator({inputSchema: placeBidSchema}));
