import Avatar from './avatar'
import Image from 'next/image'
import { roboto } from '@/app/fonts'
import { useState, useEffect, useCallback } from 'react'
import MessageReaction from './messageReaction'
import { MessageActionsTypes, PresenceIcon, ToastType } from '@/app/types'
import { Channel, TimetokenUtils, MixedTextTypedElement } from '@pubnub/chat'

export default function Message ({
  received,
  avatarUrl,
  readReceipts,
  showReadIndicator = true,
  sender,
  message,
  currentUserId,
  inPinned = false,
  inThread = false
}) {
  const [actionsShown, setActionsShown] = useState(false)
  let messageHovered = false
  let actionsHovered = false

  const handleMessageMouseEnter = e => {
    messageHovered = true
    setActionsShown(true)
  }
  const handleMessageMouseLeave = e => {
    messageHovered = false
    setActionsShown(false)
  }

  function testIfActionsHovered () {
    if (messageHovered) return
    if (!actionsHovered) {
      setActionsShown(false)
    }
  }

  function handleMessageActionsEnter () {
    actionsHovered = true
    setActionsShown(true)
  }

  function handleMessageActionsLeave () {
    actionsHovered = false
    if (!messageHovered) {
      setActionsShown(false)
    }
  }


  function openLink (url) {
    window.open(url, '_blank')
  }

  async function reactionClicked (emoji, timetoken) {
    await message?.toggleReaction(emoji)
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

  //  Originally I was not writing the 'lastTimetoken' for messages I was sending myself, however
  //  that caused the Chat SDK's notion of an unread message count inconsistent, so I am removing
  //  readReceipts I set myself in this useCallback
  const determineReadStatus = useCallback((timetoken, readReceipts) => {
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
  }, [])

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
                present={-1}
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
                  message
                    .getMessageElements()
                    .map((msgPart, index) => renderMessagePart(msgPart, index))}
                {message.actions && message.actions.edited && (
                  <span className='text-navy500'>&nbsp;&nbsp;(edited)</span>
                )}
                {message.files && message.files.length > 0 && (
                  <Image
                    src={`${message.files[0].url}`}
                    alt='PubNub Logo'
                    className='absolute right-2 top-2'
                    width={25}
                    height={25}
                  />
                )}
              </div>
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
            <div className='absolute right-[10px] -bottom-[20px] flex flex-row items-center z-10 select-none'>
              {/*arrayOfEmojiReactions*/}
              {actionsShown && !message.hasUserReaction("😊") && <MessageReaction
                  emoji={"😊"}
                  messageTimetoken={message.timetoken}
                  count={0}
                  displayOverride = {true}
                  reactionClicked={reactionClicked}
                />}
              {actionsShown && !message.hasUserReaction("🐨") && <MessageReaction
                  emoji={"🐨"}
                  messageTimetoken={message.timetoken}
                  count={0}
                  displayOverride = {true}
                  reactionClicked={reactionClicked}
                />}
              {actionsShown && !message.hasUserReaction("🍊") && <MessageReaction
                  emoji={"🍊"}
                  messageTimetoken={message.timetoken}
                  count={0}
                  displayOverride = {true}
                  reactionClicked={reactionClicked}
                />}
              {actionsShown && !message.hasUserReaction("🤕") && <MessageReaction
                  emoji={"🤕"}
                  messageTimetoken={message.timetoken}
                  count={0}
                  displayOverride = {true}
                  reactionClicked={reactionClicked}
                />}
              {message.reactions
                ? Object?.keys(message.reactions)
                    .slice(0, 18)
                    .map((emoji, index) => (
                      <MessageReaction
                        emoji={emoji}
                        messageTimetoken={message.timetoken}
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
