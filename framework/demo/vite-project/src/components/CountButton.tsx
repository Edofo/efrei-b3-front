type CountButtonProps = {
    count: number
    onCount: () => void
}

export const CountButton = ({count, onCount}: CountButtonProps) => {
    return (
        <button
          type="button"
          className="counter"
          onClick={onCount}
        >
          Count is {count}
        </button>
    )
}