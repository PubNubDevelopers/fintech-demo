'use client'

import Image from 'next/image'
import { useState, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function Home () {
  const [userId, setUserId] = useState('')
  const [userName, setUserName] = useState('')
  const [showSpinner, setShowSpinner] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const autofocusInput = useRef<HTMLInputElement>(null)

  const handleInputChange = e => {
    const val = e.target.value
    const valAsId = convertToId(val)
    setUserName(val)
    setUserId(valAsId)
  }

  function convertToId (orig) {
    return orig.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()
  }

  function getIdentifier () {
    const searchParamsIdentifier = searchParams.get('identifier')
    if (!searchParamsIdentifier) {
      return ''
    } else {
      return `&identifier=${searchParamsIdentifier}`
    }
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (userId === '') {
    } else {
      const identifier = getIdentifier()
      router.replace(`/chat/?userId=${userId}${identifier}`)
    }
  }

  function handleLoginButton () {
    if (userId === '') {
      autofocusInput.current?.focus()
    } else {
      setShowSpinner(true)
      const identifier = getIdentifier()
      router.replace(`/chat/?userId=${userId}${identifier}`)
    }
  }

  return (
    <main className='flex min-h-screen flex-row size-full justify-between select-none'>
      <div
        id='login-form'
        className='flex flex-col min-h-screen items-center justify-center w-full lg:w-1/2 bg-white'
      >
        <div id='login-container' className='flex flex-col max-w-80 gap-16'>
          <div className='sm:hidden text-center text-lg text-neutral900 font-bold'>
            This app is not designed for mobile. <br />
          </div>

          <div className='hidden sm:flex flex-col gap-3'>
            <Image
              src='/brand-icons/FinTech4_Icon.svg'
              alt='FinTech Icon'
              className='self-center'
              width={75}
              height={75}
              priority
            />
            <div className='text-center text-lg text-neutral900 font-bold'>
              Log in: Sample Chat App
            </div>
            <div className='flex text-center text-base text-pubnub font-normal'>
              Built with the PubNub Chat SDK for JavaScript and TypeScript.
            </div>
          </div>
          <form
            className='hidden sm:flex flex-col gap-16'
            onSubmit={handleSubmit}
          >
            <div className='flex flex-col'>
              <label className='text-sm text-neutral900'>
                Choose a User ID
              </label>
              <input
                type='text'
                ref={autofocusInput}
                value={userName}
                placeholder="Choose a Name"
                onChange={handleInputChange}
                maxLength={63}
                className={`bg-white border border-neutral300 text-neutral900 rounded-lg focus:ring-1 ${
                  userId === '' ? 'focus:ring-red-500' : 'focus:ring-inputring'
                } outline-none block w-full p-2.5`}
              />
            </div>

            <button
              type='button'
              onClick={handleLoginButton}
              className='relative bg-navy900 text-neutral50 text-sm py-3 rounded-md shadow-sm w-full'
            >
              Log in
              <div
                className={`${
                  !showSpinner && 'hidden'
                } absolute -right-[50px] bottom-0 animate-spin`}
              >
                <Image
                  src='/icons/loading.png'
                  alt='Chat Icon'
                  className=''
                  width={40}
                  height={40}
                />
              </div>
            </button>
          </form>
        </div>
      </div>
      <div
        id='welcome-graphic'
        className='hidden lg:flex min-h-screen grow items-center justify-center bg-[#132F47]'
      >
        <div className='static'>
          <div className='w-60 h-60 bg-[#E3F1FD] rounded-full blur-[120px] fixed top-[-60px] right-[-70px]'></div>
          <div className='w-60 h-60 bg-[#E3F1FD] rounded-full blur-[120px] fixed bottom-[-80px] right-[43%]'></div>
        </div>

      </div>
    </main>
  )
}
