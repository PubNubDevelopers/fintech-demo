import Avatar from './avatar'
import Image from 'next/image'
import { roboto } from '@/app/fonts'
import { useState, useCallback } from 'react'
import MessageReaction from './messageReaction'
import Pill from './pill'
import { CurrencySymbol, PresenceIcon, TransferType } from '@/app/types'
import { TimetokenUtils, MixedTextTypedElement } from '@pubnub/chat'
import { actionCompleted } from 'pubnub-demo-integration'

export default function Message ({
  received,
  avatarUrl,
  readReceipts,
  showReadIndicator = true,
  sender,
  message,
  currentUserId,
  inPinned = false,
  inThread = false,
  activeChannel,
  balance,
  setBalance,
  showReceiptScreen
}) {
  const [actionsShown, setActionsShown] = useState(false)

  const handleMessageMouseEnter = () => {
    setActionsShown(true)
  }
  const handleMessageMouseLeave = () => {
    setActionsShown(false)
  }

  function openLink (url) {
    window.open(url, '_blank')
  }

  async function reactionClicked (emoji) {
    //  These actions only apply to the demo hosted on pubnub.com
    actionCompleted({
      action: 'React to a Chat Message',
      blockDuplicateCalls: false,
      debug: false
    })
    await message?.toggleReaction(emoji)
  }

  async function paymentAction (actionType, message, balance, setBalance) {
    if (actionType == 'accept') {
      const threadChannel = await message.createThread()
      await threadChannel.sendText('accepted', { meta: { type: 'acceptance' } })
      //  Bit of a hack, but obviously you would use your payment backend to handle this
      await activeChannel.sendText('', {
        meta: {
          type: 'reconciliation',
          transferType: message.meta['transferType'],
          amount: message.meta['amount']
        },
        storeInHistory: false
      })
      const transactionAmount = message.meta['amount']
      const transactionType = message.meta['transferType']
      if (transactionType == TransferType.SEND) {
        setBalance(balance + transactionAmount)
      }
      if (transactionType == TransferType.REQUEST) {
        setBalance(balance - transactionAmount)
      }
    } else if (actionType == 'viewreceipt') {
      //  These actions only apply to the demo hosted on pubnub.com
      actionCompleted({
        action: 'View a Receipt',
        blockDuplicateCalls: false,
        debug: false
      })
      showReceiptScreen(message)
    }
  }

  const determineUserReadableDate = useCallback(timetoken => {
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec'
    ]
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const date = TimetokenUtils.timetokenToDate(timetoken)
    const datetime = `${days[date.getDay()]} ${date.getDate()} ${
      months[date.getMonth()]
    } ${(date.getHours() + '').padStart(2, '0')}:${(
      date.getMinutes() + ''
    ).padStart(2, '0')}`

    return datetime
  }, [])

  //  This logic is copy / pasted from the Chat SDK demo where I was writing the 'lastTimetoken'
  //  for messages I was sending myself, but this demo does not do that, it only sets the
  //  'lastTimetoken' for messages it receives, so the findMe is redundant below.
  const determineReadStatus = useCallback(
    (timetoken, readReceipts) => {
      if (!readReceipts) return false
      for (let i = 0; i < Object.keys(readReceipts).length; i++) {
        const receipt = Object.keys(readReceipts)[i]
        const findMe = readReceipts[receipt].indexOf(currentUserId)
        if (findMe > -1) {
          readReceipts[receipt].splice(findMe, 1)
        }
        if (readReceipts[receipt].length > 0 && receipt >= timetoken) {
          return true
        }
      }
      return false
    },
    [currentUserId]
  )

  const renderMessagePart = useCallback(
    (messagePart: MixedTextTypedElement, index: number) => {
      if (messagePart?.type === 'text') {
        return <span key={index}>{messagePart.content.text}</span>
      }
      if (messagePart?.type === 'plainLink') {
        return (
          <span
            key={index}
            className='cursor-pointer underline'
            onClick={() => openLink(`${messagePart.content.link}`)}
          >
            {messagePart.content.link}
          </span>
        )
      }
      if (messagePart?.type === 'textLink') {
        return (
          <span
            key={index}
            className='cursor-pointer underline'
            onClick={() => openLink(`${messagePart.content.link}`)}
          >
            {messagePart.content.link}
          </span>
        )
      }

      return 'error'
    },
    []
  )

  const renderPayment = useCallback(
    (message, messageMeta, balance, setBalance) => {
      return (
        <div className='flex flex-col'>
          {/* Show the amount sent, received or requested */}
          {messageMeta['transferType'] == TransferType.SEND &&
            message.userId == currentUserId && (
              <div className='text-lg'>
                You Sent {CurrencySymbol}
                {(messageMeta['amount'] / 100).toFixed(2)}
              </div>
            )}
          {messageMeta['transferType'] == TransferType.SEND &&
            message.userId != currentUserId && (
              <div className='text-lg'>
                I Sent You {CurrencySymbol}
                {(messageMeta['amount'] / 100).toFixed(2)}
              </div>
            )}
          {messageMeta['transferType'] == TransferType.REQUEST &&
            message.userId == currentUserId && (
              <div className='text-lg'>
                You Requested {CurrencySymbol}
                {(messageMeta['amount'] / 100).toFixed(2)}
              </div>
            )}
          {messageMeta['transferType'] == TransferType.REQUEST &&
            message.userId != currentUserId && (
              <div className='text-lg'>
                Request received for {CurrencySymbol}
                {(messageMeta['amount'] / 100).toFixed(2)}
              </div>
            )}

          {/* Status Display */}

          {!message.hasThread && (
            <div className='text-sm'>{`Waiting for ${
              message.userId == currentUserId ? `Them` : `You`
            } to Accept`}</div>
          )}
          {message.hasThread && (
            <div className='text-sm'>{`Transfer accepted`}</div>
          )}

          {/* Status Actions */}

          {!message.hasThread && message.userId != currentUserId && (
            <Pill
              text='Accept'
              className={'self-center m-1 bg-success'}
              clickAction={() => {
                paymentAction('accept', message, balance, setBalance)
              }}
              textClassName={'text-sm'}
            ></Pill>
          )}

          {/* View Receipt */}
          <Pill
            text='View Receipt'
            className={'self-start'}
            clickAction={() => {
              paymentAction('viewreceipt', message, balance, setBalance)
            }}
            textClassName={'text-xs'}
          ></Pill>
        </div>
      )
    }, []
  )

  return (
    <div className='flex flex-col w-full'>
      <div
        className={`flex flex-row ${inThread ? '' : 'w-5/6'} my-4 ${
          inThread ? 'mx-6' : 'mx-8'
        } ${!received && !inThread && 'self-end'}`}
      >
        {received && !inThread && !inPinned && (
          <div className='min-w-11'>
            {!inThread && (
              <Avatar
                present={PresenceIcon.ONLINE}
                avatarUrl={avatarUrl ? avatarUrl : '/avatars/placeholder.png'}
              />
            )}
          </div>
        )}

        <div className='flex flex-col w-full gap-2'>
          <div
            className={`flex flex-row ${
              inThread || inPinned || received
                ? 'justify-between'
                : 'justify-end'
            }`}
          >
            {(inThread || inPinned || received) && (
              <div
                className={`${roboto.className} text-sm font-normal flex text-neutral-600`}
              >
                {sender}
                {(inThread || inPinned) && !received && ' (you)'}
              </div>
            )}
            <div
              className={`${roboto.className} text-sm font-normal flex text-neutral-600`}
            >
              {determineUserReadableDate(message.timetoken)}
            </div>
          </div>

          <div
            className={`${
              roboto.className
            } relative text-base font-normal flex text-black ${
              received ? 'bg-neutral-200' : 'bg-[#e3f1fd]'
            } p-4 rounded-b-lg ${
              received ? 'rounded-tr-lg' : 'rounded-tl-lg'
            } pb-[${!received ? '40px' : '0px'}]`}
            onMouseEnter={handleMessageMouseEnter}
            onMouseMove={handleMessageMouseEnter}
            onMouseLeave={handleMessageMouseLeave}
          >
            <div className='flex flex-col w-full'>
              {/* Will chase with the chat team to see why I need these conditions (get an error about missing 'type' if they are absent) */}
              <div className='flex flex-row items-center w-full flex-wrap'>
                {(message.content.text ||
                  message.content.plainLink ||
                  message.content.textLink ||
                  message.content.mention ||
                  message.content.channelReference) &&
                  !message.meta['type'] &&
                  message
                    .getMessageElements()
                    .map((msgPart, index) => renderMessagePart(msgPart, index))}
                {message.actions && message.actions.edited && (
                  <span className='text-navy500'>&nbsp;&nbsp;(edited)</span>
                )}
              </div>
              {message.files &&
                message.files.length > 0 &&
                message.files[0].url.includes('no-symbol') == 0 && (
                  <Image
                    src={`${message.files[0].url}`}
                    alt='Received Image'
                    className='mb-1'
                    width={50}
                    height={50}
                  />
                )}
              {message.meta &&
                message.meta['type'] == 'payment' &&
                renderPayment(message, message.meta, balance, setBalance)}
            </div>
            {!received && showReadIndicator && (
              <Image
                src={`${
                  determineReadStatus(message.timetoken, readReceipts)
                    ? '/icons/read.svg'
                    : '/icons/sent.svg'
                }`}
                alt='Read'
                className='absolute right-[10px] bottom-[14px]'
                width={21}
                height={10}
                priority
              />
            )}
            {actionsShown && (
              <div
                className='absolute top-2 right-2 cursor-pointer'
                onClick={() => {
                  message.delete({ soft: true })
                }}
              >
                <Image
                  src='/icons/bin.svg'
                  alt='delete'
                  className=''
                  width={20}
                  height={20}
                />
              </div>
            )}
            <div className='absolute right-[10px] -bottom-[20px] flex flex-row items-center z-10 select-none'>
              {/*arrayOfEmojiReactions*/}
              {actionsShown && !message.hasUserReaction('😊') && (
                <MessageReaction
                  emoji={'😊'}
                  count={0}
                  displayOverride={true}
                  reactionClicked={reactionClicked}
                />
              )}
              {actionsShown && !message.hasUserReaction('💸') && (
                <MessageReaction
                  emoji={'💸'}
                  count={0}
                  displayOverride={true}
                  reactionClicked={reactionClicked}
                />
              )}
              {actionsShown && !message.hasUserReaction('💰') && (
                <MessageReaction
                  emoji={'💰'}
                  count={0}
                  displayOverride={true}
                  reactionClicked={reactionClicked}
                />
              )}
              {actionsShown && !message.hasUserReaction('🤕') && (
                <MessageReaction
                  emoji={'🤕'}
                  count={0}
                  displayOverride={true}
                  reactionClicked={reactionClicked}
                />
              )}
              {message.reactions
                ? Object?.keys(message.reactions)
                    .slice(0, 18)
                    .map((emoji, index) => (
                      <MessageReaction
                        emoji={emoji}
                        count={message.reactions[emoji].length}
                        reactionClicked={reactionClicked}
                        key={index}
                      />
                    ))
                : ''}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
