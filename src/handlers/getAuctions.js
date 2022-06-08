import { v4 as uuid } from "uuid";
import AWS from "aws-sdk";
import middy from "@middy/core";
import httpJsonBodyParser from "@middy/http-json-body-parser";
import httpErrorHandler from "@middy/http-error-handler";
import httpEventNormalizer from "@middy/http-event-normalizer";
import createError from "http-errors";
import validator  from '@middy/validator'
import getAuctionsSchema from '../lib/schemas/getAuctionsSchema';

const dynamoDb = new AWS.DynamoDB.DocumentClient();

async function getAuctions(event, context) {
  let auctions;
  const  {status} = event.queryStringParameters;
  const params = {
    TableName: process.env.AUCTIONS_TABLE_NAME,
    IndexName: "statusAndEndDate",
    KeyConditionExpression: "#status = :status",
    ExpressionAttributeValues: {
      ":status": status,
    },
    ExpressionAttributeNames: {
      "#status": "status",
    }
  }
  try {
    const result = await dynamoDb.query(params).promise();
    auctions = result.Items;
    return {
      statusCode: 200,
      body: JSON.stringify(auctions),
    };
  } catch (error) {
    console.log(error);
    throw new createError.InternalServerError(error);
  }
}

export const handler = middy(getAuctions).use(httpJsonBodyParser()).use(httpEventNormalizer()).use(httpErrorHandler())
                        .use(validator({inputSchema: getAuctionsSchema,useDefaults: true}));
