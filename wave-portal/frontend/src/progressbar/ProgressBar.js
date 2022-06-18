import React from "react";

const Filler = (props) => {
    return <div className="filler" style={{ width: `${props.percentage}%` }} />
}


const ProgressBar = (props) => {
    return (
        <div className="progress-bar">
            <Filler percentage={props.percentage} />
        </div>
    )
}


export default ProgressBar;