interface ErrorPropsMessage {
  message: string
}

export default function ErrorComponent({ message }: ErrorPropsMessage) {
  return (
    <div className="flex justify-center items-center h-64 text-red-500 font-medium">{message}</div>
  )
}
