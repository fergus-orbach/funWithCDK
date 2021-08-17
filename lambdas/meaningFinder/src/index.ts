import { SNSHandler } from 'aws-lambda'
import { Translate, TranslateTextCommand } from '@aws-sdk/client-translate'
import { SendMessageCommand, SQS } from '@aws-sdk/client-sqs'

const instantiateClients = () => ({
  translate: new Translate({}),
  sqs: new SQS({})
})

export const handler: SNSHandler = async (event) => {
  const body = JSON.parse(event.Records[0].Sns.Message)

  const { text, targetLanguage } = body;

  const clients = instantiateClients()

  const translatedText = await clients.translate.send(new TranslateTextCommand({
    SourceLanguageCode: 'auto',
    TargetLanguageCode: targetLanguage || 'es',
    Text: text
  }))

  await clients.sqs.send(new SendMessageCommand({
    MessageBody: JSON.stringify({
      translatedText: translatedText.TranslatedText,
      sourceLanguage: translatedText.SourceLanguageCode
    }, null, 2),
    QueueUrl: process.env.QUEUE_URL,
  }))
}
