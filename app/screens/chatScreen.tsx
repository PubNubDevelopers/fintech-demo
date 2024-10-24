import Image from 'next/image'
import Avatar from '../ui-components/avatar'
import Pill from '../ui-components/pill'
import MessageList from '../ui-components/messageList'
import { CurrencySymbol, TransferType } from '@/app/types'
import { userData } from '../data/user-data'
import { useState, useEffect } from 'react'

export default function ChatScreen ({
    goBack,
    loggedInUser,
    otherUser
}) {

    useEffect(() => {
        if (!otherUser || !goBack) return
        if (otherUser == -1) goBack()
      }, [otherUser, goBack])

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

      <div className='text-2xl text-center m-1'>{`Chat with ${otherUser}`}</div>

        <MessageList></MessageList>

        <div className='bg-blue-400'>I am the pills to send or request payment</div>
        <div className='bg-blue-200'>I am the message input</div>
    </div>
  )
}
