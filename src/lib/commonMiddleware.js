import { v4 as uuid } from "uuid";
import AWS from "aws-sdk";
import middy from "@middy/core";
import httpJsonBodyParser from "@middy/http-json-body-parser";
import httpErrorHandler from "@middy/http-error-handler";
import httpEventNormalizer from "@middy/http-event-normalizer";
import createError from "http-errors";


export default handler => middy(handler)
                            .use([
                                httpJsonBodyParser(),
                                httpEventNormalizer(),
                                httpErrorHandler(),
                            ])