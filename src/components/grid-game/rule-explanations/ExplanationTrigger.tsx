type Props = {
    isOpen: boolean
    setOpen: (open: boolean) => void
}

export const ExplanationTrigger = ({ isOpen, setOpen }: Props) => (
    <div>
        <button
            id="explanation-trigger"
            aria-controls="puzzles-explanations"
            aria-expanded={isOpen}
            onClick={() => setOpen(!isOpen)}
            title="What does this mean?"
        >
            ?
        </button>
    </div>
)
