import { v4 as uuid } from "uuid";
import AWS from "aws-sdk";
import middy from "@middy/core";
import httpJsonBodyParser from "@middy/http-json-body-parser";
import httpErrorHandler from "@middy/http-error-handler";
import httpEventNormalizer from "@middy/http-event-normalizer";
import createError from "http-errors";

const dynamoDb = new AWS.DynamoDB.DocumentClient();

export default function getAuctionById(id){
    let auction;
    try {
        const result = await dynamoDb
          .get({
            TableName: process.env.AUCTIONS_TABLE_NAME,
            Key: { id },
          })
          .promise();
        auction = result.Item;
      } catch (error) {
        console.log(error);
        throw new createError.InternalServerError(error);
      }
      if (!auction) {
        throw new createError.NotFound(`Auction with id ${id} not found`);
      }
        return auction;
}

async function getAuction(event, context) {
  const { id } = event.pathParameters;
    const auction = await getAuctionById(id);

  return {
    statusCode: 200,
    body: JSON.stringify(auction),
  };
}
export const handler = middy(getAuction).use(httpJsonBodyParser()).use(httpEventNormalizer()).use(httpErrorHandler());
