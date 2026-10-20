import Message from './message'
import Image from 'next/image'
import { useState, useEffect, useRef } from 'react'
import { Message as pnMessage } from '@pubnub/chat'

export default function MessageList ({
  activeChannel,
  activeChannelMembership,
  currentUser,
  remoteUser,
  balance,
  setBalance,
  showReceiptScreen
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
    if (!activeChannel || !activeChannelMembership) return
    async function initMessageList () {
      setMessages([])
      activeChannel
        .getHistory({ count: 20 })
        .then(async historicalMessagesObj => {
          //  Run through the historical messages and set the most recently received one (that we were not the sender of) as read
          if (historicalMessagesObj.messages) {
            if (historicalMessagesObj.messages.length == 0) {
              setLoadingMessage('No messages in this chat yet')
            } else {
              setMessages(() => {
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

    //  Chat SDK 1.0: streamReadReceipts() is deprecated.  Fetch the current receipts, then listen for
    //  new ones, and keep the previous { [timetoken]: userIds[] } shape used by the message component
    const lastReadByUser = {}
    const updateReadReceipts = () => {
      const receipts = {}
      Object.keys(lastReadByUser).forEach(userId => {
        const timetoken = lastReadByUser[userId]
        receipts[timetoken] = [...(receipts[timetoken] ?? []), userId]
      })
      setReadReceipts(receipts as any)
    }
    activeChannel.fetchReadReceipts().then(response => {
      response.receipts.forEach(receipt => {
        if (receipt.lastReadTimetoken && !lastReadByUser[receipt.userId])
          lastReadByUser[receipt.userId] = receipt.lastReadTimetoken
      })
      updateReadReceipts()
    })
    return activeChannel.onReadReceiptReceived(receipt => {
      lastReadByUser[receipt.userId] = receipt.lastReadTimetoken
      updateReadReceipts()
    })
  }, [activeChannel])

  useEffect(() => {
    //  UseEffect to receive new messages sent on the channel
    if (!activeChannel || !activeChannelMembership) return

    return activeChannel.onMessageReceived(message => {
      if (message.meta && message.meta['type'] !== 'reconciliation') {
        if (message.userId != currentUser.id) {
          activeChannelMembership?.setLastReadMessageTimetoken(
            message.timetoken
          )
        }
        setMessages(messages => {
          return uniqueById([...messages, message]) //  Avoid race condition where message was being added twice when the channel was launched with historical messages
        })
      }
    })
  }, [activeChannel, activeChannelMembership, balance, setBalance, currentUser])

  useEffect(() => {
    //  UseEffect to receive updates to messages such as reactions.  This does NOT include new messages being received on the channel (which is handled by the connect elsewhere)
    if (!messages || messages.length == 0) return
    return pnMessage.streamUpdatesOn(messages, setMessages)
  }, [messages])

  useEffect(() => {
    if (!messageListRef.current) return
    setTimeout(() => {
      if (messageListRef.current) {
        messageListRef.current.scrollTop = messageListRef.current?.scrollHeight
      }
    }, 10) //  Some weird timing issue
  }, [messages])

  return (
    <div
      className='w-full h-full overflow-y-auto overscroll-none'
      ref={messageListRef}
    >
      {messages && messages.length == 0 && (
        <div className='flex flex-col items-center justify-end w-full h-screen text-xl select-none gap-4 mb-16'>
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

      {messages.map(message => {
        return message.deleted ? (
          <div
            key={message.timetoken}
            className='text-sm justify-self-end mr-5 bg-neutral-100 p-2 rounded-lg'
            onClick={() => {
              /*message.restore()*/
            }}
          >
            Message deleted
          </div>
        ) : (
          <Message
            key={message.timetoken}
            received={currentUser.id !== message.userId}
            avatarUrl={
              message.userId === currentUser.id
                ? currentUser.profileUrl
                : remoteUser?.profileUrl
            }
            readReceipts={readReceipts}
            showReadIndicator={activeChannel?.type !== 'public'}
            sender={
              message.userId === currentUser.id
                ? currentUser.name
                : remoteUser?.name
            }
            message={message}
            currentUserId={currentUser.id}
            activeChannel={activeChannel}
            balance={balance}
            setBalance={setBalance}
            showReceiptScreen={message => {
              showReceiptScreen(message)
            }}
          />
        )
      })}
    </div>
  )
}
