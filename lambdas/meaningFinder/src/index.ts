import { APIGatewayProxyHandler } from 'aws-lambda'
import { Translate, TranslateTextCommand } from '@aws-sdk/client-translate'

const apiResponses = {
  OK: (body: { [key: string]: any }) => {
    return {
      statusCode: 200,
      body: JSON.stringify(body, null, 2),
    };
  },
  BAD_REQUEST: (body: { [key: string]: any }) => {
    return {
      statusCode: 400,
      body: JSON.stringify(body, null, 2),
    };
  },
};

const getTargetLanguageCode = (mode: string | undefined) =>
  mode && mode === 'catalan' ? 'ca' : 'es'

export const handler: APIGatewayProxyHandler = async (event) => {
  const body = JSON.parse(event.body!)

  const { text, mode } = body;

  if(!text) {
    return apiResponses.BAD_REQUEST({message: 'no text provided'})
  }

  const client = new Translate({})
  const command = new TranslateTextCommand({
    SourceLanguageCode: 'auto',
    TargetLanguageCode: getTargetLanguageCode(mode),
    Text: text
  })

  const translatedText = await client.send(command)

  return apiResponses.OK({
    sourceLanguage: translatedText.SourceLanguageCode,
    targetLanguage: translatedText.TargetLanguageCode,
    message: translatedText.TranslatedText
  })
}
