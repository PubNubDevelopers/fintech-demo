'use client'

import LoginScreen from './screens/loginScreen'
import HomeScreen from './screens/homeScreen'
import CustomStatusBar from './ui-components/statusBar'
import { Chat, User, Channel } from '@pubnub/chat'
import { getAuthKey } from "@/app/getAuthKey"
import { useState, useEffect } from 'react'
import { userData } from './data/user-data'
import Image from 'next/image'

export default function Home () {
  const [showSpinner, setShowSpinner] = useState(false)
  const [device1SelectedId, setDevice1SelectedId] = useState(null)
  const [device2SelectedId, setDevice2SelectedId] = useState(null)
  const [loadMessage, setLoadMessage] = useState('Demo is initializing...')
  const [bootloadChat, setBootloadChat] = useState<Chat | null>(null)

  function handlePersonSelectedLeft (userId) {
    setDevice1SelectedId(userId)
    setShowSpinner(true)
  }

  function handlePersonSelectedRight (userId) {
    setDevice2SelectedId(userId)
  }

  async function keysetInit (localChat) {
    //  Create users in the keyset
    if (!localChat) return
    try {
      for (let i = 0; i < userData.users.length; i++)
      {
        await localChat.createUser(
          userData.users[i].id,
          {
            name: userData.users[i].name,
            profileUrl: userData.users[i].avatarUrl,
            custom: {
              phone: userData.users[i].phone
            }
          })
        }
    } catch (e) {
      console.log(e)
      return
    }
  }

  /* Initialization Logic. 
     If this is the first time loading this keyset, test whether the user
     objects exist, and create them if they do not
  */
 useEffect(()=> {
  async function init() {
    if (!process.env.NEXT_PUBLIC_PUBNUB_PUBLISH_KEY) {
      setLoadMessage('No Publish Key Found')
      return
    }
    if (!process.env.NEXT_PUBLIC_PUBNUB_SUBSCRIBE_KEY) {
      setLoadMessage('No Subscribe Key Found')
      return
    }

    const { accessManagerToken } = await getAuthKey('bootstrap')
    const localChat = await Chat.init({
      publishKey: process.env.NEXT_PUBLIC_PUBNUB_PUBLISH_KEY,
      subscribeKey: process.env.NEXT_PUBLIC_PUBNUB_SUBSCRIBE_KEY,
      userId: 'bootstrap',
      //authKey: accessManagerToken,  /* todo reintroduce this */
    })
    setBootloadChat(localChat)
    const testForBootstrapped = await localChat.getUser(userData.users[0].id)
    if (!testForBootstrapped)
    {
      //  We need to bootstrap this keyset
      setLoadMessage('Creating Users on Keyset')
      await keysetInit(localChat)
      location.reload()
    }

  }

  if (bootloadChat) return
  init()
 }, [bootloadChat])

 if (!bootloadChat) {
  return (
    <main>
      <div className='flex flex-col w-full h-screen justify-center items-center'>
        <div className='max-w-96 max-h-96 '>
          <Image
            src='/brand-icons/Fintech_Icon.svg'
            alt='Chat Icon'
            className=''
            width={1000}
            height={1000}
            priority
          />
        </div>
        <div className='flex mb-5 animate-spin'>
          <Image
            src='/icons/loading.png'
            alt='Chat Icon'
            className=''
            width={50}
            height={50}
            priority
          />
        </div>
        <div className='text-2xl select-none'>{loadMessage}</div>
      </div>
    </main>
  )
}

  return (
    <main className='flex min-h-screen flex-row size-full justify-between select-none'>
      <div className='flex flex-col min-h-screen items-center justify-center w-full bg-white'>
        <div id='login-container' className='flex flex-row gap-10'>
          <div className='sm:hidden text-center text-lg text-neutral900 font-bold'>
            This app is not designed for mobile. <br />
          </div>

          <div className='hidden sm:flex relative justify-center h-[680px] w-[350px] border-8 border-black rounded-2xl z-10 bg-gray-50 box-shadow: 10px 10px 5px 12px rgb(209, 218, 218)'>
            <span className='absolute left-2 border border-black bg-black w-6 h-6 mt-1 rounded-full z-20'></span>
            <span className='absolute -right-4 top-20 border-8 border-black h-10 rounded-md'></span>
            <span className='absolute -right-4 top-44 border-8 border-black h-24 rounded-md'></span>
            <CustomStatusBar notch={false}></CustomStatusBar>
            {!device1SelectedId ? (
              <LoginScreen
                personSelected={handlePersonSelectedLeft}
                disabledId={device2SelectedId}
                isLeft={true}
                chat={bootloadChat}
              ></LoginScreen>
            ) : (
              <HomeScreen loggedInUserId={device1SelectedId} otherUserId={device2SelectedId} logoutUser={() => {setDevice1SelectedId(null)}}></HomeScreen>
            )}
          </div>

          <div className='hidden sm:flex relative justify-center h-[680px] w-[350px] border-8 border-black rounded-2xl z-10 bg-gray-50 box-shadow: 10px 10px 5px 12px rgb(209, 218, 218)'>
            <span className='absolute border border-black bg-black w-28 h-6 rounded-br-xl rounded-bl-xl z-20'></span>
            <span className='absolute -right-4 top-20 border-8 border-black h-10 rounded-md'></span>
            <span className='absolute -right-4 top-44 border-8 border-black h-24 rounded-md'></span>
            <CustomStatusBar notch={true}></CustomStatusBar>
            {!device2SelectedId ? (
              <LoginScreen
                personSelected={handlePersonSelectedRight}
                disabledId={device1SelectedId}
                isLeft={false}
                chat={bootloadChat}
              ></LoginScreen>
            ) : (
              <HomeScreen loggedInUserId={device2SelectedId} otherUserId={device1SelectedId} logoutUser={() => {setDevice2SelectedId(null)}}></HomeScreen>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
