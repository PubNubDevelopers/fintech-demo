//  Screen to show the conversation between two users
import Image from 'next/image'
import MessageList from '../ui-components/messageList'
import MessageInput from '../ui-components/messageInput'
import ChipView from '../ui-components/chipView'
import { useState, useEffect } from 'react'

export default function ChatScreen ({
  goBack,
  sendMoneyClick,
  requestMoneyClick,
  activeChannel,
  activeChannelMembership,
  localUser,
  remoteUser,
  balance,
  setBalance,
  showReceiptScreen
}) {
  const [typingData, setTypingData] = useState<string[]>([])

  useEffect(() => {
    if (!goBack) return
    if (!remoteUser) goBack()
  }, [remoteUser, goBack])

  useEffect(() => {
    //  Only register typing indicators for non-public channels
    if (activeChannel?.type == 'public') return
    return activeChannel?.getTyping(value => {
      const findMe = value.indexOf(localUser.id)
      if (findMe > -1) value.splice(findMe, 1)
      setTypingData(value)
    })
  }, [activeChannel, localUser])

  function sendMoney () {
    sendMoneyClick()
  }

  function requestMoney () {
    requestMoneyClick()
  }

  return (
    <div className='w-full mt-8 flex flex-col items-center'>
      <Image
        src='/icons/menu-back.svg'
        alt='Left Arrow'
        className='absolute top-10 left-2 cursor-pointer'
        onClick={() => {
          goBack()
        }}
        width={30}
        height={30}
      />

      <div className='text-lg text-center m-1'>{`Chat with ${remoteUser?.name}`}</div>

      <MessageList
        activeChannel={activeChannel}
        activeChannelMembership={activeChannelMembership}
        currentUser={localUser}
        remoteUser={remoteUser}
        balance={balance}
        setBalance={setBalance}
        showReceiptScreen={message => {
          showReceiptScreen(message)
        }}
      ></MessageList>

      <ChipView
        sendMoneyClick={() => {
          sendMoney()
        }}
        requestMoneyClick={() => {
          requestMoney()
        }}
        typingData={typingData}
        remoteUser={remoteUser}
      ></ChipView>
      <MessageInput activeChannel={activeChannel}></MessageInput>
    </div>
  )
}
