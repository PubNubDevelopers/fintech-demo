'use client'

import LoginScreen from './screens/loginScreen'
import HomeScreen from './screens/homeScreen'
import CustomStatusBar from './ui-components/statusBar'
import { useState } from 'react'

export default function Home () {
  const [showSpinner, setShowSpinner] = useState(false)
  const [device1SelectedId, setDevice1SelectedId] = useState(1)
  const [device2SelectedId, setDevice2SelectedId] = useState(2)

  function handlePersonSelectedLeft (person) {
    setDevice1SelectedId(person)
    setShowSpinner(true)
  }

  function handlePersonSelectedRight (person) {
    setDevice2SelectedId(person)
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
            {device1SelectedId == -1 ? (
              <LoginScreen
                personSelected={handlePersonSelectedLeft}
                disabledId={device2SelectedId}
                isLeft={true}
              ></LoginScreen>
            ) : (
              <HomeScreen loggedInUser={device1SelectedId} otherUser={device2SelectedId} logoutUser={() => {setDevice1SelectedId(-1)}}></HomeScreen>
            )}
          </div>

          <div className='hidden sm:flex relative justify-center h-[680px] w-[350px] border-8 border-black rounded-2xl z-10 bg-gray-50 box-shadow: 10px 10px 5px 12px rgb(209, 218, 218)'>
            <span className='absolute border border-black bg-black w-28 h-6 rounded-br-xl rounded-bl-xl z-20'></span>
            <span className='absolute -right-4 top-20 border-8 border-black h-10 rounded-md'></span>
            <span className='absolute -right-4 top-44 border-8 border-black h-24 rounded-md'></span>
            <CustomStatusBar notch={true}></CustomStatusBar>
            {device2SelectedId == -1 ? (
              <LoginScreen
                personSelected={handlePersonSelectedRight}
                disabledId={device1SelectedId}
                isLeft={false}
              ></LoginScreen>
            ) : (
              <HomeScreen loggedInUser={device2SelectedId} otherUser={device1SelectedId} logoutUser={() => {setDevice2SelectedId(-1)}}></HomeScreen>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
