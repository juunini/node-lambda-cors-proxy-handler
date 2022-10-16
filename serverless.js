/** @typedef { import('aws-lambda') } AWSLambda */
import axios from 'axios'

const prefix = process.env.PREFIX
const existsPrefix = () => prefix !== undefined && prefix !== ''

/**
 * @param { AWSLambda.APIGatewayEvent } event
 * 
 * @returns { Promise<AWSLambda.APIGatewayProxyResult> }
 */
export async function handler(event) {
  const url = existsPrefix() ? event.path.split(prefix)[1] : event.path.substring(1)

  return axios.get(url, { responseType: 'arraybuffer' })
    .then((response) => ({
      isBase64Encoded: true,
      statusCode: response.status,
      headers: response.headers.toJSON(),
      body: response.headers
        .getContentType()
        .includes('json')
          ? JSON.stringify(response.data)
          : response.data,
    }))
    .catch( /** @param { Error } error */ ({ message }) => 
      message === 'Invalid URL'
        ? { statusCode: 404, body: 'Not Found', isBase64Encoded: true }
        : { statusCode: 500, body: message, isBase64Encoded: true },
    )
}
