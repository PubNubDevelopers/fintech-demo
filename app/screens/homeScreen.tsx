import Image from 'next/image'
import PaymentMenuScreen from './paymentMenuScreen'
import TransferMoneyScreen from './transferMoneyScreen'
import ChatScreen from './chatScreen'
import ReceiptScreen from './receiptScreen'
import { Chat, User, Channel, Membership } from '@pubnub/chat'
import { TransferType } from '@/app/types'
import { getAuthKey } from '@/app/getAuthKey'
import { useState, useEffect } from 'react'

export default function HomeScreen ({
  loggedInUserId,
  otherUserId,
  logoutUser
}) {
  //  0 is top level payment menu
  //  1 is payment transfer screen
  //  2 is the chat screen
  //  3 is the receipt screen
  const [screen, setScreen] = useState(0)
  //  todo default balance should come from app context
  const [balance, setBalance] = useState(10000) //  In whatever fractional units are used
  const [transferType, setTransferType] = useState(TransferType.SEND)

  //  PubNub variables
  const [chat, setChat] = useState<Chat | null>(null)
  const [localUser, setLocalUser] = useState<User | null>(null)
  const [remoteUser, setRemoteUser] = useState<User | null | undefined>(null)
  const [prepopulatedUser, setPrepopulatedUser] = useState<User | null>(null)
  const [directChannel, setDirectChannel] = useState<Channel | null>(null)
  const [directChannelMembership, setDirectChannelMembership] =
    useState<Membership | null>(null)

  function sendMoneyClick (user) {
    setPrepopulatedUser(user)
    setTransferType(TransferType.SEND)
    setScreen(1)
  }

  function requestMoneyClick (user) {
    setPrepopulatedUser(user)
    setTransferType(TransferType.REQUEST)
    setScreen(1)
  }

  function chatWithFriendClicked (friend) {
    console.log('chatting with ' + friend)
    setScreen(2)
  }

  async function initiateTransferRequest (
    transferType,
    transferAmount,
    recipient,
    selectedImage
  ) {
    console.log(
      'Initiating a ' +
        transferType +
        ' transfer request for ' +
        transferAmount +
        ' to ' +
        recipient
    )
    console.log(selectedImage)
    //  ToDo Send message that represents payment request
    let fileBlob
    if (selectedImage != 0) {
      //  Add file to message
      try {
        fileBlob = [
          await fetch(
            'https://pubnub-fintech-demo.netlify.app/logos/pn-logo-red-black.png'
          ).then(r => r.blob())
        ]
      } catch (e) {
        console.log('Failed to attach file to message: ' + e)
      }
    }
    await directChannel?.sendText('Test Payment', {
      meta: {
        type: 'payment',
        transferType: TransferType.SEND,
        status: 'PENDING',
        amount: transferAmount
      },
      files: fileBlob,
      storeInHistory: true
    })
    if (otherUserId) {
      setScreen(2)
    }
  }

  /* Initialization logic */
  useEffect(() => {
    async function init () {
      const { accessManagerToken } = await getAuthKey(loggedInUserId)
      console.log(loggedInUserId)
      const localChat = await Chat.init({
        publishKey: process.env.NEXT_PUBLIC_PUBNUB_PUBLISH_KEY,
        subscribeKey: process.env.NEXT_PUBLIC_PUBNUB_SUBSCRIBE_KEY,
        userId: loggedInUserId,
        typingTimeout: 5000,
        storeUserActivityTimestamps: true,
        storeUserActivityInterval: 300000 /* 5 minutes */
        //authKey: accessManagerToken,  /* todo reintroduce this */
      })
      setChat(localChat)
      setLocalUser(localChat.currentUser)
    }
    if (chat || !loggedInUserId) return
    init()
  }, [loggedInUserId, chat])

  useEffect(() => {
    if (!chat || !loggedInUserId || !otherUserId) return
    async function createChannel () {
      const localRemoteUser = await chat?.getUser(otherUserId)
      setRemoteUser(localRemoteUser)
      if (!chat || !localRemoteUser) return
      const { channel, hostMembership, inviteeMembership } =
        await chat.createDirectConversation({ user: localRemoteUser })
      setDirectChannel(channel)
      //  We are either the host or the invitee (in the latter case, if the channel already existed)
      if (hostMembership.user.id == chat?.currentUser.id) {
        console.log(hostMembership)
        setDirectChannelMembership(hostMembership)
      } else {
        console.log(inviteeMembership)
        setDirectChannelMembership(inviteeMembership)
      }
    }
    createChannel()
  }, [chat, loggedInUserId, otherUserId])

  useEffect(() => {
    if (otherUserId) return
    //  the other user has logged out
    setRemoteUser(null)
    setDirectChannel(null)
  }, [otherUserId])

  if (screen == 0)
    return (
      <PaymentMenuScreen
        loggedInUser={localUser}
        remoteUser={remoteUser}
        logoutUser={() => {
          setPrepopulatedUser(null)
          logoutUser()
        }} //  todo when log out also null out the Chat variable (if needed?)
        balance={balance}
        setBalance={setBalance}
        sendMoneyClick={() => {
          sendMoneyClick(null)
        }}
        requestMoneyClick={() => {
          requestMoneyClick(null)
        }}
        chatWithFriendClicked={chatWithFriendClicked}
      ></PaymentMenuScreen>
    )
  if (screen == 1)
    return (
      <TransferMoneyScreen
        remoteUser={remoteUser}
        transferType={transferType}
        currentBalance={balance}
        prepopulatedUser={prepopulatedUser}
        goBack={() => {
          if (prepopulatedUser) {
            setScreen(2)
          } else {
            setScreen(0)
          }
        }}
        initiateTransferRequest={initiateTransferRequest}
      ></TransferMoneyScreen>
    )
  if (screen == 2)
    return (
      <ChatScreen
        goBack={() => {
          setScreen(0)
        }}
        sendMoneyClick={() => {
          sendMoneyClick(remoteUser)
        }}
        requestMoneyClick={() => {
          requestMoneyClick(remoteUser)
        }}
        activeChannel={directChannel}
        activeChannelMembership={directChannelMembership}
        localUser={localUser}
        remoteUser={remoteUser}
      ></ChatScreen>
    )
  if (screen == 3)
    return (
      <ReceiptScreen
        goBack={() => {
          setScreen(2)
        }}
        transactionId={'5641232135101'}
        sender={localUser} //  todo This will need to be the user derived from the message - will need separate variables
        recipient={remoteUser}
        amount={10000}
        reference={'546510133'}
        timeOfRequest={'Oct 24, 2024 15:54:33'}
        timeOfTransactionComplete={'Oct 24, 2024 15:53:11'}
      ></ReceiptScreen>
    )
}
