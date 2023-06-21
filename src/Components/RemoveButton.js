const RemoveButton  = ({runRemove, canRemove}) => {
    return (
        <div>
            <button
                onClick={runRemove}
                disabled={!canRemove}
            >
                Remove
            </button>
        </div>
    )
}

export default RemoveButton