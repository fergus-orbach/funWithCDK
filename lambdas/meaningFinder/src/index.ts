import { SNSHandler } from 'aws-lambda'
import { Translate, TranslateTextCommand } from '@aws-sdk/client-translate'
import { SendMessageCommand, SQS } from '@aws-sdk/client-sqs'

const getTargetLanguageCode = (mode: string | undefined) =>
  mode && mode === 'catalan' ? 'ca' : 'es'

export const handler: SNSHandler = async (event) => {
  const body = JSON.parse(event.Records[0].Sns.Message)

  const { text, mode } = body;

  const client = new Translate({})
  const command = new TranslateTextCommand({
    SourceLanguageCode: 'auto',
    TargetLanguageCode: getTargetLanguageCode(mode),
    Text: text
  })

  const translatedText = await client.send(command)

  const sqsClient = new SQS({
    region: 'eu-west-1',
  })

  const sendMessageCommand = new SendMessageCommand({
    MessageBody: JSON.stringify({
      translatedText: translatedText.TranslatedText,
      sourceLanguage: translatedText.SourceLanguageCode
    }, null, 2),
    QueueUrl: process.env.DESTROY_STACK_QUEUE_URL,
  })

  await sqsClient.send(sendMessageCommand)
}
