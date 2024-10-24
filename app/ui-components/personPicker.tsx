import Avatar from './avatar'

export default function PersonPicker ({
    id, 
    name,
    phone, 
    avatarUrl,
    disabled = false,
    className = '',
    personSelected = (person) => {},
}) {
  return (
    <div className={`${disabled ? 'bg-neutral-300' : 'bg-white cursor-pointer'} ${className} m-1 p-1 border-2 border-navy500 rounded-xl flex flex-row items-center gap-1`}
    onClick={() => {if (!disabled) personSelected(id)}}>
        <Avatar avatarUrl={avatarUrl} width={48} height={48}></Avatar>
        <div className='flex flex-col'>
          <div className='w-full text-xs'>{name}</div>
          <div className='w-full text-xs text-neutral-500'>{phone}</div>
        </div>
  </div>

  )
}
