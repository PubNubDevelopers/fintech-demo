import Message from './message'
import Image from 'next/image'
import { useState, useEffect, useRef, useCallback } from 'react'
import {
  Channel,
  User,
  Message as pnMessage,
  Membership,
  MixedTextTypedElement,
  TimetokenUtils
} from '@pubnub/chat'

export default function MessageList ({
  activeChannel,
  activeChannelMembership,
  currentUser,
  remoteUser
}) {

  const [messages, setMessages] = useState<pnMessage[]>([])
  const [readReceipts, setReadReceipts] = useState()
  const messageListRef = useRef<HTMLDivElement>(null)
  const [loadingMessage, setLoadingMessage] = useState('')

  function uniqueById (items) {
    const set = new Set()
    return items.filter(item => {
      const isDuplicate = set.has(item.timetoken)
      set.add(item.timetoken)
      return !isDuplicate
    })
  }

  useEffect(() => {
    //  UseEffect to handle initial configuration of the Message List including reading the historical messages
    setLoadingMessage('Fetching History from Server...')
    console.log(activeChannel)
    console.log(activeChannelMembership)
    if (!activeChannel || !activeChannelMembership) return
    async function initMessageList () {
      console.log('retrieving history')
      console.log(activeChannel)
      setMessages([])
      activeChannel
        .getHistory({ count: 20 })
        .then(async historicalMessagesObj => {
          console.log(historicalMessagesObj)
          //  Run through the historical messages and set the most recently received one (that we were not the sender of) as read
          if (historicalMessagesObj.messages) {
            if (historicalMessagesObj.messages.length == 0) {
              setLoadingMessage('No messages in this chat yet')
            } else {
              setMessages(messages => {
                return uniqueById([...historicalMessagesObj.messages]) //  Avoid race condition where message was being added twice
              })
              for (
                let i = historicalMessagesObj.messages.length - 1;
                i >= 0;
                i--
              ) {
                await activeChannelMembership?.setLastReadMessageTimetoken(
                  historicalMessagesObj.messages[i].timetoken
                )
                break
              }
            }
          }
        })
    }
    initMessageList()
  }, [activeChannel, activeChannelMembership])

  useEffect(() => {
    //  UseEffect to stream Read Receipts
    if (!activeChannel) return
    if (activeChannel.type == 'public') return //  Read receipts are not supported on public channels

    activeChannel.streamReadReceipts(receipts => {
      setReadReceipts(receipts)
    })
  }, [activeChannel])

  useEffect(() => {
    //  UseEffect to receive new messages sent on the channel
    if (!activeChannel) return

    return activeChannel.connect(message => {
      activeChannelMembership?.setLastReadMessageTimetoken(message.timetoken)
      setMessages(messages => {
        return uniqueById([...messages, message]) //  Avoid race condition where message was being added twice when the channel was launched with historical messages
      })
    })
  }, [activeChannel, activeChannelMembership])

  useEffect(() => {
    //  UseEffect to receive updates to messages such as reactions.  This does NOT include new messages being received on the channel (which is handled by the connect elsewhere)
    if (!messages || messages.length == 0) return
    return pnMessage.streamUpdatesOn(messages, setMessages)
  }, [messages])

  useEffect(() => {
    //  todo test this
    if (!messageListRef.current) return
    if (
      messageListRef.current.scrollTop != 0 &&
      messageListRef.current.scrollHeight - messageListRef.current.scrollTop >
        1115
    ) {
      return //  We aren't scrolled to the bottom
    }
    setTimeout(() => {
      if (messageListRef.current) {
        messageListRef.current.scrollTop = messageListRef.current?.scrollHeight
      }
    }, 10) //  Some weird timing issue
  }, [messages])


  return (
        <div className='w-full h-full overflow-y-auto overscroll-none' ref={messageListRef}>
          {messages && messages.length == 0 && (
          <div className='flex flex-col items-center justify-center w-full h-screen text-xl select-none gap-4'>
            <Image
              src='/brand-icons/FinTech_Icon.svg'
              alt='Chat Icon'
              className=''
              width={100}
              height={100}
              priority
            />
            {loadingMessage}
          </div>
        )}

        {messages.map((message, index) => {
          return !message.deleted && (
            <Message
              key={message.timetoken}
              received={currentUser.id !== message.userId}
              avatarUrl={
                message.userId === currentUser.id
                  ? currentUser.profileUrl
                  : remoteUser?.profileUrl
              }
              isOnline={
                message.userId === currentUser.id
                  ? currentUser.active
                  : remoteUser?.active
              }
              readReceipts={readReceipts}
              showReadIndicator={activeChannel.type !== 'public'}
              sender={
                message.userId === currentUser.id
                  ? currentUser.name
                  : remoteUser?.name
              }
              message={message}
              currentUserId={currentUser.id}
            />
          )
        })}
    </div>
  )
}
