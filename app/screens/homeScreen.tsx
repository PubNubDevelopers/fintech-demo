//  Landing page after the user logs in
import PaymentMenuScreen from './paymentMenuScreen'
import TransferMoneyScreen from './transferMoneyScreen'
import SimulatedPushNotification from '../ui-components/simulatedPushNotification'
import ChatScreen from './chatScreen'
import ReceiptScreen from './receiptScreen'
import { Chat, User, Channel, Membership } from '@pubnub/chat'
import { TransferType, ScreenType } from '@/app/types'
import { getAuthKey } from '@/app/getAuthKey'
import { useState, useEffect } from 'react'
import { imageData } from '../data/user-data'
import { actionCompleted } from 'pubnub-demo-integration'

export default function HomeScreen ({
  loggedInUserId,
  otherUserId,
  logoutUser
}) {
  const [screen, setScreen] = useState(ScreenType.SCREEN_TOP_LEVEL)
  //  This demo app stores the balance locally but you would handle the
  //  financial aspects of the app in your dedicated backend.
  const [balance, setBalance] = useState(10000) //  In whatever fractional units are used
  const [transferType, setTransferType] = useState(TransferType.SEND)
  const [pushMessageVisible, setPushMessageVisible] = useState(false)
  const [currentPushMessage, setCurrentPushMessage] = useState('')

  //  PubNub variables
  const [chat, setChat] = useState<Chat | null>(null)
  const [localUser, setLocalUser] = useState<User | null>(null)
  const [remoteUser, setRemoteUser] = useState<User | null | undefined>(null)
  const [prepopulatedUser, setPrepopulatedUser] = useState<User | null>(null)
  const [directChannel, setDirectChannel] = useState<Channel | null>(null)
  const [directChannelMembership, setDirectChannelMembership] =
    useState<Membership | null>(null)

  //  Receipt variables
  const [receiptTransactionId, setReceiptTransactionId] = useState('')
  const [receiptSender, setReceiptSender] = useState<User | null | undefined>(
    null
  )
  const [receiptRecipient, setReceiptRecipient] = useState<
    User | null | undefined
  >(null)
  const [receiptAmount, setReceiptAmount] = useState(0)
  const [receiptReference, setReceiptReference] = useState('')
  const [receiptTimeOfRequest, setReceiptTimeOfRequest] = useState(0)
  const [receiptStatus, setReceiptStatus] = useState('')

  function sendMoneyClick (user) {
    setPrepopulatedUser(user)
    setTransferType(TransferType.SEND)
    setScreen(ScreenType.SCREEN_PAYMENT_TRANSFER)
  }

  function requestMoneyClick (user) {
    setPrepopulatedUser(user)
    setTransferType(TransferType.REQUEST)
    setScreen(ScreenType.SCREEN_PAYMENT_TRANSFER)
  }

  function chatWithFriendClicked () {
    setScreen(ScreenType.SCREEN_CHAT)
  }

  //  Handling the transfer request at this level since it can be called by either the transferMoneyScreen or the chatScreen
  async function initiateTransferRequest (
    transferType,
    transferAmount,
    recipient,
    selectedImage
  ) {
    if (transferType == TransferType.SEND) {
      //  These actions only apply to the demo hosted on pubnub.com
      actionCompleted({
        action: 'Send Money',
        blockDuplicateCalls: false,
        debug: false
      })
    } else {
      //  These actions only apply to the demo hosted on pubnub.com
      actionCompleted({
        action: 'Request Money',
        blockDuplicateCalls: false,
        debug: false
      })
    }

    let myImageFile
    if (selectedImage > 1) {
      //  Add file to message
      try {
        const fileBlob = await fetch(imageData.images[selectedImage].url).then(
          r => r.blob()
        )
        myImageFile = [
          new File([fileBlob], imageData.images[selectedImage].name, {
            type: 'image/png'
          })
        ]
      } catch (e) {
        console.log('Failed to attach file to message: ' + e)
      }
    }
    directChannel?.sendText('', {
      meta: {
        type: 'payment',
        transferType: transferType,
        amount: transferAmount,
        transactionId: makeid(8),
        reference: makeid(10)
      },
      files: myImageFile,
      storeInHistory: true
    })

    setTimeout(() => {
      if (otherUserId) {
        setScreen(ScreenType.SCREEN_CHAT)
      }
    }, 100)
  }

  async function showReceiptScreen (message) {
    setReceiptTransactionId(message.meta['transactionId'])
    setReceiptSender(message.userId == localUser?.id ? localUser : remoteUser)
    setReceiptRecipient(
      message.userId == localUser?.id ? remoteUser : localUser
    )
    setReceiptAmount(message.meta['amount'])
    setReceiptReference(message.meta['reference'])
    setReceiptTimeOfRequest(message.timetoken)
    if (message.hasThread) {
      setReceiptStatus('Transfer Completed')
    } else {
      setReceiptStatus('Transfer Pending')
    }
    setScreen(ScreenType.SCREEN_RECEIPT)
  }

  function makeid (length) {
    let result = ''
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    const charactersLength = characters.length
    let counter = 0
    while (counter < length) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength))
      counter += 1
    }
    return result
  }

  /* Initialization logic */
  useEffect(() => {
    async function init () {
      const { accessManagerToken } = await getAuthKey(loggedInUserId)
      const localChat = await Chat.init({
        publishKey: process.env.NEXT_PUBLIC_PUBNUB_PUBLISH_KEY,
        subscribeKey: process.env.NEXT_PUBLIC_PUBNUB_SUBSCRIBE_KEY,
        userId: loggedInUserId,
        typingTimeout: 5000,
        storeUserActivityTimestamps: true, //  Not used in this demo, but set these to be able to access the user.active property
        storeUserActivityInterval: 60000 /* 1 minute */,
        authKey: accessManagerToken
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
        setDirectChannelMembership(hostMembership)
      } else {
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

  useEffect(() => {
    //  UseEffect to receive new messages sent on the channel
    if (!directChannel) return

    return directChannel.connect(message => {
      if (message.meta && message.meta['type'] === 'reconciliation') {
        //  Bit of a hack, this is to simulate payment exchange which a production
        //  app would do on the server, this code handles the message sent when
        //  the remote user 'accepts' the transaction
        if (message.userId != localUser?.id) {
          const transactionAmount = message.meta['amount']
          const transactionType = message.meta['transferType']
          if (transactionType === TransferType.SEND) {
            setBalance(balance - transactionAmount)
          }
          if (transactionType === TransferType.REQUEST) {
            setBalance(balance + transactionAmount)
          }
        }
      } else {
        if (
          message.userId != localUser?.id &&
          screen != ScreenType.SCREEN_CHAT
        ) {
          if (message.meta && message.meta['transactionId']) {
            //  Payment has been received when we are not on the chat screen - show a simulated push message
            setPushMessageVisible(true)
            setCurrentPushMessage(
              `${
                message.meta['transferType'] == TransferType.SEND
                  ? 'You have been sent money.  Tap to accept'
                  : 'Money has been requested from you.  Tap to review.'
              } ${message?.content?.text}`
            )
          } else {
            //  Non-payment message has been received when we are not on the chat screen - show a simulated push message
            setPushMessageVisible(true)
            setCurrentPushMessage(
              `${remoteUser?.name}: ${message?.content?.text}`
            )
          }
        }
      }
    })
  }, [directChannel, balance, localUser, screen, remoteUser])

  //  I know this isn't the best navigation architecture! But it's only a demo :)
  if (screen == ScreenType.SCREEN_TOP_LEVEL)
    return (
      <div>
        <SimulatedPushNotification
          message={currentPushMessage}
          isVisible={pushMessageVisible}
          setIsVisible={setPushMessageVisible}
          isClicked={() => {
            setScreen(ScreenType.SCREEN_CHAT)
            setPushMessageVisible(false)
          }}
        ></SimulatedPushNotification>
        <PaymentMenuScreen
          loggedInUser={localUser}
          remoteUser={remoteUser}
          logoutUser={() => {
            setPrepopulatedUser(null)
            setChat(null)
            setLocalUser(null)
            logoutUser()
          }}
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
      </div>
    )
  if (screen == ScreenType.SCREEN_PAYMENT_TRANSFER)
    return (
      <TransferMoneyScreen
        remoteUser={remoteUser}
        transferType={transferType}
        currentBalance={balance}
        prepopulatedUser={prepopulatedUser}
        goBack={() => {
          if (prepopulatedUser) {
            setScreen(ScreenType.SCREEN_CHAT)
          } else {
            setScreen(ScreenType.SCREEN_TOP_LEVEL)
          }
        }}
        initiateTransferRequest={initiateTransferRequest}
      ></TransferMoneyScreen>
    )
  if (screen == ScreenType.SCREEN_CHAT)
    return (
      <ChatScreen
        goBack={() => {
          setScreen(ScreenType.SCREEN_TOP_LEVEL)
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
        balance={balance}
        setBalance={setBalance}
        showReceiptScreen={message => {
          showReceiptScreen(message)
        }}
      ></ChatScreen>
    )
  if (screen == ScreenType.SCREEN_RECEIPT)
    return (
      <ReceiptScreen
        goBack={() => {
          setScreen(ScreenType.SCREEN_CHAT)
        }}
        transactionId={receiptTransactionId}
        sender={receiptSender}
        recipient={receiptRecipient}
        amount={receiptAmount}
        reference={receiptReference}
        timeOfRequest={receiptTimeOfRequest}
        status={receiptStatus}
      ></ReceiptScreen>
    )
}
