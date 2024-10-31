import { roboto } from '@/app/fonts'

export default function Pill ({
  clickAction = () => {},
  text = '',
  className = '',
  textClassName = ''
}) {
  return (
    <div
      className={`${roboto.className} ${className} flex flex-row items-center justify-between rounded px-2 gap-0.5 border border-navy500 bg-navy400 cursor-pointer`}
      onClick={() => clickAction()}
    >
      <div className={`text-white font-normal ${textClassName}`}>{text}</div>
    </div>
  )
}
