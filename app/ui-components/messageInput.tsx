import Image from 'next/image'
import Avatar from './avatar'
import { MessageDraft, User, Channel } from '@pubnub/chat'
import MentionSuggestions from './mentionSuggestions'
import { useState, useEffect, useRef } from 'react'
import { ToastType } from '@/app/types'

export default function MessageInput ({
  activeChannel
}) {
  const [text, setText] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleSend (event: React.SyntheticEvent) {
    event.preventDefault()
    if (!text || !activeChannel) return
    console.log()
    await activeChannel.sendText(text, { storeInHistory: true })
    setText('')
  }

  async function handleTyping (e) {
    if (activeChannel.type !== 'public') {
      activeChannel.startTyping()
    }
    setText(e.target.value)
  }

  return (
    <div
      className={`flex flex-col w-full items-center  border-t-navy200 select-none`}
    >
      <div className={`flex flex-row w-full items-center`}>
        <form className={`flex grow`} onSubmit={e => handleSend(e)}>
          <input
            className={`flex grow rounded-md border border-neutral-300 h-[40px] mr-1 my-2
             ml-3 px-6 text-md focus:ring-1 focus:ring-inputring outline-none placeholder:text-neutral-500`}
            ref={inputRef}
            placeholder='Type message'
            value={text}
            onChange={e => {
              handleTyping(e)
            }}
          />
        </form>
        <div
          className='cursor-pointer hover:bg-neutral-100 hover:rounded-md'
          onClick={e => handleSend(e)}
        >
          <Image
            src='/icons/send.svg'
            alt='Send'
            className='m-3 cursor-pointer'
            width={24}
            height={24}
            priority
          />
        </div>
      </div>
    </div>
  )
}
